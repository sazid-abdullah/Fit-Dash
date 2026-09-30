// ══ NAV ══════════════════════════════════════════════════════

let undoTimeout;
function showUndoToast(msg, onUndo) {
  const toast = document.getElementById('undo-toast');
  if(!toast) return;
  document.getElementById('undo-text').textContent = msg;
  const btn = document.getElementById('undo-btn');
  btn.onclick = () => {
    clearTimeout(undoTimeout);
    toast.style.bottom = '-100px';
    onUndo();
  };
  toast.style.bottom = '20px';
  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => { toast.style.bottom = '-100px'; }, 5000);
}
// Cache static NodeLists once — avoids repeated querySelectorAll on every navigation.
const _cachedPages = document.querySelectorAll('.page');
const _cachedTabs  = document.querySelectorAll('.nav-tab');
const _tabMap = { dashboard:0, training:1, nutrition:2, progress:3, settings:4 };
let activePageId = 'dashboard'; // tracks current page without DOM queries
function showPage(id) {
  _cachedPages.forEach(p => p.classList.remove('active'));
  _cachedTabs.forEach(t => t.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(_cachedTabs[_tabMap[id]]) _cachedTabs[_tabMap[id]].classList.add('active');
  // update aria-selected on tabs for screen readers
  _cachedTabs.forEach((t, idx) => {
    const sel = (idx === _tabMap[id]);
    t.setAttribute('aria-selected', sel ? 'true' : 'false');
    t.setAttribute('tabindex', sel ? '0' : '-1');
  });
  activePageId = id;
  if(id === 'progress') { renderProgress(); renderBodyComp(); }
  if(id === 'training') { renderTrainingHistory(); renderTrainingReminder(); }
  if(id === 'settings') { renderSettings(); }
  if(id === 'nutrition') { renderNutrition(); renderCalorieTracker(); }
  if(id === 'dashboard') { renderDashboard(); renderCalorieTracker(); }

  // Hide AI chat bubble (meal plan) on Training and Settings tabs so it doesn't block UI
  const aiBubble = document.getElementById('ai-chat-bubble');
  const aiPanel = document.getElementById('ai-chat-panel');
  if (['dashboard', 'nutrition', 'progress'].includes(id)) {
    if (aiBubble) aiBubble.style.display = 'flex';
  } else {
    if (aiBubble) aiBubble.style.display = 'none';
    if (aiPanel) aiPanel.classList.remove('open');
  }
  // Update plan visibility for the newly active page.
  if (typeof applyPlan === 'function') applyPlan(activePlan);

  window.scrollTo(0,0);
}

// Keyboard arrow navigation for the top tabs: Left/Right to move and activate
(() => {
  const tablist = document.querySelector('.nav-tabs');
  if(!tablist) return;
  tablist.addEventListener('keydown', (e) => {
    const tabs = Array.from(tablist.querySelectorAll('.nav-tab'));
    const idx = tabs.indexOf(document.activeElement);
    if(idx === -1) return;
    if(e.key === 'ArrowRight') {
      e.preventDefault();
      const next = tabs[(idx + 1) % tabs.length];
      next.focus(); next.click();
    } else if(e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      prev.focus(); prev.click();
    }
  });
})();

  

function getTodayCalorieTarget() {
  const explicit = userGoals.calTarget;
  if(Number.isFinite(explicit) && explicit > 0) return explicit;

  const p = userProfile;
  const latestW = weights.length ? weights.reduce((best,w) => (!best||w.date>best.date)?w:best, null) : null;
  const w = latestW ? latestW.val : p.weight;
  if(!p.height || !p.age || !w) return 2000;
  const bmr = (10*w) + (6.25*p.height) - (5*p.age) + (p.gender==='male' ? 5 : -161);
  const actMap = {sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};
  return Math.round(bmr * (actMap[p.activity]||1.55));
}

// ══ DASHBOARD ════════════════════════════════════════════════
function renderDashboard() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h<12 ? 'Good morning \uD83C\uDF04' : h<17 ? 'Good afternoon \u2600\uFE0F' : 'Good evening \uD83C\uDF19';
  document.getElementById('greeting').textContent = greeting;
  document.getElementById('today-date').textContent = now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  const sessionCount = sessions.length;
  document.getElementById('stat-sessions').textContent = sessionCount;
  document.getElementById('p-sessions').textContent    = sessionCount;

  // Streak
  const streak = calcStreak();
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('p-streak').textContent    = streak;

  // Total cals (progress page)
  const pCalEl = document.getElementById('p-total-cals');
  if(pCalEl) {
    const tc = totalCalsBurned();
    pCalEl.textContent = tc >= 1000 ? (tc/1000).toFixed(1)+'k' : tc;
  }

  // Today's weight — use local ISO date to match how weights are stored
  const todayW = weights.find(w => w.date === getLocalDateStr());
  document.getElementById('stat-weight').textContent = todayW ? todayW.val : '--';

  // Last session
  const lastSes = sessions[sessions.length-1];
  const dashLS = document.getElementById('dash-last-session');
  if(dashLS) dashLS.textContent = lastSes ? 'Last session: '+parseLocalDate(lastSes.date).toLocaleDateString() : 'No sessions yet';

  // Rest Day check
  const sched = userProfile.schedule || [0,1,2,3,4,5,6];
  let isRestDay = !sched.includes(now.getDay());

  // Automatically switch to "Rest Day" mode if the user already logged a session today
  const todayStr = getLocalDateStr();
  const hasTrainedToday = sessions.some(s => typeof s.date === 'string' && s.date.startsWith(todayStr));
  if (hasTrainedToday) {
    isRestDay = true;
  }
  
  const heroBtn = document.getElementById('dash-hero-btn');
  const quickTrain = document.getElementById('dash-quick-training');
  const quickRecov = document.getElementById('dash-quick-recovery');
  
  if (isRestDay) {
    if(heroBtn) {
      heroBtn.innerHTML = '🧘 &nbsp;Enjoy your Rest Day';
      heroBtn.style.background = 'var(--card)';
      heroBtn.style.color = 'var(--text)';
      heroBtn.style.border = '1px solid var(--border)';
      heroBtn.onclick = null;
    }
    if(quickTrain) quickTrain.style.display = 'none';
    if(quickRecov) quickRecov.style.display = 'flex';
  } else {
    if(heroBtn) {
      heroBtn.innerHTML = '▶ &nbsp;Start Today\'s Workout';
      heroBtn.style.background = 'var(--red)';
      heroBtn.style.color = '#fff';
      heroBtn.style.border = 'none';
      heroBtn.onclick = () => showPage('training');
    }
    if(quickTrain) quickTrain.style.display = 'flex';
    if(quickRecov) quickRecov.style.display = 'none';
  }

  renderChecklist();
  renderCardio();
  applyPlan(activePlan); // applyPlan = UI only; switchPlan also saves — don't write localStorage on every render
}

/**
 * Return a stable YYYY-MM-DD string from a Date object.
 * toDateString() output varies by browser locale (e.g. "Wed Aug 01 2026" vs "01/08/2026"),
 * which breaks Set lookups across locales. This always produces a consistent ISO format.
 */
function dateToStableStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function calcStreak() {
  if(!sessions.length) return 0;
  // Use parseLocalDate so YYYY-MM-DD strings are not shifted back one day in UTC-behind timezones.
  // Use dateToStableStr instead of toDateString() to avoid locale-dependent output format.
  const daysWithSession = new Set(sessions.map(s => dateToStableStr(parseLocalDate(s.date))));
  let streak=0, d = new Date();
  d.setHours(0,0,0,0);
  // If today not logged, start from yesterday
  if(!daysWithSession.has(dateToStableStr(d))) d.setDate(d.getDate()-1);
  while(daysWithSession.has(dateToStableStr(d))) { streak++; d.setDate(d.getDate()-1); }
  return streak;
}

// ══ WEIGHT CHART ══════════════════════════════════════════════
let weightChart = null;

function renderWeightChart() {
  // Sort chronologically before slicing — both write paths keep the array in order
  // for fresh data, but localStorage loaded from an older/imported history may not be.
  // localeCompare on ISO dates (YYYY-MM-DD) is equivalent to date-order comparison.
  const last7 = [...weights].sort((a,b) => a.date.localeCompare(b.date)).slice(-7);
  // parseLocalDate() avoids new Date("YYYY-MM-DD") treating the string as UTC midnight,
  // which shifts the displayed date back one day for users in UTC+ timezones.
  const labels = last7.map(w => parseLocalDate(w.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}));
  const data   = last7.map(w => w.val);
  const canvas = document.getElementById('weightChart');
  const ctx = canvas.getContext('2d');

  // Update accessible text summary for screen readers
  const desc = document.getElementById('weightChart-desc');
  if(desc) {
    const latest = data.length ? data[data.length-1] : null;
    const first = data.length ? data[0] : null;
    const avg = data.length ? (data.reduce((a,b) => a + b, 0) / data.length).toFixed(1) : null;
    const delta = (latest !== null && first !== null) ? (latest - first).toFixed(1) : null;
    const trend = delta !== null ? (delta > 0 ? `up ${Math.abs(delta)} kg` : (delta < 0 ? `down ${Math.abs(delta)} kg` : 'no change')) : '';
    desc.textContent = `7-day weight trend — ${data.length} entries. Latest: ${latest} kg. Average: ${avg} kg. ${trend}`;
  }

  // weightChart stays null — this chart uses custom canvas drawing, not Chart.js.
  // Canvas is redrawn fresh each call via clearRect(); no destroy() needed.

  if(!data.length) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#7070a0';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('No weight data yet', canvas.width/2, 70);
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 600;
  const H = 160;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0,0,W,H);

  const pad = {l:40,r:20,t:20,b:30};
  const minV = Math.min(...data)-2;
  const maxV = Math.max(...data)+2;
  const range = maxV - minV || 1;
  const toX = i => pad.l + (W-pad.l-pad.r)*i/(Math.max(data.length-1,1));
  const toY = v => pad.t + (H-pad.t-pad.b)*(1-(v-minV)/range);

  // Grid lines
  ctx.strokeStyle = '#2a2a3c'; ctx.lineWidth=1;
  [0,.25,.5,.75,1].forEach(f => {
    const y = pad.t + (H-pad.t-pad.b)*f;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    const val = (maxV - (maxV-minV)*f).toFixed(1);
    ctx.fillStyle='#7070a0'; ctx.font='10px system-ui'; ctx.textAlign='right';
    ctx.fillText(val, pad.l-4, y+4);
  });

  // X labels
  ctx.fillStyle='#7070a0'; ctx.font='10px system-ui'; ctx.textAlign='center';
  labels.forEach((l,i) => ctx.fillText(l, toX(i), H-4));

  // Gradient fill
  const grad = ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,'rgba(230,57,70,0.3)'); grad.addColorStop(1,'rgba(230,57,70,0)');
  ctx.beginPath();
  ctx.moveTo(toX(0), H-pad.b);
  data.forEach((_,i) => ctx.lineTo(toX(i), toY(data[i])));
  ctx.lineTo(toX(data.length-1), H-pad.b);
  ctx.closePath(); ctx.fillStyle=grad; ctx.fill();

  // Line
  ctx.beginPath();
  data.forEach((v,i) => i===0 ? ctx.moveTo(toX(i),toY(v)) : ctx.lineTo(toX(i),toY(v)));
  ctx.strokeStyle='#e63946'; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.stroke();

  // Dots
  data.forEach((v,i) => {
    ctx.beginPath(); ctx.arc(toX(i),toY(v),4,0,Math.PI*2);
    ctx.fillStyle='#e63946'; ctx.fill();
    ctx.strokeStyle='#08080e'; ctx.lineWidth=2; ctx.stroke();
  });
}

