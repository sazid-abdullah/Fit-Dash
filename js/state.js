// ══ STATE ════════════════════════════════════════════════════
// safeLoad wraps JSON.parse so that corrupted localStorage data (manual edits,
// browser bugs, version mismatches) never white-screens the app — it falls back
// to the supplied default and clears the broken key so future saves work cleanly.
const FITDASH_DEBUG = false; // flip to true during development for console diagnostics
function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if(raw === null) return fallback;
    return JSON.parse(raw);
  } catch(e) {
    if(FITDASH_DEBUG) console.warn('fitdash: corrupted localStorage key "' + key + '", resetting to default.', e);
    try { localStorage.removeItem(key); } catch(_) {}
    return fallback;
  }
}

let sessions    = safeLoad('fitdash_sessions', []);
let weights     = safeLoad('fitdash_weights',  []);
let prs         = safeLoad('fitdash_prs',      {});
let checklist   = safeLoad('fitdash_check',    {});
let cardioMins  = safeLoad('fitdash_cardio', 0);  // safeLoad handles JSON.parse; falls back to 0
if(typeof cardioMins !== 'number' || isNaN(cardioMins)) cardioMins = 0;  // corrupted value guard
let lastCardioReset = safeLoad('fitdash_cardio_week', '');
let activePlan  = safeLoad('fitdash_plan', '1500');
// Run any localStorage migrations (versioning) early on load.
function migrateStorage() {
  try {
    const CUR = 1; // current storage schema version
    const key = 'fitdash_data_version';
    const stored = parseInt(localStorage.getItem(key) || '0', 10) || 0;
    if(stored >= CUR) return;
    // Example migration placeholder(s):
    // if(stored < 1) { /* migrate older key shapes -> new keys */ }
    // After applying migrations, persist new version.
    localStorage.setItem(key, String(CUR));
    if(FITDASH_DEBUG) console.log('fitdash: storage migrated to version', CUR);
  } catch(err) {
    if(FITDASH_DEBUG) console.warn('fitdash: migration failed', err);
  }
}
migrateStorage();

// Mobile quick actions
function mobileLogFood() {
  showPage('nutrition');
  setTimeout(() => {
    const el = document.getElementById('cal-tracker-content');
    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 140);
}

function mobileStartWorkout() {
  showPage('training');
  setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 80);
}

function mobileOpenPlan() { showPage('nutrition'); setTimeout(() => { const el = document.getElementById('plan-1500'); if(el) el.scrollIntoView({behavior:'smooth', block:'center'}); }, 140); }

// save() wraps setItem so a full localStorage (QuotaExceededError) is surfaced
// to the user rather than silently dropped. This is the single write path for
// all fitdash data — every other caller goes through here.
function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch(e) {
    if(e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert('Storage full — your device has no space left for new data.\nTry exporting your history (Progress → Export CSV) then clearing old sessions.');
    } else {
      if(FITDASH_DEBUG) console.error('fitdash: localStorage write failed for key "' + key + '"', e);
    }
    return false;
  }
}

/**
 * Parse a stored YYYY-MM-DD date string in LOCAL time instead of UTC.
 * new Date("2026-07-30") is treated as UTC midnight, which shifts the date
 * backward one day for users in timezones behind UTC (e.g. the Americas, Bangladesh).
 * Using new Date(y, m-1, d) always constructs a local-midnight date.
 */
function parseLocalDate(str) {
  if(!str) return new Date();
  const parts = str.split('-');
  if(parts.length !== 3) return new Date(str);
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Escape HTML special characters to prevent XSS when rendering user input.
 */
function escapeHtml(str) {
  if(!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Returns a YYYY-MM-DD string in LOCAL time.
 * new Date().toISOString().split('T')[0] returns the UTC date — which for
 * UTC+6 (Bangladesh) can be one calendar day behind the local date during
 * morning hours, mis-filing sessions and breaking the streak tracker.
 */
function getLocalDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ══ THEME SYSTEM ══════════════════════════════════════════
function initTheme() {
  const t = safeLoad('fitdash_theme', 'dark');
  document.documentElement.dataset.theme = t;
  updateThemeBtn(t);
}
function toggleTheme() {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  save('fitdash_theme', t);
  updateThemeBtn(t);
}
function updateThemeBtn(t) {
  const btn = document.getElementById('theme-toggle-btn');
  if(btn) btn.innerHTML = t === 'dark' ? '🌙 Dark' : '☀️ Light';
  const navBtn = document.getElementById('nav-theme-btn');
  if(navBtn) navBtn.textContent = t === 'dark' ? '🌙' : '☀️';
}
initTheme();

// ══ SOUND & VIBRATION ════════════════════════════════════════
let soundEnabled = safeLoad('fitdash_sound', true);
let hapticsEnabled = safeLoad('fitdash_haptics', true);

function initDeviceSettings() {
  updateDeviceSettingsUI();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  save('fitdash_sound', soundEnabled);
  updateDeviceSettingsUI();
  if (soundEnabled) playSound();
}

function toggleHaptics() {
  hapticsEnabled = !hapticsEnabled;
  save('fitdash_haptics', hapticsEnabled);
  updateDeviceSettingsUI();
  if (hapticsEnabled) playHaptic();
}

function updateDeviceSettingsUI() {
  const sBtn = document.getElementById('sound-toggle-btn');
  if(sBtn) sBtn.innerHTML = soundEnabled ? '🔊 On' : '🔇 Off';
  const hBtn = document.getElementById('haptic-toggle-btn');
  if(hBtn) hBtn.innerHTML = hapticsEnabled ? '📳 On' : '📴 Off';
}

function playSound() {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) { /* ignore */ }
}

function playHaptic() {
  if (!hapticsEnabled) return;
  if ('vibrate' in navigator) {
    try { navigator.vibrate(50); } catch(e) { /* ignore */ }
  }
}
initDeviceSettings();