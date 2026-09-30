// ══ QUICK LOG (dashboard one-tap logging) ═════════════════════
let favoriteFoods = safeLoad('fitdash_fav_foods', []);
if(!Array.isArray(favoriteFoods)) favoriteFoods = [];
let qlActiveExercise = null;

const QL_LOOKBACK_DAYS = 30;
const QL_MAX_FOODS = 8;
const QL_MAX_EXERCISES = 6;

function qlCutoffDate() {
  const d = new Date();
  d.setDate(d.getDate() - QL_LOOKBACK_DAYS);
  return dateToStableStr(d);
}

function isFavoriteFood(name) { return favoriteFoods.some(f => f.name === name); }

function toggleFavoriteFoodFromEntry(idx) {
  const entry = (calorieLog[getLocalDateStr()] || [])[idx];
  if(!entry || !entry.name) return;
  if(isFavoriteFood(entry.name)) {
    favoriteFoods = favoriteFoods.filter(f => f.name !== entry.name);
  } else {
    favoriteFoods.push({ name: entry.name, kcal: entry.calories, protein: entry.protein, carbs: entry.carbs,
                         fat: entry.fat, grams: entry.grams, country: entry.country || 'INT' });
  }
  save('fitdash_fav_foods', favoriteFoods);
  renderCalorieTracker();
}

function unpinFavoriteFood(name) {
  favoriteFoods = favoriteFoods.filter(f => f.name !== name);
  save('fitdash_fav_foods', favoriteFoods);
  renderCalorieTracker();
}

// Pinned foods first, then the most frequently logged foods from the last 30 days.
function getQuickFoods() {
  const cutoff = qlCutoffDate();
  const counts = {};
  Object.entries(calorieLog).forEach(([date, entries]) => {
    if(date < cutoff || !Array.isArray(entries)) return;
    entries.forEach(e => {
      if(!e || !e.name) return;
      if(!counts[e.name]) counts[e.name] = { n: 0, item: { name: e.name, kcal: e.calories, protein: e.protein, carbs: e.carbs, fat: e.fat, grams: e.grams, country: e.country || 'INT' } };
      counts[e.name].n++;
    });
  });
  const frequent = Object.values(counts)
    .filter(c => c.n >= 2 && !isFavoriteFood(c.item.name))
    .sort((a, b) => b.n - a.n)
    .map(c => c.item);
  return [...favoriteFoods.map(f => ({ ...f, pinned: true })), ...frequent].slice(0, QL_MAX_FOODS);
}

// Pinned exercises first, then most-logged in the last 30 days, then the plan's first moves.
function getQuickExercises() {
  const cutoff = qlCutoffDate();
  const counts = {};
  sessions.forEach(s => {
    if(String(s.date) < cutoff) return;
    setsFromSession(s).forEach(set => { counts[set.exName] = (counts[set.exName] || 0) + 1; });
  });
  const names = [...favoriteExercises];
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([name]) => { if(!names.includes(name)) names.push(name); });
  if(names.length < 4) {
    getFullWorkoutPlan().forEach(b => b.exercises.forEach(ex => { if(!names.includes(ex.name)) names.push(ex.name); }));
  }
  return names.slice(0, QL_MAX_EXERCISES);
}

function qlFoodButton(item) {
  const attrs = `data-name="${escapeHtml(item.name)}" data-kcal="${item.kcal||0}" data-protein="${item.protein||0}" data-carbs="${item.carbs||0}" data-fat="${item.fat||0}" data-grams="${item.grams||0}" data-country="${escapeHtml(item.country||'INT')}"`;
  return `<span class="ql-pill-wrap"><button class="pill-btn" onclick="quickLogFood(this)" ${attrs} aria-label="Log ${escapeHtml(item.name)}, ${item.kcal||0} calories">${item.pinned ? '★ ' : ''}${escapeHtml(item.name)} · ${item.kcal||0}</button>${item.pinned ? `<button class="del-btn del-btn-sm" onclick="unpinFavoriteFood(this.dataset.name)" data-name="${escapeHtml(item.name)}" title="Unpin" aria-label="Unpin ${escapeHtml(item.name)}">×</button>` : ''}</span>`;
}