function recordWeight(val) {
  if(isNaN(val)) {
    alert('Please enter a valid weight number.');
    return false;
  }
  if(val < 30 || val > 300) {
    alert('Weight must be between 30 and 300 kg.');
    return false;
  }
  const today = getLocalDateStr();
  weights = weights.filter(w => w.date !== today);
  weights.push({date:today, val});
  save('fitdash_weights', weights);
  document.getElementById('stat-weight').textContent = val;
  renderProgress();
  return true;
}

function logWeight() {
  if(!recordWeight(parseFloat(document.getElementById('weight-input').value))) return;
  document.getElementById('weight-input').value = '';
  if(typeof renderQuickLog === 'function') renderQuickLog();
}

function deleteWeight(date) {
  if(!confirm(`Delete weight entry for ${date}?`)) return;
  weights = weights.filter(w => w.date !== date);
  save('fitdash_weights', weights);
  // Refresh the dashboard kg stat in case today's entry was removed
  const todayW = weights.find(w => w.date === getLocalDateStr());
  const statEl = document.getElementById('stat-weight');
  if(statEl) statEl.textContent = todayW ? todayW.val : '--';
  renderProgress();
}

function clearWeightHistory() {
  if(!confirm('Clear all weight history? This cannot be undone.')) return;
  weights = [];
  save('fitdash_weights', weights);
  const statEl = document.getElementById('stat-weight');
  if(statEl) statEl.textContent = '—';
  renderProgress();
}

function renderWeightHistory() {
  const el = document.getElementById('weight-history-list');
  if(!el) return;
  if(!weights.length) { el.innerHTML = ''; return; }
  // Show up to 10 most recent entries, newest first
  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  el.innerHTML = sorted.map(w => `
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px;color:var(--muted)">${w.date}</span>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:15px;font-weight:700;color:var(--text)">${w.val} kg</span>
        <button onclick="deleteWeight('${w.date}')"
          title="Delete this entry"
          class="del-btn del-btn-md">×</button>
      </div>
    </div>`).join('');
}

// ══ PROGRESS PAGE ════════════════════════════════════════════
function renderProgress() {
  renderDashboard();
  renderProgressSummary();
  renderWeekStreak();
  renderWeightChart();
  renderWeightHistory();
  renderPRs();
  renderCircChart();
  renderPRVolumeChart();
  renderExerciseProgression();
  renderNutritionHistory();
  renderHistoryList();
}

function renderNutritionHistory() {
  const el = document.getElementById('nutrition-history-chart');
  if(!el) return;
  const today = new Date();
  const days = Array.from({length:7}, (_, index) => {
    const date = new Date(today); date.setDate(today.getDate() - (6 - index));
    const key = dateToStableStr(date);
    return { key, label:date.toLocaleDateString('en-US',{weekday:'short'}), calories:(calorieLog[key] || []).reduce((sum, entry) => sum + Number(entry.calories || 0), 0) };
  });
  const max = Math.max(...days.map(day => day.calories), 1);
  el.innerHTML = days.map(day => `<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px"><span style="font-size:10px;color:var(--muted)">${day.calories || ''}</span><div style="width:100%;height:${Math.max(4, Math.round(day.calories / max * 82))}px;background:var(--green);border-radius:4px 4px 0 0"></div><span style="font-size:10px;color:var(--muted)">${day.label}</span></div>`).join('');
}

function renderExerciseProgression() {
  const select = document.getElementById('progress-exercise-select');
  const output = document.getElementById('exercise-progression-output');
  if(!select || !output) return;
  const names = getAllLoggedExerciseNames();
  const previous = select.value;
  select.innerHTML = names.length
    ? names.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')
    : '<option value="">No exercise logs yet</option>';
  if(names.includes(previous)) select.value = previous;
  if(!names.length) {
    output.innerHTML = '<div style="font-size:12px;color:var(--muted)">Complete a guided workout or log a set from Quick Log to see exercise progression.</div>';
    return;
  }
  const selected = select.value;
  const hist = getExerciseHistory(selected);
  const setCount = hist.reduce((n, h) => n + h.sets.length, 0);
  const bestE1RM = Math.max(0, ...hist.map(h => h.bestE1RM));
  const bestWeight = Math.max(0, ...hist.map(h => Math.max(...h.sets.map(set => set.weight))));
  const totalVolume = hist.reduce((sum, h) => sum + h.volume, 0);
  const sug = suggestTopSet(selected, LEVEL_CONFIG[trainingLevel]);
  const recent = hist.slice(-12);
  const maxE = Math.max(1, ...recent.map(h => h.bestE1RM));
  const maxV = Math.max(1, ...recent.map(h => h.volume));
  const volTotalLabel = totalVolume >= 10000 ? (totalVolume/1000).toFixed(1) + 't' : totalVolume + 'kg';

  output.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">
    <div class="stat-card"><div class="stat-num">${setCount}</div><div class="stat-label">Sets logged</div></div>
    <div class="stat-card"><div class="stat-num">${bestWeight}</div><div class="stat-label">Best kg</div></div>
    <div class="stat-card"><div class="stat-num">${bestE1RM || '—'}</div><div class="stat-label">Best e1RM</div></div>
    <div class="stat-card"><div class="stat-num">${volTotalLabel}</div><div class="stat-label">Total volume</div></div>
  </div>
  ${sug ? `<div class="wo-suggest">🎯 Next session: <strong style="color:var(--green)">${formatSet(sug.weight, sug.reps)}</strong> — ${escapeHtml(sug.reason)}</div>` : ''}
  ${recent.length > 1 ? `<div style="display:flex;gap:12px;font-size:10px;color:var(--muted);margin:10px 0 4px"><span><span style="display:inline-block;width:8px;height:8px;background:var(--yellow);border-radius:2px"></span> e1RM</span><span><span style="display:inline-block;width:8px;height:8px;background:var(--blue);border-radius:2px"></span> Volume</span></div>
  <div style="display:flex;align-items:flex-end;gap:4px;height:70px;margin-bottom:10px" aria-label="e1RM and volume per session">${recent.map(h => `<div style="flex:1;display:flex;gap:1px;align-items:flex-end;height:100%" title="${escapeHtml(h.date)}: e1RM ${h.bestE1RM} kg, volume ${h.volume} kg">
      <div style="flex:1;height:${Math.max(4, Math.round(h.bestE1RM / maxE * 100))}%;background:var(--yellow);border-radius:2px 2px 0 0"></div>
      <div style="flex:1;height:${Math.max(4, Math.round(h.volume / maxV * 100))}%;background:var(--blue);border-radius:2px 2px 0 0"></div>
    </div>`).join('')}</div>` : ''}
  <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:4px 12px;font-size:12px;align-items:center">
    <span style="color:var(--muted);font-size:10px">Date</span><span style="color:var(--muted);font-size:10px">Top set</span><span style="color:var(--muted);font-size:10px">e1RM</span><span style="color:var(--muted);font-size:10px">Volume</span>
    ${hist.slice(-8).reverse().map(h => `<span>${escapeHtml(h.date)} <span style="color:var(--muted)">(${h.sets.length} sets)</span></span><strong>${formatSet(h.topSet.weight, h.topSet.reps)}</strong><span>${h.bestE1RM || '—'}</span><span>${h.volume} kg</span>`).join('')}
  </div>`;
}

function renderProgressSummary() {
  const sleepAvgEl = document.getElementById('ps-sleep');
  const waterEl = document.getElementById('ps-water');
  const weightEl = document.getElementById('ps-weight-change');
  const bfEl = document.getElementById('ps-bf-progress');

  const last7 = [...sleepHistory].sort((a,b) => a.date.localeCompare(b.date)).slice(-7);
  const avgSleep = last7.length ? (Math.round((last7.reduce((sum,s) => sum + s.hours, 0) / last7.length) * 10) / 10) : null;
  if(sleepAvgEl) sleepAvgEl.textContent = avgSleep ? `${avgSleep}h` : 'No data';

  const todayWater = waterLog.date === getLocalDateStr() ? waterLog.ml : 0;
  const waterTarget = userGoals.waterTarget || 3000;
  const waterPct = Math.min(100, waterTarget ? Math.round(todayWater / waterTarget * 100) : 0);
  if(waterEl) waterEl.textContent = `${waterPct}%`;

  const sortedWeights = [...weights].sort((a,b) => a.date.localeCompare(b.date));
  const recent = sortedWeights.slice(-8);
  if(weightEl) {
    if(recent.length > 1) {
      const first = recent[0].val;
      const last = recent[recent.length-1].val;
      const diff = Math.round((last - first) * 10) / 10;
      weightEl.textContent = `${diff >= 0 ? '+' : ''}${diff}kg`;
    } else {
      weightEl.textContent = 'Not enough data';
    }
  }

  const bodyDiff = bodyComp.length > 1 ? Math.round((bodyComp[bodyComp.length-1].bf - bodyComp[0].bf) * 10) / 10 : null;
  if(bfEl) bfEl.textContent = bodyDiff !== null ? `${bodyDiff > 0 ? '+' : ''}${bodyDiff}%` : 'No data';
}

async function generateWeeklyReport() {
  const button = document.getElementById('weekly-report-btn');
  const status = document.getElementById('weekly-report-status');
  const output = document.getElementById('weekly-report-output');
  if(providerRequiresApiKey(aiConfig.provider) && !aiConfig.apiKey) {
    status.textContent = 'Set up an AI provider in Settings first.';
    status.style.color = 'var(--orange)';
    return;
  }
  if(aiConfig.shareHealthData === false) {
    status.textContent = 'Enable health and progress data sharing in AI settings to generate a personal report.';
    status.style.color = 'var(--orange)';
    return;
  }

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  const startKey = dateToStableStr(start);
  const endKey = dateToStableStr(today);
  const weekSessions = sessions.filter(session => session.date >= startKey && session.date <= endKey);
  const weekWeights = weights.filter(weight => weight.date >= startKey && weight.date <= endKey);
  const weekFood = Object.entries(calorieLog)
    .filter(([date]) => date >= startKey && date <= endKey)
    .flatMap(([, foods]) => foods || []);
  const weekSleep = sleepHistory.filter(entry => entry.date >= startKey && entry.date <= endKey);
  const foodCalories = weekFood.reduce((total, food) => total + (food.calories || 0), 0);
  const averageSleep = weekSleep.length
    ? (weekSleep.reduce((total, entry) => total + Number(entry.hours || 0), 0) / weekSleep.length).toFixed(1)
    : 'no data';
  const reportData = `Period: ${startKey} to ${endKey}
Training sessions: ${weekSessions.length}
Cardio logged this week: ${cardioMins} minutes
Weight entries: ${weekWeights.map(weight => `${weight.date}: ${weight.val}kg`).join(', ') || 'none'}
Food calories logged: ${foodCalories} across ${weekFood.length} entries
Average sleep: ${averageSleep} hours
Personal records: ${Object.keys(prs).length}`;

  button.disabled = true;
  status.textContent = 'Generating report...';
  status.style.color = 'var(--muted)';
  output.textContent = '';
  try {
    const response = await callAI([
      { role:'system', content:buildSystemPrompt() },
      { role:'user', content:`Create a concise weekly fitness report from this data. Include: wins, risks or missing data, and 3 practical priorities for next week. Do not invent measurements or medical conclusions.\n\n${reportData}` }
    ]);
    output.innerHTML = formatAIResponse(response);
    status.textContent = 'Report generated.';
    status.style.color = 'var(--green)';
  } catch(err) {
    status.textContent = `Report failed: ${err.message.slice(0,140)}`;
    status.style.color = 'var(--red)';
  } finally {
    button.disabled = false;
  }
}

function renderWeekStreak() {
  const el = document.getElementById('streak-bar');
  if(!el) return;
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date();
  const todayDay = (today.getDay()+6)%7; // 0=Mon
  // dateToStableStr avoids locale-dependent toDateString() output (e.g. "Wed Aug 01" varies by locale)
  const daysWithSession = new Set(sessions.map(s=>dateToStableStr(parseLocalDate(s.date))));
  el.innerHTML = days.map((d,i) => {
    const dt = new Date(today);
    dt.setDate(today.getDate()-(todayDay-i));
    const done = daysWithSession.has(dateToStableStr(dt));
    const isToday = i === todayDay;
    return `<div class="streak-day ${done?'done':''} ${isToday?'today':''}">${d}</div>`;
  }).join('');
}

function renderHistoryList() {
  const el = document.getElementById('history-list');
  if(!el) return;
  if(!sessions.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No sessions yet.<br>Log your first workout on the Training page.</p></div>';
    return;
  }
  const sorted = [...sessions].reverse().slice(0,20);
  el.innerHTML = sorted.map(s => {
    const d        = parseLocalDate(s.date);
    const dateStr  = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const durLabel = s.durationSecs
      ? `⏱ ${String(Math.floor(s.durationSecs/60)).padStart(2,'0')}:${String(s.durationSecs%60).padStart(2,'0')}`
      : '';
    const calLabel = s.caloriesBurned ? `🔥 ${s.caloriesBurned} cal` : '';
    const volLabel = s.volumeKg       ? `📦 ${s.volumeKg} kg` : `${countSets(s)} sets`;
    const chips    = [dateStr, durLabel, calLabel, volLabel].filter(Boolean).join(' · ');
    return `<div class="history-item">
      <div class="history-date">
        <div class="history-day">${d.toLocaleDateString('en-US',{weekday:'short'})}</div>
        <div class="history-dd">${d.getDate()}</div>
      </div>
      <div class="history-body" style="flex:1">
        <div class="history-title">Full Body Session</div>
        <div class="history-detail" style="color:var(--muted2);font-size:11px">${chips}</div>
        ${s.notes?`<div class="history-detail" style="margin-top:3px;color:var(--muted)">${escapeHtml(s.notes.slice(0,80))}</div>`:''}
      </div>
      <button onclick="deleteSession(${s.id})" title="Delete this session" class="del-btn del-btn-md" style="flex-shrink:0;margin-left:8px">×</button>
    </div>`;
  }).join('');
}

function exportCSV() {
  if(!sessions.length) {
    alert('No sessions to export yet. Log a workout first.');
    return;
  }
  const header = 'Date,Duration(min),Calories,Volume(kg),Sets,Notes';
  const rows   = sessions.map(s => {
    const dur = s.durationSecs ? (s.durationSecs/60).toFixed(1) : '';
    return [
      s.date,
      dur,
      s.caloriesBurned || '',
      s.volumeKg       || '',
      countSets(s),
      `"${(s.notes||'').replace(/"/g,'""')}"`
    ].join(',');
  });
  const csv = [header, ...rows].join('\n');
  // data: URIs have strict browser length limits and silently fail on large histories.
  // Blob + createObjectURL works for any size and is revoked immediately after click.
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'workout-log.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clearHistory() {
  if(!confirm('Clear all session history? This cannot be undone.')) return;
  sessions=[];
  save('fitdash_sessions', sessions);
  renderDashboard();           // ← streak, session count, last session label were left stale without this
  renderTrainingHistory();     // ← history list on Training tab also stale without this
  renderProgress();
}

