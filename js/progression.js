// ══ PERSONALIZED PROGRESSION ══════════════════════════════════
// Estimated 1RM, per-exercise volume, and next-set suggestions derived from
// every logged session (guided, quick-logged, and manual).

function roundToHalf(n) { return Math.round(n * 2) / 2; }

// Epley formula. A single rep is already a 1RM.
function estimate1RM(weight, reps) {
  const w = Number(weight), r = Number(reps);
  if(!(w > 0) || !(r > 0)) return 0;
  if(r === 1) return w;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

// "20–25" → {min:20,max:25}; "5–8 + Drop Set" → {min:5,max:8}; "To failure" → null
function parseRepRange(str) {
  const text = String(str || '');
  const range = text.match(/(\d+)\s*[–-]\s*(\d+)/);
  if(range) return { min: Number(range[1]), max: Number(range[2]) };
  const single = text.match(/(\d+)/);
  if(single) return { min: Number(single[1]), max: Number(single[1]) };
  return null;
}

// Manual log strings: "50x10", "80 × 12", "40kg*8", "60"
function parseManualSet(str) {
  const m = String(str || '').match(/^\s*(\d+(?:\.\d+)?)\s*(?:kg)?\s*(?:[x×*]\s*(\d+))?/i);
  return m ? { weight: Number(m[1]), reps: m[2] ? Number(m[2]) : 0 } : null;
}

// ── Progression preferences ────────────────────────────────────
// increment: 'auto' (1 kg under 20 kg, else 2.5 kg) or a fixed kg step.
const PROGRESSION_DEFAULTS = { increment: 'auto' };
let progressionPrefs = safeLoad('fitdash_progression_prefs', PROGRESSION_DEFAULTS);
if(!progressionPrefs || typeof progressionPrefs !== 'object') progressionPrefs = { ...PROGRESSION_DEFAULTS };

function weightIncrement(weight) {
  const fixed = Number(progressionPrefs.increment);
  if(fixed > 0) return fixed;
  return weight < 20 ? 1 : 2.5;
}

function renderProgressionSettings() {
  const sel = document.getElementById('s-weight-increment');
  if(sel) sel.value = String(progressionPrefs.increment || 'auto');
}

function saveProgressionPrefs() {
  const sel = document.getElementById('s-weight-increment');
  const val = sel ? sel.value : 'auto';
  progressionPrefs = { ...progressionPrefs, increment: val === 'auto' ? 'auto' : Number(val) };
  save('fitdash_progression_prefs', progressionPrefs);
  if(document.getElementById('training-blocks-container')) renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
  if(typeof renderQuickLog === 'function') renderQuickLog();
  if(typeof renderExerciseProgression === 'function') renderExerciseProgression();
  const status = document.getElementById('progression-settings-status');
  if(status) status.textContent = `Saved — weight step: ${val === 'auto' ? 'auto (1 kg under 20 kg, else 2.5 kg)' : val + ' kg'}.`;
}

// Manual sessions use EXERCISES display names ("Goblet Squat (A1)"); map them
// back to plan names ("Dumbbell Goblet Squat") so both feed the same history.
function canonicalExerciseName(name) {
  for(const [planName, displayName] of Object.entries(PR_KEY_MAP)) {
    if(displayName === name) return planName;
  }
  return name;
}

function setsFromSession(session) {
  const out = [];
  Object.entries(session.exercises || {}).forEach(([key, entry]) => {
    if(!entry || typeof entry !== 'object') return;
    if('weight' in entry || 'reps' in entry) {
      if(!entry.exName) return;
      const parts = key.split('-');
      const idx = parts.length >= 3 ? parseInt(parts[parts.length - 1], 10) : NaN;
      out.push({ exName: entry.exName, weight: Number(entry.weight) || 0, reps: Number(entry.reps) || 0,
                 setIdx: Number.isFinite(idx) ? idx : null });
      return;
    }
    const exName = canonicalExerciseName(key);
    Object.entries(entry).forEach(([setKey, str]) => {
      const parsed = parseManualSet(str);
      if(!parsed) return;
      const idx = parseInt(String(setKey).replace(/\D/g, ''), 10);
      out.push({ exName, weight: parsed.weight, reps: parsed.reps, setIdx: Number.isFinite(idx) ? idx - 1 : null });
    });
  });
  return out;
}

function getAllLoggedExerciseNames() {
  const names = new Set();
  sessions.forEach(s => setsFromSession(s).forEach(set => names.add(set.exName)));
  return [...names].sort();
}

// Per-session history for one exercise, oldest first.
function getExerciseHistory(exName) {
  const hist = [];
  sessions.forEach(session => {
    const sets = setsFromSession(session).filter(set => set.exName === exName);
    if(!sets.length) return;
    let topSet = sets[0];
    sets.forEach(set => {
      const a = estimate1RM(set.weight, set.reps), b = estimate1RM(topSet.weight, topSet.reps);
      if(a > b || (a === b && set.reps > topSet.reps)) topSet = set;
    });
    hist.push({
      date: session.date,
      id: session.id || 0,
      sets,
      topSet,
      volume: Math.round(sets.reduce((sum, set) => sum + set.weight * set.reps, 0)),
      bestE1RM: estimate1RM(topSet.weight, topSet.reps),
    });
  });
  return hist.sort((a, b) => String(a.date).localeCompare(String(b.date)) || a.id - b.id);
}

// Double progression: stay at a weight until the top of the rep range is hit,
// then add a small increment and drop back to the bottom of the range.
function suggestNextSet(exName, setIdx, repTarget) {
  const hist = getExerciseHistory(exName);
  if(!hist.length) return null;
  const last = hist[hist.length - 1];
  const ref = (setIdx != null && last.sets.find(set => set.setIdx === setIdx)) || last.topSet;
  if(!ref || (!ref.weight && !ref.reps)) return null;

  const range = parseRepRange(repTarget);
  let weight = ref.weight, reps = ref.reps, reason;
  const misses = range && ref.weight && ref.reps ? countMissedSessions(hist, setIdx, ref.weight, range.min) : 0;
  if(misses >= 2) {
    weight = Math.max(0, roundToHalf(ref.weight * 0.9));
    reps = range.min;
    reason = `Under ${range.min} reps at ${ref.weight} kg ${misses} sessions running — drop ~10% and build back up`;
  } else if(!ref.weight) {
    reps = ref.reps + 1;
    reason = 'Bodyweight — beat last time by 1 rep';
  } else if(!ref.reps) {
    reps = range ? range.min : 0;
    reason = 'Same weight as last time';
  } else if(range && ref.reps >= range.max) {
    const inc = weightIncrement(ref.weight);
    weight = Math.round((ref.weight + inc) * 100) / 100;
    reps = range.min;
    reason = `Hit ${range.max} reps last time — add ${inc} kg`;
  } else if(range && ref.reps < range.min) {
    reps = range.min;
    reason = `Below ${range.min}–${range.max} last time — same weight, reach ${range.min}`;
  } else {
    reps = range ? Math.min(range.max, ref.reps + 1) : ref.reps + 1;
    reason = 'Same weight, +1 rep';
  }
  return { weight, reps, reason, last: ref, lastDate: last.date, lastE1RM: estimate1RM(ref.weight, ref.reps) };
}

// Consecutive most-recent sessions where the comparable set at `weight` fell short of `minReps`.
function countMissedSessions(hist, setIdx, weight, minReps) {
  let count = 0;
  for(let i = hist.length - 1; i >= 0; i--) {
    const h = hist[i];
    const set = (setIdx != null && h.sets.find(s => s.setIdx === setIdx)) || h.topSet;
    if(!set || set.weight !== weight || set.reps >= minReps) break;
    count++;
  }
  return count;
}

// Bests per exercise across a list of sessions: { exName: { e1rm, weight, volume } }
function getExerciseBests(sessionList = sessions) {
  const bests = {};
  sessionList.forEach(session => {
    const perEx = {};
    setsFromSession(session).forEach(set => {
      const b = perEx[set.exName] || (perEx[set.exName] = { e1rm: 0, weight: 0, volume: 0 });
      b.e1rm = Math.max(b.e1rm, estimate1RM(set.weight, set.reps));
      b.weight = Math.max(b.weight, set.weight);
      b.volume += set.weight * set.reps;
    });
    Object.entries(perEx).forEach(([name, b]) => {
      const cur = bests[name] || (bests[name] = { e1rm: 0, weight: 0, volume: 0 });
      cur.e1rm = Math.max(cur.e1rm, b.e1rm);
      cur.weight = Math.max(cur.weight, b.weight);
      cur.volume = Math.max(cur.volume, Math.round(b.volume));
    });
  });
  return bests;
}

// PRs a new session sets against prior sessions. First-ever logs of an exercise are not PRs.
function findSessionPRs(newSession, priorSessions = sessions) {
  const prior = getExerciseBests(priorSessions);
  const current = getExerciseBests([newSession]);
  const out = [];
  Object.entries(current).forEach(([exName, cur]) => {
    const prev = prior[exName];
    if(!prev) return;
    if(cur.e1rm > prev.e1rm && prev.e1rm > 0) out.push({ exName, type: 'e1RM', value: cur.e1rm, prev: prev.e1rm });
    if(cur.weight > prev.weight && prev.weight > 0) out.push({ exName, type: 'Weight', value: cur.weight, prev: prev.weight });
    if(cur.volume > prev.volume && prev.volume > 0) out.push({ exName, type: 'Volume', value: cur.volume, prev: prev.volume });
  });
  return out;
}

function renderSessionPRs(prList) {
  if(!prList.length) return '';
  const rows = prList.map(pr => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${escapeHtml(pr.exName)} · <strong>${pr.type}</strong></span><span><strong style="color:var(--green)">${pr.value} kg</strong> <span style="color:var(--muted)">(was ${pr.prev})</span></span></div>`).join('');
  return `<div class="wo-suggest" style="margin:0 0 12px"><div style="font-weight:700;color:var(--text);margin-bottom:4px">🏆 ${prList.length} new PR${prList.length > 1 ? 's' : ''}</div>${rows}</div>`;
}

// Monday-start week key for a YYYY-MM-DD date.
function weekStartStr(dateStr) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dateToStableStr(d);
}

// Total kg lifted and sets per week for the last `weeks` weeks (oldest first, includes the current week).
function getWeeklyVolume(weeks = 8) {
  const thisWeek = parseLocalDate(weekStartStr(getLocalDateStr()));
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(thisWeek); d.setDate(d.getDate() - (weeks - 1 - i) * 7);
    return { start: dateToStableStr(d), volume: 0, sets: 0 };
  });
  const byStart = Object.fromEntries(buckets.map(b => [b.start, b]));
  sessions.forEach(session => {
    const bucket = byStart[weekStartStr(session.date)];
    if(!bucket) return;
    setsFromSession(session).forEach(set => { bucket.volume += set.weight * set.reps; bucket.sets++; });
  });
  buckets.forEach(b => { b.volume = Math.round(b.volume); });
  return buckets;
}

// Change in best e1RM between the first and last session in the last `days` days.
function getE1RMTrend(exName, days = 28) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = dateToStableStr(cutoff);
  const recent = getExerciseHistory(exName).filter(h => h.date >= cutoffStr && h.bestE1RM > 0);
  if(recent.length < 2) return null;
  return Math.round((recent[recent.length - 1].bestE1RM - recent[0].bestE1RM) * 10) / 10;
}

function formatVolume(kg) { return kg >= 10000 ? (kg / 1000).toFixed(1) + 't' : kg + ' kg'; }

function formatSet(weight, reps) {
  return weight ? `${weight} kg × ${reps}` : `${reps} reps`;
}

// ── Favorite exercises (pinned to the dashboard Quick Log) ──────
let favoriteExercises = safeLoad('fitdash_fav_exercises', []);
if(!Array.isArray(favoriteExercises)) favoriteExercises = [];

function isFavoriteExercise(name) { return favoriteExercises.includes(name); }

function toggleFavoriteExercise(name) {
  if(!name) return;
  favoriteExercises = isFavoriteExercise(name)
    ? favoriteExercises.filter(n => n !== name)
    : [...favoriteExercises, name];
  save('fitdash_fav_exercises', favoriteExercises);
  if(document.getElementById('training-blocks-container')) renderTrainingBlocks(LEVEL_CONFIG[trainingLevel]);
  if(typeof renderQuickLog === 'function') renderQuickLog();
  if(typeof renderExerciseProgression === 'function') renderExerciseProgression();
}

// Suggestion for an exercise's heaviest set, using that set's rep target.
function suggestTopSet(exName, levelCfg) {
  const hist = getExerciseHistory(exName);
  if(!hist.length) return null;
  const idx = hist[hist.length - 1].topSet.setIdx;
  const target = levelCfg && levelCfg.sets && idx != null && levelCfg.sets[idx] ? levelCfg.sets[idx].reps : null;
  return suggestNextSet(exName, idx, target);
}

function renderNextSetHint(exName, levelCfg) {
  const sug = suggestTopSet(exName, levelCfg);
  if(!sug) return '';
  return `<div style="font-size:11px;color:var(--muted);margin-top:2px">Next: <strong style="color:var(--green)">${formatSet(sug.weight, sug.reps)}</strong> · last ${formatSet(sug.last.weight, sug.last.reps)}</div>`;
}
