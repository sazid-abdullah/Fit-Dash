// ══ WEEKLY SCHEDULE & REMINDERS ══════════════════════════════
// Local-only reminders: checked every 30s while FitDash is open. When the tab is in the
// background they use browser notifications (if allowed); otherwise an in-app banner.
// The .ics export lets the phone/desktop calendar fire them even when FitDash is closed.

const SCHEDULE_DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ICS_DAYS = ['SU','MO','TU','WE','TH','FR','SA'];
const REMINDER_GRACE_MINS = 180;
const REMINDER_SNOOZE_MINS = 15;
const REMINDER_CHECK_MS = 30000;

const DEFAULT_REMINDERS = {
  enabled: false,
  workout: { on: true,  time: '18:00' },
  water:   { on: true,  start: '09:00', end: '21:00', every: 120 },
  meals:   { on: false, times: ['08:30', '13:30', '20:00'] },
  weighin: { on: true,  time: '07:30', days: [1] },
  sleep:   { on: true,  time: '22:30' },
};

function validTime(t, fallback) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(t || '') ? t : fallback; }
function timeToMins(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function minsToTime(m) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }

function normalizeReminders(raw) {
  const d = DEFAULT_REMINDERS;
  const r = raw && typeof raw === 'object' ? raw : {};
  const pick = (k) => (r[k] && typeof r[k] === 'object') ? r[k] : {};
  const w = pick('workout'), wa = pick('water'), me = pick('meals'), wi = pick('weighin'), sl = pick('sleep');
  const legacy = typeof userProfile !== 'undefined' ? userProfile : {};
  const legacyTime = legacy.reminderTime;
  const every = parseInt(wa.every, 10);
  return {
    // Before fitdash_reminders existed, the workout reminder opt-in lived on the profile.
    enabled: raw && typeof raw === 'object' ? !!r.enabled : legacy.reminderEnabled === true,
    workout: { on: w.on !== undefined ? !!w.on : d.workout.on, time: validTime(w.time, validTime(legacyTime, d.workout.time)) },
    water: { on: wa.on !== undefined ? !!wa.on : d.water.on, start: validTime(wa.start, d.water.start), end: validTime(wa.end, d.water.end),
             every: [30, 60, 90, 120, 180].includes(every) ? every : d.water.every },
    meals: { on: !!me.on, times: (Array.isArray(me.times) ? me.times : d.meals.times).map((t, i) => validTime(t, d.meals.times[i] || '12:00')).slice(0, 6) },
    weighin: { on: wi.on !== undefined ? !!wi.on : d.weighin.on, time: validTime(wi.time, d.weighin.time),
               days: Array.isArray(wi.days) ? wi.days.filter(x => Number.isInteger(x) && x >= 0 && x <= 6) : d.weighin.days.slice() },
    sleep: { on: sl.on !== undefined ? !!sl.on : d.sleep.on, time: validTime(sl.time, d.sleep.time) },
  };
}

let reminderPrefs = normalizeReminders(safeLoad('fitdash_reminders', null));

// ── Weekly schedule ──────────────────────────────────────────
// One entry per weekday: { routine: 'rest' | 'any' | <routine id>, time: '' | 'HH:MM' }.
function normalizeWeekPlan(raw) {
  const trainDays = (typeof userProfile !== 'undefined' && Array.isArray(userProfile.schedule)) ? userProfile.schedule : [0,1,2,3,4,5,6];
  return SCHEDULE_DAY_NAMES.map((_, day) => {
    const e = Array.isArray(raw) && raw[day] && typeof raw[day] === 'object' ? raw[day] : null;
    const routine = e && typeof e.routine === 'string' ? e.routine : (trainDays.includes(day) ? 'any' : 'rest');
    return { routine, time: validTime(e && e.time, '') };
  });
}

let weekPlan = normalizeWeekPlan(safeLoad('fitdash_week_plan', null));

function isScheduledTrainingDay(day) { return weekPlan[day].routine !== 'rest'; }

function scheduledRoutineFor(day) {
  const id = weekPlan[day].routine;
  return (id !== 'rest' && id !== 'any') ? routines.find(r => r.id === id) || null : null;
}

function workoutTimeFor(day) { return weekPlan[day].time || reminderPrefs.workout.time; }

function saveWeekPlan() {
  save('fitdash_week_plan', weekPlan);
  userProfile.schedule = weekPlan.map((e, day) => e.routine !== 'rest' ? day : null).filter(d => d !== null);
  save('fitdash_profile', userProfile);
}

