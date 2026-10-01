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

function weightIncrement(weight) { return weight < 20 ? 1 : 2.5; }

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
  if(!ref.weight) {
    reps = ref.reps + 1;
    reason = 'Bodyweight — beat last time by 1 rep';
  } else if(!ref.reps) {
    reps = range ? range.min : 0;
    reason = 'Same weight as last time';
  } else if(range && ref.reps >= range.max) {
    const inc = weightIncrement(ref.weight);
    weight = roundToHalf(ref.weight + inc);
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