function renderQuickLog() {
  const el = document.getElementById('quick-log');
  if(!el) return;
  const today = getLocalDateStr();

  const waterGoal = userGoals.waterTarget || 3000;
  const waterMl = waterLog.date === today ? waterLog.ml : 0;
  const sleepToday = sleepHistory.find(s => s.date === today);
  const lastSleep = [...sleepHistory].filter(s => s.date !== today).sort((a, b) => b.date.localeCompare(a.date))[0];
  const todayW = weights.find(w => w.date === today);
  const latestW = weights.length ? weights.reduce((best, w) => (!best || w.date > best.date) ? w : best, null) : null;
  const foodEntries = calorieLog[today] || [];
  const kcal = foodEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const kcalTarget = getTodayCalorieTarget();
  const cardioTarget = userProfile.cardioFocus === 'cardio' ? 300 : 150;
  const trainedToday = sessions.some(s => typeof s.date === 'string' && s.date.startsWith(today));

  const chip = (icon, value, label, done) =>
    `<div class="ql-chip${done ? ' done' : ''}"><div class="ql-chip-val">${icon} ${value}</div><div class="ql-chip-label">${label}</div></div>`;

  let html = `<div class="ql-status">
    ${chip('💧', `${waterMl}<span class="ql-chip-sub">/${waterGoal}</span>`, 'Water ml', waterMl >= waterGoal)}
    ${chip('😴', sleepToday ? `${sleepToday.hours}h` : '—', 'Sleep', !!sleepToday)}
    ${chip('⚖️', todayW ? todayW.val : '—', 'Weight kg', !!todayW)}
    ${chip('🍽️', `${kcal}<span class="ql-chip-sub">/${kcalTarget}</span>`, 'Calories', kcal > 0)}
    ${chip('🏃', `${cardioMins}<span class="ql-chip-sub">/${cardioTarget}</span>`, 'Cardio wk', cardioMins >= cardioTarget)}
    ${chip('🏋️', trainedToday ? '✓' : '—', 'Workout', trainedToday)}
  </div>`;

  html += `<div class="ql-row"><div class="ql-label">💧 Water</div><div class="ql-actions">
    <button class="pill-btn" onclick="quickAddWater(250)">+250 ml</button>
    <button class="pill-btn" onclick="quickAddWater(500)">+500 ml</button>
    <button class="pill-btn" onclick="quickAddWater(1000)">+1 L</button>
  </div></div>`;

  html += `<div class="ql-row"><div class="ql-label">⚖️ Weight</div><div class="ql-actions">
    <input type="number" id="ql-weight" class="ql-input" step="0.1" min="30" max="300" placeholder="kg" value="${todayW ? todayW.val : (latestW ? latestW.val : '')}" aria-label="Today's weight in kg">
    <button class="pill-btn" onclick="quickLogWeight()">${todayW ? 'Update' : 'Log'}</button>
  </div></div>`;

  const sleepBtn = sleepToday
    ? `<span class="ql-note">Logged ${sleepToday.hours}h (${escapeHtml(sleepToday.bedtime)}→${escapeHtml(sleepToday.wake)})</span>`
    : lastSleep
      ? `<button class="pill-btn" onclick="quickLogSleepLikeLast()">Same as last · ${escapeHtml(lastSleep.bedtime)}→${escapeHtml(lastSleep.wake)} (${lastSleep.hours}h)</button>`
      : '';
  html += `<div class="ql-row"><div class="ql-label">😴 Sleep</div><div class="ql-actions">
    ${sleepBtn}
    <button class="pill-btn" onclick="qlScrollTo('sleep-bedtime')">${sleepToday ? 'Edit' : 'Enter times…'}</button>
  </div></div>`;

  html += `<div class="ql-row"><div class="ql-label">🏃 Cardio</div><div class="ql-actions">
    <button class="pill-btn" onclick="quickAddCardio(10)">+10 min</button>
    <button class="pill-btn" onclick="quickAddCardio(20)">+20 min</button>
    <button class="pill-btn" onclick="quickAddCardio(30)">+30 min</button>
  </div></div>`;

  const foods = getQuickFoods();
  html += `<div class="ql-row"><div class="ql-label">🍽️ Meals</div><div class="ql-actions">
    ${foods.map(qlFoodButton).join('')}
    <button class="pill-btn" onclick="qlScrollTo('food-name-input')">Other food…</button>
  </div></div>`;
  if(!favoriteFoods.length) html += `<div class="ql-hint">Tap ☆ on a logged food below to pin it here. Foods you log often appear automatically.</div>`;

  html += `<div class="ql-row"><div class="ql-label">🏋️ Workout</div><div class="ql-actions">
    <button class="pill-btn" onclick="openPreWorkout()">▶ Start guided</button>
    ${trainedToday ? '' : '<button class="pill-btn" onclick="quickMarkWorkoutDone()">✓ Mark done</button>'}
  </div></div>`;

  const exercises = getQuickExercises();
  html += `<div class="ql-row"><div class="ql-label">💪 Sets</div><div class="ql-actions">
    ${exercises.map(name => {
      const sug = suggestTopSet(name, LEVEL_CONFIG[trainingLevel]);
      return `<button class="pill-btn${qlActiveExercise === name ? ' active' : ''}" onclick="openQuickSet(this.dataset.ex)" data-ex="${escapeHtml(name)}">${isFavoriteExercise(name) ? '★ ' : ''}${escapeHtml(name)}${sug ? ` · ${formatSet(sug.weight, sug.reps)}` : ''}</button>`;
    }).join('')}
  </div></div>`;

  if(qlActiveExercise) {
    const sug = suggestTopSet(qlActiveExercise, LEVEL_CONFIG[trainingLevel]);
    html += `<div class="ql-set-form">
      <div style="font-size:13px;font-weight:700;margin-bottom:4px">${escapeHtml(qlActiveExercise)}</div>
      <div class="ql-hint" style="margin:0 0 8px">${sug
        ? `Last: ${formatSet(sug.last.weight, sug.last.reps)}${sug.lastE1RM ? ` (e1RM ${sug.lastE1RM} kg)` : ''} · Suggested: <strong style="color:var(--green)">${formatSet(sug.weight, sug.reps)}</strong> — ${escapeHtml(sug.reason)}`
        : 'No history yet — log your first set.'}</div>
      <div class="ql-actions">
        <input type="number" id="ql-set-weight" class="ql-input" step="0.5" min="0" placeholder="kg" value="${sug ? sug.weight : ''}" aria-label="Weight in kg">
        <input type="number" id="ql-set-reps" class="ql-input" step="1" min="0" placeholder="reps" value="${sug ? sug.reps : ''}" aria-label="Reps">
        <button class="pill-btn active" onclick="quickLogSet()">✓ Log set</button>
        <button class="pill-btn" onclick="toggleFavoriteExercise(this.dataset.ex)" data-ex="${escapeHtml(qlActiveExercise)}">${isFavoriteExercise(qlActiveExercise) ? '★ Unpin' : '☆ Pin'}</button>
        <button class="pill-btn" onclick="closeQuickSet()">Close</button>
      </div>
    </div>`;
  }

  el.innerHTML = html;
}