// Switch to the day's planned routine once per day so manual switches later in the day stick.
function applyScheduledRoutine() {
  const today = getLocalDateStr();
  if(safeLoad('fitdash_schedule_applied', '') === today) return;
  save('fitdash_schedule_applied', today);
  const r = scheduledRoutineFor(new Date().getDay());
  if(r && r.id !== activeRoutineId) activateRoutine(r.id);
}

function trainedOn(dateStr) { return sessions.some(s => typeof s.date === 'string' && s.date.startsWith(dateStr)); }

function renderWeekStrip() {
  const el = document.getElementById('dash-week-strip');
  if(!el) return;
  const now = new Date();
  const todayDay = now.getDay();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayDay);
  const cells = SCHEDULE_DAY_NAMES.map((name, day) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + day);
    const dateStr = dateToStableStr(date);
    const train = isScheduledTrainingDay(day);
    const done = trainedOn(dateStr);
    const r = scheduledRoutineFor(day);
    const label = !train ? 'Rest' : r ? r.name : 'Train';
    const cls = ['week-day', train ? 'train' : 'rest', day === todayDay ? 'today' : '', done ? 'done' : '', (!done && train && day < todayDay) ? 'missed' : ''].filter(Boolean).join(' ');
    const title = `${name}: ${label}${train ? ' at ' + workoutTimeFor(day) : ''}${done ? ' · trained' : ''}`;
    return `<div class="${cls}" title="${escapeHtml(title)}"><div class="week-day-name">${name}</div><div class="week-day-icon">${done ? '✓' : train ? '🏋️' : '🧘'}</div><div class="week-day-label">${escapeHtml(label)}</div></div>`;
  }).join('');
  const next = nextReminderToday();
  const status = !reminderPrefs.enabled
    ? `<a href="#" onclick="openReminderSettings();return false;">⏰ Turn on reminders</a>`
    : next ? `⏰ Next: ${escapeHtml(next.title)} at ${next.time}` : '⏰ No more reminders today';
  el.innerHTML = `<div class="week-strip">${cells}</div><div class="week-strip-foot"><span>${status}</span><a href="#" onclick="openReminderSettings('s-week-plan');return false;">Edit week</a></div>`;
}