// ══ SETTINGS ═════════════════════════════════════════════
let userProfile = safeLoad('fitdash_profile', {});
let userGoals   = safeLoad('fitdash_goals', {});
let aiConfig    = safeLoad('fitdash_ai_config', { provider:'groq', model:'llama-3.1-8b-instant', apiKey:'', apiKeys:{}, storeKey:false, shareHealthData:true });

function getProviderApiKey(provider) {
  if(!aiConfig.apiKeys || typeof aiConfig.apiKeys !== 'object') aiConfig.apiKeys = {};
  if(aiConfig.apiKey && !aiConfig.apiKeys[aiConfig.provider]) aiConfig.apiKeys[aiConfig.provider] = aiConfig.apiKey;
  return aiConfig.apiKeys[provider] || '';
}

const CUSTOM_MODEL_VALUE = '__custom_model__';

var AI_MODELS = {
  groq: [
    { id:'llama-3.1-8b-instant', name:'Llama 3.1 8B (fast)' },
    { id:'llama-3.3-70b-versatile', name:'Llama 3.3 70B (quality)' },
    { id:'deepseek-r1-distill-llama-70b', name:'DeepSeek R1 70B' },
  ],
  gemini: [
    { id:'gemini-2.5-flash-lite', name:'Gemini 2.5 Flash-Lite (free)' },
    { id:'gemini-2.5-flash', name:'Gemini 2.5 Flash (free)' },
  ],
  openrouter: [
    { id:'openrouter/auto', name:'OpenRouter Auto (recommended)' },
    { id:'meta-llama/llama-3.1-8b-instruct', name:'Llama 3.1 8B' },
    { id:'mistralai/mistral-7b-instruct', name:'Mistral 7B' },
    { id:'deepseek/deepseek-r1', name:'DeepSeek R1' },
  ],
  ollama: [
    { id:'llama3.2', name:'Llama 3.2 (local)' },
    { id:'qwen2.5:7b', name:'Qwen 2.5 7B (local)' },
    { id:'gemma3:4b', name:'Gemma 3 4B (local)' },
  ]
};

function renderSettings() {
  const p = userProfile;
  const g = userGoals;
  const a = aiConfig;
  if(p.height)   document.getElementById('s-height').value = p.height;
  if(p.weight)   document.getElementById('s-weight').value = p.weight;
  if(p.age)      document.getElementById('s-age').value = p.age;
  if(p.gender)   document.getElementById('s-gender').value = p.gender;
  if(p.activity) document.getElementById('s-activity').value = p.activity;
  if(g.targetWeight) document.getElementById('s-target-weight').value = g.targetWeight;
  if(g.targetBF)     document.getElementById('s-target-bf').value = g.targetBF;
  if(g.calTarget)    document.getElementById('s-cal-target').value = g.calTarget;
  if(g.proteinTarget) document.getElementById('s-protein-target').value = g.proteinTarget;
  if(g.carbTarget) document.getElementById('s-carb-target').value = g.carbTarget;
  if(g.fatTarget) document.getElementById('s-fat-target').value = g.fatTarget;
  if(g.waterTarget)  document.getElementById('s-water-target').value = g.waterTarget;
  const equipment = p.equipment || [];
  document.querySelectorAll('#equipment-options input').forEach(input => { input.checked = equipment.includes(input.value); });
  document.getElementById('s-limitations').value = p.limitations || '';
  document.getElementById('s-reminder-enabled').checked = p.reminderEnabled !== false;
  document.getElementById('s-reminder-time').value = p.reminderTime || '18:00';
  document.getElementById('s-cardio-focus').value = p.cardioFocus || 'strength';
  renderCardioPlan();
  renderSavedGroceryList();
  if(g.cuisinePref)  document.getElementById('s-cuisine').value = g.cuisinePref;
  selectGoal(g.goalType || 'recomp');
  if(a.provider) document.getElementById('s-ai-provider').value = a.provider;
  document.getElementById('s-api-store').checked = !!a.storeKey;
  document.getElementById('s-ai-share-health').checked = a.shareHealthData !== false;
  loadModelOptions(a.model);
  renderVideoCodeLibrary();
  
  const sched = p.schedule || [0,1,2,3,4,5,6]; // default all days
  document.querySelectorAll('.day-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', sched.includes(parseInt(btn.dataset.day)));
  });
}

function saveProfileSettings() {
  const h = parseFloat(document.getElementById('s-height').value) || null;
  const w = parseFloat(document.getElementById('s-weight').value) || null;
  const a = parseInt(document.getElementById('s-age').value) || null;

  if (h && (h < 100 || h > 250)) { alert('Invalid height'); return; }
  if (w && (w < 30 || w > 300)) { alert('Invalid weight'); return; }
  if (a && (a < 10 || a > 100)) { alert('Invalid age'); return; }

  userProfile = {
    ...userProfile,
    height: h,
    weight: w,
    age: a,
    gender:   document.getElementById('s-gender').value,
    activity: document.getElementById('s-activity').value,
  };
  save('fitdash_profile', userProfile);
  // sync to pre-workout modal too
  save('fitdash_profile', { ...userProfile, height: userProfile.height, age: userProfile.age, gender: userProfile.gender, activity: userProfile.activity, weight: userProfile.weight });
  alert('Profile saved!');
}

function saveScheduleSettings() {
  const sched = [];
  document.querySelectorAll('.day-toggle-btn').forEach(btn => {
    if(btn.classList.contains('active')) sched.push(parseInt(btn.dataset.day));
  });
  userProfile.schedule = sched;
  save('fitdash_profile', userProfile);
  alert('Schedule saved!');
  renderDashboard(); // Update dashboard if today became a rest day
}

function saveTrainingPreferences() {
  userProfile.equipment = [...document.querySelectorAll('#equipment-options input:checked')].map(input => input.value);
  userProfile.limitations = document.getElementById('s-limitations').value.trim();
  userProfile.reminderEnabled = document.getElementById('s-reminder-enabled').checked;
  userProfile.reminderTime = document.getElementById('s-reminder-time').value || '18:00';
  userProfile.cardioFocus = document.getElementById('s-cardio-focus').value;
  save('fitdash_profile', userProfile);
  renderCardioPlan();
  alert('Training preferences saved!');
}

function renderCardioPlan() {
  const el = document.getElementById('cardio-plan-preview');
  if(!el) return;
  const focus = userProfile.cardioFocus || 'strength';
  const total = focus === 'cardio' ? 300 : 150;
  const trainingDays = (userProfile.schedule || [1,3,5]).filter(day => day !== 0).slice(0,3);
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const minutes = trainingDays.length ? Math.floor(total / trainingDays.length) : total;
  const remainder = trainingDays.length ? total - minutes * trainingDays.length : 0;
  const plan = trainingDays.map((day, index) => `${names[day]}: ${minutes + (index === 0 ? remainder : 0)} min LISS cardio`).join(' · ');
  el.innerHTML = `<div style="font-size:12px;font-weight:700">Weekly cardio target: ${total} minutes</div><div style="font-size:12px;color:var(--muted);margin-top:5px">${plan || 'Choose training days to build a cardio plan.'}</div>`;
}