function qlScrollTo(id) {
  const target = document.getElementById(id);
  if(!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => target.focus(), 300);
}

function quickAddWater(ml) {
  addWater(ml);
  showUndoToast(`+${ml} ml water`, () => {
    waterLog.ml = Math.max(0, waterLog.ml - ml);
    save('fitdash_water', waterLog);
    renderWater();
  });
}

function quickAddCardio(mins) {
  if(!addCardioMinutes(mins)) return;
  showUndoToast(`+${mins} min cardio`, () => {
    cardioMins = Math.max(0, cardioMins - mins);
    save('fitdash_cardio', cardioMins);
    renderCardio();
  });
}

function quickLogWeight() {
  const input = document.getElementById('ql-weight');
  if(!input) return;
  const today = getLocalDateStr();
  const previous = weights.find(w => w.date === today);
  if(!recordWeight(parseFloat(input.value))) return;
  renderDashboard();
  showUndoToast(`Weight logged: ${input.value} kg`, () => {
    weights = weights.filter(w => w.date !== today);
    if(previous) weights.push(previous);
    save('fitdash_weights', weights);
    renderProgress();
    renderDashboard();
  });
}

function quickLogSleepLikeLast() {
  const today = getLocalDateStr();
  const last = [...sleepHistory].filter(s => s.date !== today).sort((a, b) => b.date.localeCompare(a.date))[0];
  if(!last) return;
  sleepHistory = sleepHistory.filter(s => s.date !== today);
  sleepHistory.push({ date: today, bedtime: last.bedtime, wake: last.wake, hours: last.hours, quality: last.quality });
  save('fitdash_sleep', sleepHistory);
  renderSleep();
  showUndoToast(`Sleep logged: ${last.hours}h`, () => {
    sleepHistory = sleepHistory.filter(s => s.date !== today);
    save('fitdash_sleep', sleepHistory);
    renderSleep();
  });
}