function openReminderSettings(anchor) {
  showPage('settings');
  setTimeout(() => { const t = document.getElementById(anchor || 's-reminders'); if(t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
}

// ── Reminder slots ───────────────────────────────────────────
function reminderSlotsFor(date) {
  const day = date.getDay();
  const p = reminderPrefs;
  const slots = [];
  if(p.workout.on && isScheduledTrainingDay(day)) {
    const r = scheduledRoutineFor(day) || getActiveRoutine();
    slots.push({ id: 'workout', kind: 'workout', time: workoutTimeFor(day), title: 'Workout time', body: `${r.name} routine is planned for today.` });
  }
  if(p.water.on) {
    const start = timeToMins(p.water.start), end = timeToMins(p.water.end);
    for(let m = start; m <= end; m += p.water.every) {
      slots.push({ id: 'water-' + minsToTime(m), kind: 'water', time: minsToTime(m), title: 'Drink water', body: '' });
    }
  }
  if(p.meals.on) {
    const names = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Snack', 'Snack'];
    p.meals.times.forEach((t, i) => slots.push({ id: 'meal-' + i, kind: 'meal', index: i, time: t, title: `${names[i]} time`, body: 'Log what you eat to stay on target.' }));
  }
  if(p.weighin.on && p.weighin.days.includes(day)) {
    slots.push({ id: 'weighin', kind: 'weighin', time: p.weighin.time, title: 'Weigh-in', body: 'Weigh yourself after the bathroom, before eating.' });
  }
  if(p.sleep.on) {
    slots.push({ id: 'sleep', kind: 'sleep', time: p.sleep.time, title: 'Wind down for bed', body: 'Screens off soon — aim for 7–8h of sleep.' });
  }
  return slots.sort((a, b) => a.time.localeCompare(b.time));
}

function isReminderSatisfied(slot) {
  const today = getLocalDateStr();
  if(slot.kind === 'workout') return trainedOn(today);
  if(slot.kind === 'water') return waterLog.date === today && waterLog.ml >= (userGoals.waterTarget || 3000);
  if(slot.kind === 'meal') return (calorieLog[today] || []).length > slot.index;
  if(slot.kind === 'weighin') return weights.some(w => w.date === today);
  return false;
}

function reminderBody(slot) {
  if(slot.kind !== 'water') return slot.body;
  const goal = userGoals.waterTarget || 3000;
  const ml = waterLog.date === getLocalDateStr() ? waterLog.ml : 0;
  return `${ml} / ${goal} ml so far — ${Math.max(0, goal - ml)} ml to go.`;
}

function loadReminderLog() {
  const today = getLocalDateStr();
  const log = safeLoad('fitdash_reminder_log', null);
  return log && log.date === today && log.fired && log.snooze ? log : { date: today, fired: {}, snooze: {} };
}

function nextReminderToday() {
  if(!reminderPrefs.enabled) return null;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const log = loadReminderLog();
  return reminderSlotsFor(now).find(s => timeToMins(s.time) > nowMins && !log.fired[s.id] && !isReminderSatisfied(s)) || null;
}

// Every open tab runs this timer; a Web Lock makes tabs take turns so the log read below
// already contains slots another tab just fired.
function checkReminders() {
  if(!reminderPrefs.enabled) return;
  if(navigator.locks && navigator.locks.request) {
    navigator.locks.request('fitdash-reminders', runReminderCheck).catch(() => {});
  } else {
    runReminderCheck();
  }
}

function runReminderCheck() {
  if(!reminderPrefs.enabled) return;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const log = loadReminderLog();
  const due = [];
  reminderSlotsFor(now).forEach(slot => {
    const snoozedUntil = log.snooze[slot.id];
    if(snoozedUntil) {
      if(Date.now() < snoozedUntil) return;
      delete log.snooze[slot.id];
    } else {
      if(log.fired[slot.id]) return;
      const mins = timeToMins(slot.time);
      if(mins > nowMins || nowMins - mins > REMINDER_GRACE_MINS) return;
    }
    log.fired[slot.id] = true;
    if(!isReminderSatisfied(slot)) due.push(slot);
  });
  // Several water slots can be due after the app was closed for a while — only nag once.
  const lastWater = due.filter(s => s.kind === 'water').pop();
  const toFire = due.filter(s => s.kind !== 'water' || s === lastWater);
  save('fitdash_reminder_log', log);
  toFire.forEach(fireReminder);
  if(toFire.length || due.length) renderWeekStrip();
}

// ── Delivery ────────────────────────────────────────────────
let reminderQueue = [];

function fireReminder(slot) {
  const body = reminderBody(slot);
  if(document.hidden || !document.hasFocus()) showSystemNotification(slot.title, body, { id: slot.id, kind: slot.kind });
  reminderQueue = reminderQueue.filter(s => s.id !== slot.id);
  reminderQueue.push({ ...slot, body });
  renderReminderBanner();
  if(typeof playSound === 'function') playSound();
}

function notificationsSupported() { return typeof Notification !== 'undefined'; }

function showSystemNotification(title, body, data) {
  if(!notificationsSupported() || Notification.permission !== 'granted') return;
  const opts = { body, tag: 'fitdash-' + data.id, data, renotify: true };
  const fallback = () => {
    try {
      const n = new Notification(title, opts);
      n.onclick = () => { window.focus(); runReminderAction(data.id, data.kind); n.close(); };
    } catch(e) { /* some mobile browsers only allow SW notifications */ }
  };
  if('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.getRegistration().then(reg => {
      if(reg && reg.showNotification) {
        return reg.showNotification(title, { ...opts, actions: [{ action: 'snooze', title: `Snooze ${REMINDER_SNOOZE_MINS} min` }] });
      }
      fallback();
    }).catch(fallback);
  } else {
    fallback();
  }
}

const REMINDER_ACTIONS = {
  workout: { label: 'Start workout', run: () => showPage('training') },
  water:   { label: '+250 ml', run: () => (typeof quickAddWater === 'function' ? quickAddWater(250) : addWater(250)) },
  meal:    { label: 'Log food', run: () => { showPage('dashboard'); setTimeout(() => qlScrollTo('food-name-input'), 150); } },
  weighin: { label: 'Log weight', run: () => { showPage('dashboard'); setTimeout(() => qlScrollTo('ql-weight'), 150); } },
  sleep:   { label: 'Got it', run: () => {} },
};

function renderReminderBanner() {
  const el = document.getElementById('reminder-banner');
  if(!el) return;
  const slot = reminderQueue[0];
  if(!slot) { el.hidden = true; el.innerHTML = ''; return; }
  const action = REMINDER_ACTIONS[slot.kind];
  const more = reminderQueue.length > 1 ? `<span class="reminder-more">+${reminderQueue.length - 1} more</span>` : '';
  el.innerHTML = `<div class="reminder-banner-text"><strong>⏰ ${escapeHtml(slot.title)}</strong> ${more}<div>${escapeHtml(slot.body)}</div></div>
    <div class="reminder-banner-actions">
      <button class="btn-red" onclick="reminderBannerAction('do')">${escapeHtml(action.label)}</button>
      <button class="btn-ghost" onclick="reminderBannerAction('snooze')">Snooze ${REMINDER_SNOOZE_MINS}m</button>
      <button class="btn-ghost" onclick="reminderBannerAction('dismiss')" aria-label="Dismiss reminder">✕</button>
    </div>`;
  el.hidden = false;
}

function reminderBannerAction(what) {
  const slot = reminderQueue.shift();
  renderReminderBanner();
  if(!slot) return;
  if(what === 'snooze') snoozeReminder(slot.id);
  else if(what === 'do') REMINDER_ACTIONS[slot.kind].run();
}

function snoozeReminder(id) {
  const log = loadReminderLog();
  log.snooze[id] = Date.now() + REMINDER_SNOOZE_MINS * 60000;
  save('fitdash_reminder_log', log);
}

function runReminderAction(id, kind) {
  reminderQueue = reminderQueue.filter(s => s.id !== id);
  renderReminderBanner();
  if(REMINDER_ACTIONS[kind]) REMINDER_ACTIONS[kind].run();
}

if('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data || {};
    if(d.type !== 'fitdash-reminder' || !d.id) return;
    if(d.action === 'snooze') {
      reminderQueue = reminderQueue.filter(s => s.id !== d.id);
      renderReminderBanner();
      snoozeReminder(d.id);
    } else {
      runReminderAction(d.id, d.kind);
    }
  });
}