function setPlanningStatus(message, color) {
  const el = document.getElementById('planning-tools-status');
  if(el) { el.textContent = message; el.style.color = color || 'var(--muted)'; }
}

function renderSavedGroceryList() {
  const el = document.getElementById('saved-grocery-list');
  if(!el) return;
  const list = safeLoad('fitdash_grocery_list', []);
  el.innerHTML = list.length ? `<strong>Saved grocery list</strong><br>${list.map(item => `• ${escapeHtml(item)}`).join('<br>')}` : '';
}

function downloadText(filename, text, type='text/plain') {
  const url = URL.createObjectURL(new Blob([text], {type}));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function generateGroceryList() {
  if(providerRequiresApiKey(aiConfig.provider) && !aiConfig.apiKey) { setPlanningStatus('Set up an AI provider first.', 'var(--orange)'); return; }
  setPlanningStatus('Generating grocery list...');
  try {
    const response = await callAI([{role:'system',content:'Create a concise grocery list. Group items by protein, produce, grains, dairy, and pantry. Return plain text only.'},{role:'user',content:`Build a grocery list from my selected ${activePlan} meal plan and ${userGoals.cuisinePref || 'both'} cuisine preference. Include practical quantities for one week.`}]);
    downloadText('fitdash-grocery-list.txt', response);
    setPlanningStatus('Grocery list downloaded.');
  } catch(err) { setPlanningStatus(`Grocery list failed: ${err.message.slice(0,100)}`, 'var(--red)'); }
}

function adjustCaloriesFromTrend() {
  const recent = [...weights].sort((a,b) => a.date.localeCompare(b.date)).slice(-4);
  const current = getTodayCalorieTarget();
  if(recent.length < 2 || !current) { setPlanningStatus('Log at least two weights and set a calorie target first.', 'var(--orange)'); return; }
  const change = recent[recent.length - 1].val - recent[0].val;
  const delta = userGoals.goalType === 'bulk' ? (change <= 0 ? 100 : 0) : (change >= 0 ? -100 : 0);
  if(!delta) { setPlanningStatus('Current weight trend does not require an adjustment.'); return; }
  userGoals.calTarget = Math.max(800, current + delta);
  save('fitdash_goals', userGoals);
  setPlanningStatus(`Suggested calorie target: ${userGoals.calTarget} kcal (${delta > 0 ? '+' : ''}${delta}). Review before applying.`);
}

function showDeloadRecommendation() {
  const recent = [...sessions].sort((a,b) => a.date.localeCompare(b.date)).slice(-3);
  const volumes = recent.map(session => Number(session.volumeKg || 0));
  const rising = volumes.length === 3 && volumes[2] >= volumes[1] && volumes[1] >= volumes[0] && volumes[2] > 0;
  setPlanningStatus(rising ? 'Deload suggestion: reduce load or sets by 30–40% for one week if soreness, fatigue, or performance drop is present.' : 'No automatic deload signal. Use a deload if fatigue, soreness, or performance decline persists.', rising ? 'var(--orange)' : 'var(--muted)');
}

function exportProgressReport() {
  const text = `FitDash Progress Report\nGenerated: ${new Date().toLocaleString()}\n\nSessions: ${sessions.length}\nCardio this week: ${cardioMins} minutes\nLatest weight: ${weights.length ? weights[weights.length-1].val + ' kg' : 'No data'}\nPersonal records: ${Object.keys(prs).length}\n\nThis report is for personal tracking and is not medical advice.`;
  const win = window.open('', '_blank');
  if(win) { win.document.write(`<pre style="font:16px system-ui;white-space:pre-wrap;padding:30px">${escapeHtml(text)}</pre>`); win.document.close(); win.print(); }
  else downloadText('fitdash-progress-report.txt', text);
}

async function exportEncryptedBackup() {
  const password = prompt('Enter a password for this encrypted backup:');
  if(!password) return;
  if(!window.crypto?.subtle) { setPlanningStatus('Encrypted backup is not supported in this browser.', 'var(--red)'); return; }
  const data = {};
  for(let i=0; i<localStorage.length; i++) { const key=localStorage.key(i); if(key && key.startsWith('fitdash_')) data[key]=localStorage.getItem(key); }
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'}, baseKey, {name:'AES-GCM',length:256}, false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, encoder.encode(JSON.stringify(data)));
  const payload = {version:1, salt:Array.from(salt), iv:Array.from(iv), data:Array.from(new Uint8Array(ciphertext))};
  downloadText('fitdash-encrypted-backup.json', JSON.stringify(payload), 'application/json');
  setPlanningStatus('Encrypted backup downloaded. Keep the password safe.');
}

function selectGoal(type) {
  if(!type) type = 'recomp';
  document.querySelectorAll('.goal-radio').forEach(el => {
    el.classList.toggle('active', el.dataset.val === type);
  });
  userGoals._selectedGoal = type;
}

function saveGoalSettings() {
  userGoals = {
    goalType:    userGoals._selectedGoal || 'recomp',
    targetWeight:parseFloat(document.getElementById('s-target-weight').value) || null,
    targetBF:    parseFloat(document.getElementById('s-target-bf').value) || null,
    cuisinePref: document.getElementById('s-cuisine').value,
    calTarget:   parseInt(document.getElementById('s-cal-target').value) || null,
    proteinTarget: parseInt(document.getElementById('s-protein-target').value) || null,
    carbTarget: parseInt(document.getElementById('s-carb-target').value) || null,
    fatTarget: parseInt(document.getElementById('s-fat-target').value) || null,
    waterTarget: parseInt(document.getElementById('s-water-target').value) || null,
  };
  save('fitdash_goals', userGoals);
  alert('Goals saved!');
}

function loadModelOptions(selectedModel) {
  const provider = document.getElementById('s-ai-provider').value;
  const select = document.getElementById('s-ai-model');
  const customInput = document.getElementById('s-ai-model-custom');
  
  // Update multi-provider inputs
  ['groq', 'gemini', 'openrouter', 'ollama'].forEach(p => {
    const el = document.getElementById('s-api-key-' + p);
    if(el) {
      el.style.display = p === provider ? 'block' : 'none';
      if(p !== 'ollama') el.value = getProviderApiKey(p) || '';
    }
  });

  const storeInput = document.getElementById('s-api-store');
  if(storeInput) storeInput.checked = aiConfig.storeKey;
  const models = AI_MODELS[provider] || [];
  const modelToApply = selectedModel || aiConfig.model || '';

  select.innerHTML = [
    ...models.map(m => `<option value="${m.id}">${m.name}</option>`),
    `<option value="${CUSTOM_MODEL_VALUE}">Custom model ID...</option>`
  ].join('');

  if(models.some(m => m.id === modelToApply)) {
    select.value = modelToApply;
    customInput.style.display = 'none';
    customInput.value = '';
  } else if(modelToApply) {
    select.value = CUSTOM_MODEL_VALUE;
    customInput.style.display = 'block';
    customInput.value = modelToApply;
  } else {
    select.value = models[0]?.id || CUSTOM_MODEL_VALUE;
    customInput.style.display = select.value === CUSTOM_MODEL_VALUE ? 'block' : 'none';
    if(select.value !== CUSTOM_MODEL_VALUE) customInput.value = '';
  }
}

function onModelChoiceChanged() {
  const select = document.getElementById('s-ai-model');
  const customInput = document.getElementById('s-ai-model-custom');
  const useCustom = select.value === CUSTOM_MODEL_VALUE;
  customInput.style.display = useCustom ? 'block' : 'none';
  if(!useCustom) customInput.value = '';
}

function getSelectedModelValue() {
  const selected = document.getElementById('s-ai-model').value;
  if(selected !== CUSTOM_MODEL_VALUE) return selected;
  return document.getElementById('s-ai-model-custom').value.trim();
}

function providerRequiresApiKey(provider) {
  return provider !== 'ollama';
}

function saveAISettings() {
  const storeKey = !!document.getElementById('s-api-store').checked;
  const provider = document.getElementById('s-ai-provider').value;
  const chosenModel = getSelectedModelValue();
  if(!chosenModel) {
    alert('Please select a model or enter a custom model ID.');
    return;
  }
  
  // Read all entered keys so they can be kept in-memory even if not stored
  const keys = {
    groq: document.getElementById('s-api-key-groq')?.value.trim() || '',
    gemini: document.getElementById('s-api-key-gemini')?.value.trim() || '',
    openrouter: document.getElementById('s-api-key-openrouter')?.value.trim() || ''
  };
  
  // If user unchecked 'storeKey', we blank out what's saved to localStorage, 
  // but keep the current provider's entered key in memory for this session
  let savedApiKeys = {};
  if (storeKey) {
    savedApiKeys = keys;
  }

  aiConfig = {
    provider,
    model: chosenModel,
    apiKeys: storeKey ? savedApiKeys : keys,
    storeKey,
    shareHealthData: document.getElementById('s-ai-share-health').checked,
  };
  
  // Save stripped config to localStorage
  save('fitdash_ai_config', { ...aiConfig, apiKeys: savedApiKeys });
  
  alert('AI config saved! ' + (providerRequiresApiKey(aiConfig.provider) ? 'API key ' + (storeKey ? 'stored in browser' : 'kept for this session only') + '.' : 'Ollama uses your local model and needs no API key.'));
}

async function testAIConnection() {
  const statusEl = document.getElementById('ai-test-status');
  if(!statusEl) return;
  statusEl.textContent = 'Testing connection...';
  
  const provider = document.getElementById('s-ai-provider').value;
  const keyEl = document.getElementById('s-api-key-' + provider);
  const testKey = provider === 'ollama' ? '' : (keyEl ? keyEl.value.trim() : '');
  
  if (providerRequiresApiKey(provider) && !testKey) {
    statusEl.textContent = 'Please enter an API key first.';
    statusEl.style.color = 'var(--red)';
    return;
  }
  
  // Temporarily override the config to test
  const originalConfig = { ...aiConfig };
  aiConfig = { ...originalConfig, provider: provider, apiKey: testKey, apiKeys: { [provider]: testKey } };
  
  try {
    const res = await callAI('Say the exact word "SUCCESS" and nothing else.');
    if (res && res.includes('SUCCESS')) {
      statusEl.textContent = 'Connection successful! \u2705';
      statusEl.style.color = 'var(--green)';
    } else {
      statusEl.textContent = 'Failed: Unexpected response.';
      statusEl.style.color = 'var(--red)';
    }
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    statusEl.style.color = 'var(--red)';
  } finally {
    aiConfig = originalConfig;
  }
}

function clearStoredApiKey() {
  try {
    aiConfig.apiKey = '';
    aiConfig.apiKeys = {};
    aiConfig.storeKey = false;
    save('fitdash_ai_config', aiConfig);
    ['groq', 'gemini', 'openrouter'].forEach(p => {
      const inp = document.getElementById('s-api-key-' + p);
      if(inp) inp.value = '';
    });
    const cb = document.getElementById('s-api-store'); if(cb) cb.checked = false;
    alert('Stored API keys cleared from this browser.');
  } catch(err) {
    console.error('Failed clearing API key', err);
    alert('Failed to clear stored API key. See console for details.');
  }
}

function toggleApiKeyVis() {
  ['groq', 'gemini', 'openrouter'].forEach(p => {
    const inp = document.getElementById('s-api-key-' + p);
    if(inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}

// ── Data Export / Import ──────────────────────────────────
function exportAllData() {
  const data = {};
  for(let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if(!k.startsWith('fitdash_')) continue;
    try {
      if(k === 'fitdash_ai_config') {
        const raw = localStorage.getItem(k);
        if(raw) {
          const parsed = JSON.parse(raw);
          if(parsed && parsed.apiKey && !parsed.storeKey) {
            // Do not include raw API key in exported backup unless explicitly stored
            parsed.apiKey = '[REDACTED]';
          }
          data[k] = JSON.stringify(parsed);
        }
        continue;
      }
      data[k] = localStorage.getItem(k);
    } catch(err) {
      // fallback: include raw value
      data[k] = localStorage.getItem(k);
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `fitdash-backup-${getLocalDateStr()}.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function importAllData(event) {
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if(typeof data !== 'object') throw new Error('Invalid format');
      if(!confirm(`Import ${Object.keys(data).length} data keys? This will overwrite your current data.`)) return;
      Object.entries(data).forEach(([k, v]) => {
        if(k.startsWith('fitdash_')) {
          // Export stores raw localStorage strings (already JSON-stringified).
          // save() will JSON.stringify again, so parse first to restore the original value.
          let parsed = v;
          try { parsed = JSON.parse(v); } catch(_) { /* v is a plain string, use as-is */ }
          save(k, parsed);
        }
      });
      // run migrations after import
      try { migrateStorage(); } catch(_) {}
      location.reload();
    } catch(err) {
      alert('Invalid backup file: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function load30DayMockData() {
  if(!confirm('Generate 30 days of mock FitDash demo data? This will overwrite only workout, weight, body comp, circumference, and PR history.')) return;
  const data = generate30DayMockData();
  Object.entries(data).forEach(([key, value]) => save(key, value));
  alert('Mock data loaded successfully. Reloading the dashboard...');
  location.reload();
}

function generate30DayMockData() {
  const today = new Date();
  const weights = [];
  const bodyComp = [];
  const circ = [];
  const sessions = [];
  const prs = {};
  let weight = 78.5;
  let bf = 23.8;
  let waist = 90.2;
  let hips = 101.0;
  let chest = 98.0;
  let shoulders = 110.0;

  for(let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    weight = Math.max(69, Math.round((weight + (Math.random() * 0.4 - 0.2) - 0.05) * 10) / 10);
    weights.push({ date, val: weight });
    if(i % 3 === 0) {
      bf = Math.max(16.5, Math.round((bf - (Math.random() * 0.3 + 0.1)) * 10) / 10);
      waist = Math.max(82, Math.round((waist - (Math.random() * 0.5 + 0.2)) * 10) / 10);
      hips = Math.max(92, Math.round((hips - (Math.random() * 0.4 + 0.2)) * 10) / 10);
      chest = Math.round((chest + (Math.random() * 0.3 + 0.1)) * 10) / 10;
      shoulders = Math.round((shoulders + (Math.random() * 0.4 + 0.2)) * 10) / 10;
      bodyComp.push({ date, bf, waist, neck: 39.0, hip: hips, leanMass: Math.round((weight * (1 - bf/100)) * 10) / 10, fatMass: Math.round((weight * (bf/100)) * 10) / 10, weight, method:'navy' });
      circ.push({ date, chest, shoulders, 'bicep-l': 32 + Math.random(), 'bicep-r': 32.5 + Math.random(), 'forearm-l': 28 + Math.random() * 0.2, 'forearm-r': 28 + Math.random() * 0.2, 'thigh-l': 55 + Math.random() * 0.4, 'thigh-r': 55.5 + Math.random() * 0.4, 'calf-l': 36 + Math.random() * 0.25, 'calf-r': 36 + Math.random() * 0.25, waist, hips });
    }
    if(i % 3 === 0) {
      const duration = 40 + Math.round(Math.random() * 20);
      const volumeKg = 900 + Math.round(Math.random() * 260);
      const caloriesBurned = 320 + Math.round(Math.random() * 180);
      const exercises = {
        'Goblet Squat-1': '80x10',
        'Calf Raise-1': '25x15',
        'Pullover-1': '24x10'
      };
      sessions.push({ date, notes:'Consistent session with solid intensity.', durationSecs: duration*60, caloriesBurned, setsCompleted: 12, volumeKg, exercises, id: Number(date.replace(/-/g,'')) });
      prs['Dumbbell Goblet Squat'] = { weight: 90, date };
    }
  }

  return { fitdash_weights: weights, fitdash_bodycomp: bodyComp, fitdash_circ: circ, fitdash_sessions: sessions, fitdash_prs: prs };
}

function clearAllData() {
  if(!confirm('⚠️ Delete ALL FitDash data? This includes sessions, weight logs, PRs, settings, and AI config. This cannot be undone!')) return;
  const keys = [];
  for(let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if(k.startsWith('fitdash_')) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  location.reload();
}

// ══ WATER TRACKER ═══════════════════════════════════════════
let waterLog = safeLoad('fitdash_water', { date: getLocalDateStr(), ml: 0 });

function renderWater() {
  const today = getLocalDateStr();
  if (waterLog.date !== today) {
    waterLog = { date: today, ml: 0 };
    save('fitdash_water', waterLog);
  }
  const goal = userGoals.waterTarget || 3000;
  document.getElementById('water-current').textContent = waterLog.ml;
  document.getElementById('water-goal').textContent = goal;
  const pct = Math.min(100, (waterLog.ml / goal) * 100);
  document.getElementById('water-fill').style.width = pct + '%';
  document.getElementById('water-fill').style.background = pct >= 100 ? 'var(--green)' : 'var(--blue)';
  if(typeof renderQuickLog === 'function') renderQuickLog();
}

function addWater(ml) {
  waterLog.ml += ml;
  save('fitdash_water', waterLog);
  renderWater();
}

function resetWater() {
  if(!confirm('Reset today\'s water intake?')) return;
  waterLog.ml = 0;
  save('fitdash_water', waterLog);
  renderWater();
}

// ══ SLEEP TRACKER ═══════════════════════════════════════════
let sleepHistory = safeLoad('fitdash_sleep', []);

function renderSleep() {
  // Setup inputs for today if already logged
  const today = getLocalDateStr();
  const existing = sleepHistory.find(s => s.date === today);
  if(existing) {
    document.getElementById('sleep-bedtime').value = existing.bedtime;
    document.getElementById('sleep-wake').value = existing.wake;
    updateSleepQualityUI(existing.quality);
  } else {
    document.getElementById('sleep-bedtime').value = '';
    document.getElementById('sleep-wake').value = '';
    updateSleepQualityUI(null);
  }
  
  // Render chart
  const wrap = document.getElementById('sleep-history-wrap');
  if(!sleepHistory.length) {
    wrap.style.display = 'none';
    if(typeof renderQuickLog === 'function') renderQuickLog();
    return;
  }
  wrap.style.display = '';
  if(typeof renderQuickLog === 'function') renderQuickLog();
  
  const sorted = [...sleepHistory].sort((a,b) => a.date.localeCompare(b.date)).slice(-7);
  const chart = document.getElementById('sleep-chart');
  
  const avg = sorted.reduce((sum, s) => sum + s.hours, 0) / sorted.length;
  document.getElementById('sleep-avg').textContent = (Math.round(avg * 10)/10);
  
  const colors = { poor: 'var(--red)', ok: 'var(--orange)', good: 'var(--blue)', great: 'var(--green)' };
  
  chart.innerHTML = sorted.map(s => {
    const hPct = Math.min(100, (s.hours / 12) * 100);
    return `<div style="flex:1;background:var(--card2);height:100%;border-radius:4px;position:relative;overflow:hidden" title="${s.date}: ${s.hours}h">
      <div style="position:absolute;bottom:0;left:0;right:0;height:${hPct}%;background:${colors[s.quality]||'var(--blue)'};border-radius:4px"></div>
    </div>`;
  }).join('');
}

let currentSleepQuality = null;
function setSleepQuality(q) {
  currentSleepQuality = q;
  updateSleepQualityUI(q);
}

function updateSleepQualityUI(q) {
  currentSleepQuality = q;
  ['poor','ok','good','great'].forEach(x => {
    const btn = document.getElementById('sq-'+x);
    if(btn) btn.classList.toggle('active', x === q);
  });
}

function logSleep() {
  const bedtime = document.getElementById('sleep-bedtime').value;
  const wake = document.getElementById('sleep-wake').value;
  if(!bedtime || !wake) { alert('Please enter both bedtime and wake up time.'); return; }
  if(!currentSleepQuality) { alert('Please select sleep quality.'); return; }
  
  // Calc hours (handle crossing midnight)
  let [bh, bm] = bedtime.split(':').map(Number);
  let [wh, wm] = wake.split(':').map(Number);
  let bMins = bh * 60 + bm;
  let wMins = wh * 60 + wm;
  if (wMins < bMins) wMins += 24 * 60; // crossed midnight
  const hours = Math.round(((wMins - bMins) / 60) * 100) / 100;
  
  const today = getLocalDateStr();
  const entry = { date: today, bedtime, wake, hours, quality: currentSleepQuality };
  
  sleepHistory = sleepHistory.filter(s => s.date !== today);
  sleepHistory.push(entry);
  save('fitdash_sleep', sleepHistory);
  
  renderSleep();
}


renderWater();
renderSleep();
renderCustomExercises();

// ══ CHECKLIST ════════════════════════════════════════════════
function renderChecklist() {
  const today = getLocalDateStr();   // ISO local — avoids toDateString() locale variance
  if(checklist._date !== today) { checklist = { _date: today }; save('fitdash_check', checklist); }
  const el = document.getElementById('checklist');
  if(!el) return;
  
  const sched = userProfile.schedule || [0,1,2,3,4,5,6];
  const isRestDay = !sched.includes(new Date().getDay());
  
  const items = CHECKLIST_ITEMS.map(item => {
    if (item.id === 'workout' && isRestDay) return { id: 'recovery', label: 'Do mobility / active recovery' };
    return item;
  });
  
  el.innerHTML = items.map(item => `
    <div class="checklist-item">
      <div class="check-box ${checklist[item.id]?'done':''}" onclick="toggleCheck('${item.id}')"></div>
      <div class="check-label ${checklist[item.id]?'done':''}">${item.label}</div>
    </div>`).join('');
}

function toggleCheck(id) {
  checklist[id] = !checklist[id];
  save('fitdash_check', checklist);
  renderChecklist();
}

// ══ NUTRITION RENDER ═════════════════════════════════════════
function renderMeals(data, prefix) {
  ['breakfast','lunch','dinner'].forEach((slot,i) => {
    const el = document.getElementById(`meals-${prefix}-${i+1}`);
    if(!el) return;
    el.innerHTML = data[slot].map((m,idx) => `
      <div class="meal-card" id="mc-${prefix}-${slot}-${idx}">
        <div class="meal-card-header" onclick="toggleMeal('mc-${prefix}-${slot}-${idx}')">
          <div class="meal-icon">${m.emoji}</div>
          <div class="meal-name">${m.name}</div>
          <div class="meal-cals">${m.kcal} cal</div>
          <div class="meal-chevron">▼</div>
        </div>
        <div class="meal-card-body">
          <div class="meal-desc">${m.desc}</div>
        </div>
      </div>`).join('');
  });
  const snackEl = document.getElementById(`snacks-${prefix}`);
  if(snackEl) {
    snackEl.innerHTML = data.snacks.map(s => `
      <div class="snack-item">
        <div class="snack-emoji">${s.emoji}</div>
        <div>
          <div class="snack-name">${s.name}</div>
          <div class="snack-cal">${s.approx ? '≈' : ''}${s.kcal} cal</div>
        </div>
      </div>`).join('');
  }
}

function toggleMeal(id) {
  document.getElementById(id).classList.toggle('open');
}

const PLAN_LABELS = {
  '1500':   '1500 kcal Plan',
  '2000':   '2000 kcal Plan',
  '2500':   '2500 kcal Plan',
  'bd1500': '🇧🇩 BD 1500 kcal Plan',
  'bd2000': '🇧🇩 BD 2000 kcal Plan',
  'bd2500': '🇧🇩 BD 2500 kcal Plan',
  'ai':     '🤖 AI Custom Plan',
};

// applyPlan updates the UI only — no localStorage write.
// Called by renderDashboard() (which runs on every interaction) to avoid
// writing the same plan value to localStorage dozens of times per session.
function applyPlan(p) {
  // Only show the full plan details when Dashboard or Nutrition pages are active.
  const showOnCurrent = (activePageId === 'dashboard' || activePageId === 'nutrition');
  ['1500','2000','2500','bd1500','bd2000','bd2500','ai'].forEach(id => {
    const planEl = document.getElementById('plan-'+id);
    const btnEl  = document.getElementById('btn-'+id);
    if(planEl) planEl.style.display = (id === p && showOnCurrent) ? '' : 'none';
    if(btnEl)  btnEl.classList.toggle('active', id === p);
  });
  const dashLabel = document.getElementById('dash-plan-label');
  if(dashLabel) dashLabel.textContent = PLAN_LABELS[p] || p;
  if(p === 'ai') renderAIPlan();
  // update compact preview on dashboard
  if(typeof renderPlanPreview === 'function') renderPlanPreview();
}

function renderPlanPreview() {
  const preview = document.getElementById('dash-plan-preview');
  if(!preview) return;
  const planEl = document.getElementById('plan-' + activePlan);
  if(!planEl) { preview.style.display = 'none'; return; }
  const headers = planEl.querySelectorAll('.meal-header');
  if(!headers || headers.length === 0) { preview.style.display = 'none'; return; }
  let html = '<div style="display:flex;flex-direction:column;gap:6px">';
  for(let i = 0; i < Math.min(3, headers.length); i++) {
    const h = headers[i];
    const titleEl = h.querySelector('.meal-title');
    const kcalEl = h.querySelector('.meal-kcal');
    const title = titleEl ? titleEl.textContent.trim() : (h.textContent || '').trim();
    const kcal = kcalEl ? kcalEl.textContent.trim() : '';
    html += `<div style="display:flex;justify-content:space-between"><span style="font-weight:700">${escapeHtml(title)}</span><span style="color:var(--muted)">${escapeHtml(kcal)}</span></div>`;
  }
  html += `<div style="margin-top:6px"><a href="#" onclick="showPage('nutrition');return false;" style="font-size:13px;color:var(--blue)">Open full plan ›</a></div>`;
  html += '</div>';
  preview.innerHTML = html;
  preview.style.display = '';
}

// switchPlan is called by the user tapping a plan button — it saves AND updates UI.
function switchPlan(p) {
  activePlan = p;
  save('fitdash_plan', p);
  applyPlan(p);
}

function saveNutritionPreference() {
  const pref = document.getElementById('nutrition-cuisine-pref')?.value || 'both';
  userGoals.cuisinePref = pref;
  save('fitdash_goals', userGoals);
  renderNutrition();
  renderCalorieTracker();
}

function openDishBuilderFromNutrition() {
  showPage('dashboard');
  setTimeout(() => {
    const el = document.getElementById('ingredient-builder');
    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
}

function renderNutrition() {
  const pref = (userGoals.cuisinePref || 'both').toLowerCase();
  const sel = document.getElementById('nutrition-cuisine-pref');
  if(sel) sel.value = pref;

  const intGroup = document.getElementById('plan-group-international');
  const bdGroup = document.getElementById('plan-group-bd');
  if(intGroup && bdGroup) {
    if(pref === 'bangladeshi') {
      intGroup.style.display = 'none';
      bdGroup.style.display = '';
    } else if(pref === 'international') {
      intGroup.style.display = '';
      bdGroup.style.display = 'none';
    } else {
      intGroup.style.display = '';
      bdGroup.style.display = '';
    }
  }
}

// ══ BODY RECOMPOSITION ═══════════════════════════════════
let bodyComp = safeLoad('fitdash_bodycomp', []);

function calcNavyBF(waistCm, neckCm, hipCm, heightCm, gender) {
  // U.S. Navy formula constants require inches — convert from cm.
  const waist = waistCm / 2.54;
  const neck  = neckCm  / 2.54;
  const hip   = hipCm   ? hipCm / 2.54 : null;
  const height = heightCm / 2.54;
  if(gender === 'female') {
    if(!hip) return null;
    return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  }
  return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
}

function getBMI(weight, height) {
  if(!weight || !height) return null;
  return Math.round(weight / ((height / 100) ** 2) * 10) / 10;
}

function getBMIClassification(bmi) {
  if(!bmi) return 'No BMI available.';
  if(bmi < 18.5) return 'Underweight';
  if(bmi < 25) return 'Normal weight';
  if(bmi < 30) return 'Overweight';
  return 'Obese';
}

function getWaistHeightCategory(ratio, gender) {
  if(!ratio) return 'No ratio available.';
  if(gender === 'female') {
    if(ratio < 0.5) return 'Healthy';
    if(ratio < 0.6) return 'Caution';
    return 'High risk';
  }
  if(ratio < 0.5) return 'Healthy';
  if(ratio < 0.6) return 'Caution';
  return 'High risk';
}

function logBodyComp() {
  const waist = parseFloat(document.getElementById('bc-waist').value);
  const neck  = parseFloat(document.getElementById('bc-neck').value);
  const hipEl = document.getElementById('bc-hip');
  const hip   = hipEl && hipEl.offsetParent !== null ? parseFloat(hipEl.value) : null;
  const gender = userProfile.gender || 'male';
  const height = userProfile.height;
  const latestW = weights.length ? weights.reduce((b,w)=>(!b||w.date>b.date)?w:b,null) : null;
  const weight = latestW ? latestW.val : userProfile.weight;

  if(!waist || waist < 40 || waist > 200) { alert('Please enter a valid waist measurement (40-200 cm).'); return; }
  if(!neck || neck < 20 || neck > 60) { alert('Please enter a valid neck measurement (20-60 cm).'); return; }
  if(gender === 'female' && (!hip || hip < 50 || hip > 200)) { alert('Please enter a valid hip measurement (50-200 cm).'); return; }
  if(!height) { alert('Please set your height in Settings first.'); return; }
  if(!weight) { alert('Please log your weight first.'); return; }
  if(waist <= neck) { alert('Waist must be larger than neck circumference.'); return; }

  const bf = Math.round(calcNavyBF(waist, neck, hip, height, gender) * 10) / 10;
  if(bf < 2 || bf > 60) { alert('Calculated body fat seems unrealistic. Check your measurements.'); return; }
  const leanMass = Math.round(weight * (1 - bf/100) * 10) / 10;
  const fatMass  = Math.round(weight * (bf/100) * 10) / 10;

  const entry = { date: getLocalDateStr(), bf, waist, neck, hip, leanMass, fatMass, weight, method:'navy' };
  bodyComp = bodyComp.filter(e => e.date !== entry.date);
  bodyComp.push(entry);
  save('fitdash_bodycomp', bodyComp);

  document.getElementById('bc-waist').value = '';
  document.getElementById('bc-neck').value = '';
  if(hipEl) hipEl.value = '';
  renderBodyComp();
}

function logManualBF() {
  const bf = parseFloat(document.getElementById('bc-manual-bf').value);
  if(!bf || bf < 2 || bf > 60) { alert('Enter body fat between 2-60%.'); return; }
  const latestW = weights.length ? weights.reduce((b,w)=>(!b||w.date>b.date)?w:b,null) : null;
  const weight = latestW ? latestW.val : userProfile.weight;
  if(!weight) { alert('Please log your weight first.'); return; }
  const leanMass = Math.round(weight * (1-bf/100) * 10) / 10;
  const fatMass  = Math.round(weight * (bf/100) * 10) / 10;
  const entry = { date:getLocalDateStr(), bf, leanMass, fatMass, weight, method:'manual' };
  bodyComp = bodyComp.filter(e => e.date !== entry.date);
  bodyComp.push(entry);
  save('fitdash_bodycomp', bodyComp);
  document.getElementById('bc-manual-bf').value = '';
  renderBodyComp();
}

function deleteBodyComp(date) {
  if(!confirm(`Delete body comp entry for ${date}?`)) return;
  bodyComp = bodyComp.filter(e => e.date !== date);
  save('fitdash_bodycomp', bodyComp);
  renderBodyComp();
}

function clearBodyCompHistory() {
  if(!confirm('Clear all body composition history? This cannot be undone.')) return;
  bodyComp = [];
  save('fitdash_bodycomp', bodyComp);
  renderBodyComp();
}

function renderBodyComp() {
  const resultEl = document.getElementById('bc-results');
  if(!resultEl) return;

  // Show/hide hip based on gender
  const hipWrap = document.getElementById('bc-hip-wrap');
  if(hipWrap) hipWrap.style.display = (userProfile.gender === 'female') ? '' : 'none';

  const latest = bodyComp.length ? bodyComp[bodyComp.length - 1] : null;

  if(!latest) {
    resultEl.innerHTML = '<div class="empty-state" style="padding:20px"><p style="font-size:13px;color:var(--muted)">No body composition data yet.<br>Enter your measurements above to get started.</p></div>';
    document.getElementById('bc-chart-wrap').style.display = 'none';
    document.getElementById('bc-goal-wrap').style.display = 'none';
    document.getElementById('bc-history').innerHTML = '';
    return;
  }

  const height = userProfile.height;
  const weight = latest.weight;
  const bmi = getBMI(weight, height);
  const bmiClass = getBMIClassification(bmi);
  const whr = latest.waist && height ? Math.round((latest.waist / height) * 100) / 100 : null;
  const whrLabel = whr ? getWaistHeightCategory(whr, userProfile.gender) : '';
  const bfCategory = latest.bf < 10 ? 'Athletic' : latest.bf < 15 ? 'Lean' : latest.bf < 20 ? 'Fit' : latest.bf < 25 ? 'Average' : 'Needs improvement';
  const bfColor = latest.bf < 15 ? 'var(--green)' : latest.bf < 20 ? 'var(--blue)' : latest.bf < 25 ? 'var(--yellow)' : 'var(--red)';
  const previous = bodyComp.length > 1 ? bodyComp[bodyComp.length - 2] : null;
  const deltaText = previous ? (() => {
    const diff = Math.round((latest.bf - previous.bf) * 10) / 10;
    return diff < 0 ? `Body fat down ${Math.abs(diff)}% since last log.` : diff > 0 ? `Body fat up ${diff}% since last log.` : 'Body fat unchanged since last log.';
  })() : 'Log one more reading for trend insights.';

  resultEl.innerHTML = `
    <div class="recomp-result-grid">
      <div class="recomp-stat"><div class="recomp-stat-val" style="color:${bfColor}">${latest.bf}%</div><div class="recomp-stat-label">Body Fat</div></div>
      <div class="recomp-stat"><div class="recomp-stat-val" style="color:var(--green)">${latest.leanMass}</div><div class="recomp-stat-label">Lean kg</div></div>
      <div class="recomp-stat"><div class="recomp-stat-val" style="color:var(--orange)">${latest.fatMass}</div><div class="recomp-stat-label">Fat kg</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
      ${bmi ? `<div class="recomp-stat"><div class="recomp-stat-val" style="color:var(--blue)">${bmi}</div><div class="recomp-stat-label">BMI (${bmiClass})</div></div>` : '<div></div>'}
      ${whr ? `<div class="recomp-stat"><div class="recomp-stat-val" style="color:var(--yellow)">${whr}</div><div class="recomp-stat-label">Waist / Height (${whrLabel})</div></div>` : '<div></div>'}
    </div>
    <div style="margin-top:10px;font-size:12px;color:var(--muted);line-height:1.6">
      ${bfCategory}. ${deltaText}
      ${whr ? `Waist-to-height ratio of ${whr} suggests <strong>${whrLabel}</strong>.` : ''}
    </div>
    <div class="mass-bar-wrap" style="margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:4px">
        <span>Lean: ${Math.round(100-latest.bf)}%</span><span>Fat: ${latest.bf}%</span>
      </div>
      <div class="mass-bar">
        <div class="mass-bar-lean" style="width:${100-latest.bf}%">${Math.round(100-latest.bf)}%</div>
        <div class="mass-bar-fat" style="width:${latest.bf}%">${latest.bf}%</div>
      </div>
    </div>`;

  // Goal progress
  const goalWrap = document.getElementById('bc-goal-wrap');
  if(userGoals.targetBF && goalWrap) {
    goalWrap.style.display = '';
    const startBF = bodyComp[0].bf;
    const progress = Math.min(100, Math.max(0, Math.round(((startBF - latest.bf) / (startBF - userGoals.targetBF)) * 100)));
    goalWrap.innerHTML = `
      <div class="goal-progress-labels">
        <span>Current: ${latest.bf}%</span><span>Target: ${userGoals.targetBF}%</span>
      </div>
      <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${progress}%"></div></div>
      <div style="text-align:center;margin-top:6px;font-size:11px;color:var(--muted)">${progress}% to goal</div>`;
  } else if(goalWrap) { goalWrap.style.display = 'none'; }

  // Chart
  document.getElementById('bc-chart-wrap').style.display = '';
  renderBFChart();

  // History
  const histEl = document.getElementById('bc-history');
  const sorted = [...bodyComp].sort((a,b) => b.date.localeCompare(a.date)).slice(0,8);
  histEl.innerHTML = sorted.map(e => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:12px;color:var(--muted)">${e.date}</span>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:13px;font-weight:700">${e.bf}%</span>
        <span style="font-size:11px;color:var(--muted)">${e.method}</span>
        <button onclick="deleteBodyComp('${e.date}')" class="del-btn del-btn-sm">×</button>
      </div>
    </div>`).join('');
}

// ══ BODY CIRCUMFERENCE TRACKER ═══════════════════════════
let circHistory = safeLoad('fitdash_circ', []);
const CIRC_PARTS = [
  {id:'chest', label:'Chest'}, {id:'shoulders', label:'Shoulders'},
  {id:'bicep-l', label:'L Bicep'}, {id:'bicep-r', label:'R Bicep'},
  {id:'forearm-l', label:'L Forearm'}, {id:'forearm-r', label:'R Forearm'},
  {id:'thigh-l', label:'L Thigh'}, {id:'thigh-r', label:'R Thigh'},
  {id:'calf-l', label:'L Calf'}, {id:'calf-r', label:'R Calf'},
  {id:'waist', label:'Waist'}, {id:'hips', label:'Hips'}
];

function logCircumference() {
  const entry = { date: getLocalDateStr() };
  let hasAny = false;
  CIRC_PARTS.forEach(p => {
    const val = parseFloat(document.getElementById('circ-' + p.id).value);
    if(val && val > 0) { entry[p.id] = val; hasAny = true; }
  });
  if(!hasAny) { alert('Please fill in at least one measurement.'); return; }
  
  // Merge with existing entry for today (so partial logs add up)
  const existing = circHistory.find(e => e.date === entry.date);
  if(existing) {
    Object.assign(existing, entry);
  } else {
    circHistory.push(entry);
  }
  save('fitdash_circ', circHistory);
  
  // Clear inputs
  CIRC_PARTS.forEach(p => document.getElementById('circ-' + p.id).value = '');
  renderCircHistory();
  renderCircChart();
}

function clearCircHistory() {
  if(!confirm('Clear all body measurement history? This cannot be undone.')) return;
  circHistory = [];
  save('fitdash_circ', circHistory);
  renderCircHistory();
}

function renderCircHistory() {
  const el = document.getElementById('circ-history');
  if(!el) return;
  
  if(!circHistory.length) {
    el.innerHTML = '<div style="padding:16px;text-align:center;font-size:13px;color:var(--muted)">No measurements logged yet.</div>';
    return;
  }
  
  const sorted = [...circHistory].sort((a,b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const previous = sorted[1];

  let summaryText = `Logged ${sorted.length} measurement ${sorted.length === 1 ? 'entry' : 'entries'}.`;
  if(previous) {
    const muscleParts = ['chest','shoulders','bicep-l','bicep-r','thigh-l','thigh-r','calf-l','calf-r'];
    const gains = muscleParts.map(id => {
      if(!latest[id] || !previous[id]) return null;
      return { id, diff: Math.round((latest[id] - previous[id]) * 10) / 10 };
    }).filter(x => x && x.diff > 0);
    const waistDiff = latest.waist && previous.waist ? Math.round((latest.waist - previous.waist) * 10) / 10 : null;
    const hipsDiff = latest.hips && previous.hips ? Math.round((latest.hips - previous.hips) * 10) / 10 : null;
    const loss = [waistDiff, hipsDiff].filter(v => v !== null && v < 0).map(v => Math.abs(v));
    const bestGain = gains.sort((a,b) => b.diff - a.diff)[0];
    const bestShrink = loss.length ? Math.max(...loss) : null;
    const gainLabel = bestGain ? CIRC_PARTS.find(p => p.id === bestGain.id).label : null;
    if(bestGain && bestShrink) {
      summaryText = `Best gain: ${gainLabel} +${bestGain.diff}cm. Waist/hips improved by ${bestShrink}cm.`;
    } else if(bestGain) {
      summaryText = `Best gain: ${gainLabel} +${bestGain.diff}cm since last log.`;
    } else if(bestShrink) {
      summaryText = `Best slimming: ${bestShrink}cm loss from waist/hips since last log.`;
    }
  }

  // Pre-compute per-entry diffs once to avoid duplicate Math.round calculations in the loop below.
  const _diffCache = new Map();
  sorted.forEach((entry, idx) => {
    const prev = sorted[idx + 1];
    if(!prev) return;
    const diffs = {};
    CIRC_PARTS.forEach(p => {
      if(entry[p.id] && prev[p.id]) {
        diffs[p.id] = Math.round((entry[p.id] - prev[p.id]) * 10) / 10;
      }
    });
    _diffCache.set(idx, diffs);
  });

  let html = `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0 8px;border-bottom:1px solid var(--border);margin-bottom:10px">
      <div style="font-size:12px;color:var(--muted)">${summaryText}</div>
      <div style="font-size:11px;color:var(--muted)">Latest: ${latest.date}</div>
    </div>`;

  html += sorted.map((entry, idx) => {
    const diffs = _diffCache.get(idx) || {};
    let partsHtml = CIRC_PARTS.filter(p => entry[p.id]).map(p => {
      let delta = '';
      const diff = diffs[p.id];
      if(diff !== undefined && diff !== 0) {
        const isWaistLike = (p.id === 'waist' || p.id === 'hips');
        const color = (isWaistLike ? diff < 0 : diff > 0) ? 'var(--green)' : 'var(--orange)';
        delta = ` <span style="color:${color};font-size:10px;font-weight:700">${diff > 0 ? '+' : ''}${diff}</span>`;
      }
      return `<div style="display:flex;justify-content:space-between;padding:3px 0">
        <span style="color:var(--muted);font-size:11px">${p.label}</span>
        <span style="font-size:12px;font-weight:600">${entry[p.id]} cm${delta}</span>
      </div>`;
    }).join('');
    return `<div style="border-bottom:1px solid var(--border);padding:12px 0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:12px;font-weight:700;color:var(--text)">${entry.date}</span>
        <button onclick="deleteCircEntry('${entry.date}')" class="del-btn del-btn-sm">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 16px">${partsHtml}</div>
    </div>`;
  }).join('');
  
  el.innerHTML = html;
}

function deleteCircEntry(date) {
  if(!confirm('Delete measurements for ' + date + '?')) return;
  circHistory = circHistory.filter(e => e.date !== date);
  save('fitdash_circ', circHistory);
  renderCircHistory();
}

function renderCircChart() {
  const canvas = document.getElementById('circChart');
  if(!canvas) return;
  const desc = document.getElementById('circChart-desc');
  const ctx = canvas.getContext('2d');
  const sorted = [...circHistory].sort((a,b) => a.date.localeCompare(b.date)).slice(-7);
  const labels = sorted.map(e => parseLocalDate(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}));
  const parts = [
    { id:'waist', label:'Waist', color:'var(--red)' },
    { id:'hips', label:'Hips', color:'var(--orange)' },
    { id:'chest', label:'Chest', color:'var(--blue)' },
    { id:'shoulders', label:'Shoulders', color:'var(--green)' }
  ];
  const datasets = parts.map(p => ({ ...p, values: sorted.map(entry => entry[p.id] != null ? entry[p.id] : null) }));
  const nonEmpty = datasets.filter(ds => ds.values.some(v => v !== null));

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 600;
  const H = 180;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0,0,W,H);

  if(!nonEmpty.length) {
    ctx.fillStyle = '#7070a0';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Add measurements to see circumference trends', W/2, H/2);
    if(desc) desc.textContent = 'No circumference data available.';
    return;
  }

  const allValues = nonEmpty.flatMap(ds => ds.values.filter(v => v !== null));
  const minV = Math.min(...allValues) - 2;
  const maxV = Math.max(...allValues) + 2;
  const pad = {l:42,r:20,t:26,b:34};
  const toX = i => pad.l + (W-pad.l-pad.r)*(labels.length > 1 ? i/(labels.length-1) : 0.5);
  const toY = v => pad.t + (H-pad.t-pad.b)*(1 - (v-minV)/(maxV-minV));

  ctx.strokeStyle = '#2a2a3c'; ctx.lineWidth = 1;
  [0,.25,.5,.75,1].forEach(f => {
    const y = pad.t + (H-pad.t-pad.b)*f;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle = '#7070a0'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
    ctx.fillText((maxV - (maxV-minV)*f).toFixed(1), pad.l-6, y+4);
  });

  ctx.fillStyle = '#7070a0'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
  labels.forEach((label,i) => ctx.fillText(label, toX(i), H-10));

  nonEmpty.forEach(ds => {
    ctx.beginPath();
    ds.values.forEach((v,i) => {
      if(v === null) return;
      const x = toX(i);
      const y = toY(v);
      if(ds.values.slice(0,i).every(val => val === null)) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    });
    ctx.strokeStyle = ds.color; ctx.lineWidth = 2.5; ctx.stroke();

    ds.values.forEach((v,i) => {
      if(v === null) return;
      const x = toX(i);
      const y = toY(v);
      ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle = ds.color; ctx.fill();
      ctx.strokeStyle = '#08080e'; ctx.lineWidth = 2; ctx.stroke();
    });
  });

  ctx.fillStyle = '#e8e8f2'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('Circumference (cm)', pad.l, pad.t - 10);
  ctx.fillText('Date', W/2, H - 4);

  let legendX = W - pad.r - 120;
  const legendY = pad.t - 10;
  nonEmpty.forEach(ds => {
    ctx.fillStyle = ds.color; ctx.fillRect(legendX, legendY - 8, 10, 10);
    ctx.fillStyle = '#e8e8f2'; ctx.fillText(ds.label, legendX + 14, legendY);
    legendX += 70;
  });

  if(desc) {
    const latestVals = nonEmpty.map(ds => ({ label: ds.label, val: ds.values[ds.values.length-1] })).filter(x => x.val != null).map(x => `${x.label}: ${x.val} cm`).join('; ');
    desc.textContent = `Recent circumference measurements — ${latestVals}`;
  }
}

function renderPRVolumeChart() {
  const canvas = document.getElementById('prChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const sorted = [...sessions].sort((a,b) => a.date.localeCompare(b.date)).slice(-10);
  const labels = sorted.map(s => parseLocalDate(s.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}));
  const volume = sorted.map(s => s.volumeKg || 0);
  const duration = sorted.map(s => s.durationSecs ? Math.round(s.durationSecs/60) : null);
  const maxWeight = sorted.map(s => {
    const weights = Object.values(s.exercises || {}).flatMap(setObj => Object.values(setObj)).map(parseWeightFromSetStr).filter(v => v !== null);
    return weights.length ? Math.max(...weights) : 0;
  });

  const prDescEl = document.getElementById('prChart-desc');
  if(!sorted.length || (volume.every(v => v === 0) && duration.every(v => v === null) && maxWeight.every(v => v === 0))) {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#7070a0';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Log workouts to see volume, PR and duration trends', canvas.width/2, 90);
    if(prDescEl) prDescEl.textContent = 'No workouts logged yet.';
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 600;
  const H = 200;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0,0,W,H);

  const pad = {l:42,r:58,t:32,b:36};
  const maxVol = Math.max(...volume, 1);
  const maxWt = Math.max(...maxWeight, 1);
  const maxDur = Math.max(...duration.filter(v => v !== null), 1);
  const volRange = maxVol * 1.1;
  const wtRange = maxWt * 1.1;
  const durRange = maxDur * 1.1;
  const toX = i => pad.l + (W-pad.l-pad.r)*(labels.length > 1 ? i/(labels.length-1) : 0.5);
  const toYVol = v => pad.t + (H-pad.t-pad.b)*(1 - v/volRange);
  const toYWt = v => pad.t + (H-pad.t-pad.b)*(1 - v/wtRange);
  const toYDur = v => pad.t + (H-pad.t-pad.b)*(1 - v/durRange);

  ctx.strokeStyle = '#2a2a3c'; ctx.lineWidth = 1;
  [0,.25,.5,.75,1].forEach(f => {
    const y = pad.t + (H-pad.t-pad.b)*f;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle = '#7070a0'; ctx.font = '10px system-ui'; ctx.textAlign = 'right';
    ctx.fillText(Math.round((1-f)*volRange), pad.l-6, y+4);
    ctx.textAlign = 'left';
    ctx.fillText(Math.round((1-f)*durRange) + 'm', W-pad.r+6, y+4);
  });

  ctx.fillStyle = '#7070a0'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
  labels.forEach((label,i) => ctx.fillText(label, toX(i), H-10));

  ctx.beginPath();
  volume.forEach((v,i) => {
    const x=toX(i); const y=toYVol(v);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.strokeStyle='rgba(96,165,250,0.95)'; ctx.lineWidth=2.5; ctx.stroke();

  ctx.beginPath();
  maxWeight.forEach((v,i)=>{
    const x=toX(i); const y=toYWt(v);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.strokeStyle='rgba(74,222,128,0.95)'; ctx.lineWidth=2.5; ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);

  ctx.beginPath();
  duration.forEach((v,i)=>{
    if(v===null) return;
    const x=toX(i); const y=toYDur(v);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.strokeStyle='rgba(251,191,36,0.95)'; ctx.lineWidth=2.5; ctx.stroke();

  volume.forEach((v,i)=>{
    const x=toX(i); const y=toYVol(v);
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle='rgba(96,165,250,1)'; ctx.fill(); ctx.strokeStyle='#08080e'; ctx.lineWidth=2; ctx.stroke();
  });

  maxWeight.forEach((v,i)=>{ if(v===0) return; const x=toX(i); const y=toYWt(v); ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle='rgba(74,222,128,1)'; ctx.fill(); ctx.strokeStyle='#08080e'; ctx.lineWidth=2; ctx.stroke(); });
  duration.forEach((v,i)=>{ if(v===null) return; const x=toX(i); const y=toYDur(v); ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle='rgba(251,191,36,1)'; ctx.fill(); ctx.strokeStyle='#08080e'; ctx.lineWidth=2; ctx.stroke(); });

  ctx.fillStyle='#e8e8f2'; ctx.font='11px system-ui'; ctx.textAlign='left'; ctx.fillText('Volume (kg)', pad.l, pad.t - 12);
  ctx.fillText('Weight / Duration', pad.l + 130, pad.t - 12);
  ctx.fillStyle='rgba(96,165,250,1)'; ctx.fillRect(W - pad.r - 150, pad.t - 18, 10, 10); ctx.fillStyle='#e8e8f2'; ctx.fillText('Volume (kg)', W - pad.r - 134, pad.t - 8);
  ctx.fillStyle='rgba(74,222,128,1)'; ctx.fillRect(W - pad.r - 70, pad.t - 18, 10, 10); ctx.fillStyle='#e8e8f2'; ctx.fillText('Max weight (kg)', W - pad.r - 54, pad.t - 8);
  ctx.fillStyle='rgba(251,191,36,1)'; ctx.fillRect(W - pad.r - 150, pad.t + 2, 10, 10); ctx.fillStyle='#e8e8f2'; ctx.fillText('Duration (mins)', W - pad.r - 134, pad.t + 12);
  // Accessible summary for screen readers
  if(prDescEl) {
    const latestVol = volume.length ? volume[volume.length-1] : 0;
    const bestPR = maxWeight.length ? Math.max(...maxWeight) : 0;
    const durVals = duration.filter(v => v !== null);
    const avgDur = durVals.length ? Math.round(durVals.reduce((a,b) => a+b,0) / durVals.length) : 0;
    prDescEl.textContent = `Recent ${sorted.length} workouts. Latest volume: ${latestVol} kg. Best PR: ${bestPR} kg. Average duration: ${avgDur} minutes.`;
  }
}

function renderBFChart() {
  const canvas = document.getElementById('bfChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const sorted = [...bodyComp].sort((a,b) => a.date.localeCompare(b.date)).slice(-10);
  const data = sorted.map(e => e.bf);
  const labels = sorted.map(e => parseLocalDate(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}));

  if(!data.length) { ctx.clearRect(0,0,canvas.width,canvas.height); return; }
  const bfDesc = document.getElementById('bfChart-desc');
  if(bfDesc) {
    const latest = data.length ? data[data.length-1] : null;
    bfDesc.textContent = `Body fat trend over ${data.length} entries. Latest: ${latest === null ? 'no data' : latest + '%'}.`;
  }

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 600;
  const H = 140;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0,0,W,H);

  const pad = {l:40,r:20,t:15,b:25};
  const minV = Math.min(...data)-2;
  const maxV = Math.max(...data)+2;
  const range = maxV - minV || 1;
  const toX = i => pad.l + (W-pad.l-pad.r)*i/(Math.max(data.length-1,1));
  const toY = v => pad.t + (H-pad.t-pad.b)*(1-(v-minV)/range);

  // Grid
  ctx.strokeStyle = '#2a2a3c'; ctx.lineWidth=1;
  [0,.5,1].forEach(f => {
    const y = pad.t + (H-pad.t-pad.b)*f;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    ctx.fillStyle='#7070a0'; ctx.font='10px system-ui'; ctx.textAlign='right';
    ctx.fillText((maxV-(maxV-minV)*f).toFixed(1)+'%', pad.l-4, y+4);
  });
  ctx.fillStyle='#7070a0'; ctx.font='10px system-ui'; ctx.textAlign='center';
  labels.forEach((l,i) => ctx.fillText(l, toX(i), H-4));

  // Gradient fill
  const grad = ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,'rgba(255,107,53,0.3)'); grad.addColorStop(1,'rgba(74,222,128,0)');
  ctx.beginPath(); ctx.moveTo(toX(0),H-pad.b);
  data.forEach((_,i) => ctx.lineTo(toX(i),toY(data[i])));
  ctx.lineTo(toX(data.length-1),H-pad.b); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();

  // Line
  ctx.beginPath();
  data.forEach((v,i) => i===0 ? ctx.moveTo(toX(i),toY(v)) : ctx.lineTo(toX(i),toY(v)));
  ctx.strokeStyle='#ff6b35'; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.stroke();

  // Dots
  data.forEach((v,i) => {
    ctx.beginPath(); ctx.arc(toX(i),toY(v),4,0,Math.PI*2);
    ctx.fillStyle='#ff6b35'; ctx.fill();
    ctx.strokeStyle=document.documentElement.dataset.theme==='light'?'#f5f5f8':'#08080e'; ctx.lineWidth=2; ctx.stroke();
  });

  // Target line
  if(userGoals.targetBF && userGoals.targetBF >= minV && userGoals.targetBF <= maxV) {
    const ty = toY(userGoals.targetBF);
    ctx.setLineDash([5,5]);
    ctx.strokeStyle='#4ade80'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad.l,ty); ctx.lineTo(W-pad.r,ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#4ade80'; ctx.font='10px system-ui'; ctx.textAlign='left';
    ctx.fillText('Target', W-pad.r-35, ty-5);
  }
}






