function quickLogFood(button) {
  addQuickFoodEntryFromButton(button);
  const today = getLocalDateStr();
  showUndoToast(`Logged ${button.dataset.name}`, () => {
    const entries = calorieLog[today] || [];
    const idx = entries.map(e => e.name).lastIndexOf(button.dataset.name);
    if(idx === -1) return;
    entries.splice(idx, 1);
    save('fitdash_calorie_log', calorieLog);
    renderCalorieTracker();
  });
}

function getTodayQuickSession() {
  const today = getLocalDateStr();
  const existing = sessions.find(s => s.quick && s.date === today);
  if(existing) return { session: existing, created: false };
  const session = { date: today, notes: 'Quick log', quick: true, exercises: {}, setsCompleted: 0, volumeKg: 0, id: Date.now() };
  sessions.push(session);
  return { session, created: true };
}

function quickMarkWorkoutDone() {
  const { session, created } = getTodayQuickSession();
  const wasChecked = checklist.workout;
  save('fitdash_sessions', sessions);
  checklist.workout = true;
  save('fitdash_check', checklist);
  renderDashboard();
  renderTrainingHistory();
  showUndoToast('Workout marked done', () => {
    checklist.workout = wasChecked;
    save('fitdash_check', checklist);
    if(created && !Object.keys(session.exercises).length) {
      sessions = sessions.filter(s => s !== session);
      save('fitdash_sessions', sessions);
    }
    renderDashboard();
    renderTrainingHistory();
  });
}

function openQuickSet(name) {
  qlActiveExercise = qlActiveExercise === name ? null : name;
  renderQuickLog();
  if(qlActiveExercise) setTimeout(() => { const r = document.getElementById('ql-set-reps'); if(r) r.focus(); }, 50);
}

function closeQuickSet() {
  qlActiveExercise = null;
  renderQuickLog();
}

function quickLogSet() {
  const name = qlActiveExercise;
  if(!name) return;
  const weight = parseFloat(document.getElementById('ql-set-weight').value) || 0;
  const reps = parseInt(document.getElementById('ql-set-reps').value, 10) || 0;
  if(weight < 0 || reps <= 0) { alert('Enter the reps you completed.'); return; }

  const { session, created } = getTodayQuickSession();
  const key = `Q-${Date.now()}`;
  session.exercises[key] = { weight, reps, exName: name, setLabel: 'Quick set' };
  session.setsCompleted = Object.keys(session.exercises).length;
  session.volumeKg = Math.round(Object.values(session.exercises).reduce((sum, e) => sum + (e.weight || 0) * (e.reps || 0), 0));

  const prKey = PR_KEY_MAP[name] || name;
  const prevPR = prs[prKey];
  if(weight && (!prevPR || weight > prevPR.weight)) {
    prs[prKey] = { weight, date: getLocalDateStr() };
    save('fitdash_prs', prs);
  }
  save('fitdash_sessions', sessions);
  renderDashboard();
  renderTrainingHistory();
  if (soundEnabled) playSound();
  if (hapticsEnabled) playHaptic();

  showUndoToast(`${name}: ${formatSet(weight, reps)}`, () => {
    delete session.exercises[key];
    if(created && !Object.keys(session.exercises).length) sessions = sessions.filter(s => s !== session);
    session.setsCompleted = Object.keys(session.exercises).length;
    session.volumeKg = Math.round(Object.values(session.exercises).reduce((sum, e) => sum + (e.weight || 0) * (e.reps || 0), 0));
    if(prevPR) prs[prKey] = prevPR; else if(prs[prKey] && prs[prKey].weight === weight) delete prs[prKey];
    save('fitdash_prs', prs);
    save('fitdash_sessions', sessions);
    renderDashboard();
    renderTrainingHistory();
  });
}

renderQuickLog();