// ── Settings UI ─────────────────────────────────────────────
function renderWeekPlanSettings() {
  const el = document.getElementById('s-week-plan');
  if(!el) return;
  const opts = (sel) => [
    `<option value="rest"${sel === 'rest' ? ' selected' : ''}>Rest / recovery</option>`,
    `<option value="any"${sel === 'any' ? ' selected' : ''}>Train · current</option>`,
    ...routines.map(r => `<option value="${escapeHtml(r.id)}"${sel === r.id ? ' selected' : ''}>Train · ${escapeHtml(r.name)}</option>`),
  ].join('');
  el.innerHTML = weekPlan.map((e, day) => {
    const known = e.routine === 'rest' || e.routine === 'any' || routines.some(r => r.id === e.routine);
    return `<div class="week-plan-row">
      <div class="week-plan-day">${SCHEDULE_DAY_NAMES[day]}</div>
      <select class="settings-select" data-day="${day}" data-field="routine" aria-label="${SCHEDULE_DAY_NAMES[day]} plan">${opts(known ? e.routine : 'any')}</select>
      <input type="time" class="settings-input" data-day="${day}" data-field="time" value="${e.time}" placeholder="${reminderPrefs.workout.time}" aria-label="${SCHEDULE_DAY_NAMES[day]} workout time" title="Workout time (blank = default reminder time)">
    </div>`;
  }).join('');
}

function saveScheduleSettings() {
  document.querySelectorAll('#s-week-plan [data-field]').forEach(input => {
    const day = parseInt(input.dataset.day, 10);
    if(input.dataset.field === 'routine') weekPlan[day].routine = input.value;
    else weekPlan[day].time = validTime(input.value, '');
  });
  saveWeekPlan();
  const r = scheduledRoutineFor(new Date().getDay());
  if(r && r.id !== activeRoutineId) activateRoutine(r.id);
  setReminderStatus('Schedule saved.', 'var(--green)', 'schedule-settings-status');
  renderDashboard();
  if(typeof renderCardioPlan === 'function') renderCardioPlan();
}

function renderReminderSettings() {
  const p = reminderPrefs;
  const set = (id, prop, val) => { const el = document.getElementById(id); if(el) el[prop] = val; };
  set('s-rem-enabled', 'checked', p.enabled);
  set('s-rem-workout-on', 'checked', p.workout.on);
  set('s-rem-workout-time', 'value', p.workout.time);
  set('s-rem-water-on', 'checked', p.water.on);
  set('s-rem-water-start', 'value', p.water.start);
  set('s-rem-water-end', 'value', p.water.end);
  set('s-rem-water-every', 'value', String(p.water.every));
  set('s-rem-meals-on', 'checked', p.meals.on);
  set('s-rem-meals-times', 'value', p.meals.times.join(', '));
  set('s-rem-weighin-on', 'checked', p.weighin.on);
  set('s-rem-weighin-time', 'value', p.weighin.time);
  document.querySelectorAll('#s-rem-weighin-days .day-toggle-btn').forEach(btn => btn.classList.toggle('active', p.weighin.days.includes(parseInt(btn.dataset.day, 10))));
  set('s-rem-sleep-on', 'checked', p.sleep.on);
  set('s-rem-sleep-time', 'value', p.sleep.time);
  renderNotificationPermissionStatus();
}

function renderNotificationPermissionStatus() {
  const el = document.getElementById('s-rem-permission');
  if(!el) return;
  if(!notificationsSupported()) { el.textContent = 'This browser has no notification support — reminders show as a banner while FitDash is open.'; return; }
  const state = Notification.permission;
  el.textContent = state === 'granted' ? 'Browser notifications allowed. Reminders fire while FitDash is open (any tab or the installed app).'
    : state === 'denied' ? 'Browser notifications are blocked for this site — reminders show as a banner while FitDash is open. Allow notifications in site settings to get pop-ups.'
    : 'Turn reminders on to allow browser notifications.';
}

function setReminderStatus(msg, color, id) {
  const el = document.getElementById(id || 'reminder-settings-status');
  if(el) { el.textContent = msg; el.style.color = color || 'var(--muted)'; }
}

function saveReminderSettings() {
  const val = id => (document.getElementById(id) || {}).value;
  const on = id => !!(document.getElementById(id) || {}).checked;
  const meals = String(val('s-rem-meals-times') || '').split(/[,\s]+/).filter(Boolean);
  const badMeal = meals.find(t => !validTime(t, ''));
  if(badMeal) { setReminderStatus(`"${badMeal}" isn't a time — use 24h HH:MM, e.g. 13:30.`, 'var(--red)'); return; }
  const prev = reminderPrefs;
  reminderPrefs = normalizeReminders({
    enabled: on('s-rem-enabled'),
    workout: { on: on('s-rem-workout-on'), time: val('s-rem-workout-time') },
    water: { on: on('s-rem-water-on'), start: val('s-rem-water-start'), end: val('s-rem-water-end'), every: parseInt(val('s-rem-water-every'), 10) },
    meals: { on: on('s-rem-meals-on'), times: meals.length ? meals : DEFAULT_REMINDERS.meals.times },
    weighin: { on: on('s-rem-weighin-on'), time: val('s-rem-weighin-time'),
               days: [...document.querySelectorAll('#s-rem-weighin-days .day-toggle-btn.active')].map(b => parseInt(b.dataset.day, 10)) },
    sleep: { on: on('s-rem-sleep-on'), time: val('s-rem-sleep-time') },
  });
  save('fitdash_reminders', reminderPrefs);
  renderReminderSettings();
  renderWeekStrip();
  if(typeof renderTrainingReminder === 'function') renderTrainingReminder();
  setReminderStatus(reminderPrefs.enabled ? 'Reminders saved.' : 'Reminders saved (currently off).', 'var(--green)');
  if(reminderPrefs.enabled && !prev.enabled) requestReminderPermission();
}

function requestReminderPermission() {
  if(!notificationsSupported() || Notification.permission !== 'default') { renderNotificationPermissionStatus(); return; }
  Notification.requestPermission().then(renderNotificationPermissionStatus).catch(() => {});
}

function testReminder() {
  const slot = { id: 'test', kind: 'water', time: minsToTime(new Date().getHours() * 60 + new Date().getMinutes()), title: 'Drink water (test)' };
  const body = reminderBody(slot);
  showSystemNotification(slot.title, body, { id: slot.id, kind: slot.kind });
  reminderQueue = reminderQueue.filter(s => s.id !== 'test');
  reminderQueue.unshift({ ...slot, body });
  renderReminderBanner();
  if(notificationsSupported() && Notification.permission === 'default') requestReminderPermission();
}

// ── Calendar (.ics) export ───────────────────────────────────
function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n'); }

function nextDateForDay(day) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((day - now.getDay() + 7) % 7));
}

function icsEvent(uid, start, time, rrule, summary, desc) {
  const [hh, mm] = time.split(':');
  const ymd = dateToStableStr(start).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return ['BEGIN:VEVENT', `UID:${uid}@fitdash.local`, `DTSTAMP:${stamp}`, `DTSTART:${ymd}T${hh}${mm}00`, 'DURATION:PT10M',
    `RRULE:${rrule}`, `SUMMARY:${icsEscape(summary)}`, `DESCRIPTION:${icsEscape(desc)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(summary)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'];
}

function buildReminderCalendar() {
  const p = reminderPrefs;
  const today = new Date();
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FitDash//Reminders//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:FitDash Reminders'];
  if(p.workout.on) {
    weekPlan.forEach((e, day) => {
      if(e.routine === 'rest') return;
      const r = scheduledRoutineFor(day);
      lines.push(...icsEvent(`workout-${day}`, nextDateForDay(day), workoutTimeFor(day), `FREQ=WEEKLY;BYDAY=${ICS_DAYS[day]}`,
        `FitDash: Workout${r ? ' · ' + r.name : ''}`, 'Open FitDash and start your workout.'));
    });
  }
  if(p.water.on) {
    for(let m = timeToMins(p.water.start); m <= timeToMins(p.water.end); m += p.water.every) {
      lines.push(...icsEvent(`water-${m}`, today, minsToTime(m), 'FREQ=DAILY', 'FitDash: Drink water', 'Log it with one tap from the FitDash dashboard.'));
    }
  }
  if(p.meals.on) p.meals.times.forEach((t, i) => lines.push(...icsEvent(`meal-${i}`, today, t, 'FREQ=DAILY', 'FitDash: Meal time', 'Log your meal in FitDash.')));
  if(p.weighin.on && p.weighin.days.length) {
    const first = p.weighin.days.map(nextDateForDay).sort((a, b) => a - b)[0];
    lines.push(...icsEvent('weighin', first, p.weighin.time, `FREQ=WEEKLY;BYDAY=${p.weighin.days.map(d => ICS_DAYS[d]).join(',')}`,
      'FitDash: Weigh-in', 'Weigh yourself after the bathroom, before eating.'));
  }
  if(p.sleep.on) lines.push(...icsEvent('sleep', today, p.sleep.time, 'FREQ=DAILY', 'FitDash: Wind down for bed', 'Screens off soon — aim for 7–8h of sleep.'));
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

function downloadReminderCalendar() {
  const blob = new Blob([buildReminderCalendar()], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'fitdash-reminders.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  setReminderStatus('Calendar file downloaded — open it to add the reminders to your calendar app.', 'var(--green)');
}

// ── Init ────────────────────────────────────────────────────
let reminderTickDate = getLocalDateStr();

// Also handles a tab left open past midnight: pick the new day's routine and refresh day-based views.
function reminderTick() {
  const today = getLocalDateStr();
  if(today !== reminderTickDate) {
    reminderTickDate = today;
    applyScheduledRoutine();
    renderDashboard();
    if(typeof renderTrainingReminder === 'function') renderTrainingReminder();
  }
  checkReminders();
}

// A notification clicked after every FitDash tab was closed opens index.html?reminder=<id>&kind=<kind>.
function consumeReminderLaunchParams() {
  const params = new URLSearchParams(location.search);
  const id = params.get('reminder'), kind = params.get('kind');
  if(!id) return;
  params.delete('reminder'); params.delete('kind');
  const qs = params.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  if(REMINDER_ACTIONS[kind]) setTimeout(() => runReminderAction(id, kind), 300);
}

window.addEventListener('storage', e => {
  if(e.key === 'fitdash_reminders') reminderPrefs = normalizeReminders(safeLoad('fitdash_reminders', null));
  else if(e.key === 'fitdash_week_plan') weekPlan = normalizeWeekPlan(safeLoad('fitdash_week_plan', null));
  else return;
  renderWeekStrip();
});

applyScheduledRoutine();
renderWeekStrip();
consumeReminderLaunchParams();
setInterval(reminderTick, REMINDER_CHECK_MS);
document.addEventListener('visibilitychange', () => { if(!document.hidden) { reminderTick(); renderWeekStrip(); } });
setTimeout(reminderTick, 1500);
