// ══ ACCOUNT & CLOUD SYNC (optional Firebase) ═════════════════
// FitDash stays local-first: with no Firebase config, or while signed out, everything
// lives in localStorage exactly as before ("Local Mode"). When the owner supplies a
// Firebase web config (window.FITDASH_FIREBASE_CONFIG or Settings → Firebase config),
// signed-in users get their data mirrored to Firestore under users/{uid}/fitdash/state.
// The Firebase v10 modular SDK is loaded from the gstatic ESM CDN with dynamic import(),
// so there is still no build step and nothing is downloaded until a config exists.
const FIREBASE_SDK_BASE = 'https://www.gstatic.com/firebasejs/10.12.2/';
const CLOUD_SYNC_KEYS = [
  'fitdash_sessions', 'fitdash_prs', 'fitdash_custom_ex', 'fitdash_calorie_log', 'fitdash_weights',
  'fitdash_bodycomp', 'fitdash_circ', 'fitdash_check', 'fitdash_water', 'fitdash_sleep',
  'fitdash_cardio', 'fitdash_cardio_week', 'fitdash_cardio_log', 'fitdash_profile', 'fitdash_goals',
  'fitdash_saved_ai_plans',
  // Durable training + nutrition setup, so a new device looks the same as the old one.
  'fitdash_routines', 'fitdash_active_routine', 'fitdash_training_category', 'fitdash_level',
  'fitdash_progression_prefs', 'fitdash_overrides', 'fitdash_video_codes', 'fitdash_fav_exercises',
  'fitdash_week_plan', 'fitdash_reminders', 'fitdash_plan', 'fitdash_ai_plan', 'fitdash_custom_dishes',
  'fitdash_saved_recipes', 'fitdash_fav_foods', 'fitdash_micronutrient_log', 'fitdash_grocery_list',
];
// fitdash_ai_config holds private provider API keys — it must never leave the device.
const CLOUD_NEVER_SYNC = ['fitdash_ai_config', 'fitdash_firebase_config', 'fitdash_sync_meta'];
// How each key is combined when both this device and the cloud changed it.
// Anything not listed: the newer copy wins.
const CLOUD_MERGE_RULES = {
  fitdash_sessions: 'byId', fitdash_custom_ex: 'byId', fitdash_saved_ai_plans: 'byId', fitdash_cardio_log: 'byId',
  fitdash_weights: 'byDate', fitdash_bodycomp: 'byDate', fitdash_circ: 'byDate',
  fitdash_routines: 'byId', fitdash_calorie_log: 'byKey', fitdash_micronutrient_log: 'byKey', fitdash_prs: 'maxPR',
};
const CLOUD_PUSH_DELAY_MS = 1500;

const cloud = {
  configured: false, ready: false, sdk: null, auth: null, db: null, user: null,
  status: 'local', statusDetail: '', pushTimer: null, syncing: false, syncAgain: false,
  deleting: false, initPromise: null,
};

function getFirebaseConfig() {
  const fromWindow = window.FITDASH_FIREBASE_CONFIG;
  if(isValidFirebaseConfig(fromWindow)) return fromWindow;
  try {
    const stored = JSON.parse(localStorage.getItem('fitdash_firebase_config') || 'null');
    if(isValidFirebaseConfig(stored)) return stored;
  } catch(_) {}
  return null;
}

function isValidFirebaseConfig(cfg) {
  return !!(cfg && typeof cfg === 'object' && cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

// Accepts strict JSON or the `const firebaseConfig = { apiKey: "..." }` snippet the Firebase console shows.
function parseFirebaseConfigInput(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if(!match) throw new Error('Paste the firebaseConfig object, e.g. { "apiKey": "...", "projectId": "..." }');
  let body = match[0];
  try { return JSON.parse(body); } catch(_) {}
  body = body
    .replace(/\/\/.*$/gm, '')
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/'([^']*)'/g, '"$1"')
    .replace(/,\s*}/g, '}');
  return JSON.parse(body);
}

// ── Sync bookkeeping (device-only) ──────────────────────────
function loadSyncMeta() {
  try {
    const meta = JSON.parse(localStorage.getItem('fitdash_sync_meta') || 'null');
    if(meta && typeof meta === 'object') return { localMod: {}, cloudMod: {}, ...meta };
  } catch(_) {}
  return { uid: null, lastSyncAt: 0, localMod: {}, cloudMod: {} };
}
function storeSyncMeta(meta) {
  try { localStorage.setItem('fitdash_sync_meta', JSON.stringify(meta)); } catch(_) {}
}

// Called by save() in state.js after every successful local write.
function fitdashCloudOnSave(key) {
  if(!CLOUD_SYNC_KEYS.includes(key)) return;
  const meta = loadSyncMeta();
  meta.localMod[key] = Date.now();
  storeSyncMeta(meta);
  scheduleCloudPush();
}

function scheduleCloudPush() {
  if(!cloud.user || cloud.deleting) return;
  clearTimeout(cloud.pushTimer);
  cloud.pushTimer = setTimeout(() => { cloud.pushTimer = null; syncWithCloud(); }, CLOUD_PUSH_DELAY_MS);
}

// ── Status pill / account UI ────────────────────────────────
const CLOUD_STATUS_LABELS = {
  synced:  { icon: '☁️', text: 'Synced' },
  syncing: { icon: '🔄', text: 'Syncing...' },
  local:   { icon: '⚡', text: 'Local Mode' },
  offline: { icon: '⚠️', text: 'Offline' },
  error:   { icon: '⚠️', text: 'Sync issue' },
};

function setCloudStatus(status, detail = '') {
  cloud.status = status;
  cloud.statusDetail = detail;
  renderCloudUI();
}

function cloudStatusTitle() {
  if(!cloud.configured) return 'Local Mode: data is stored only on this device. Cloud sync is not set up.';
  if(!cloud.user) return 'Local Mode: sign in to back up and sync your data.';
  const base = { synced: 'All changes are saved to your account.', syncing: 'Saving changes to your account…',
    offline: 'You are offline. Changes stay on this device and sync when you reconnect.',
    error: 'Cloud sync hit a problem. Your data is still safe on this device.' }[cloud.status] || '';
  return cloud.statusDetail ? `${base} ${cloud.statusDetail}` : base;
}

function cloudUserLabel(user) {
  if(!user) return '';
  return user.displayName || user.email || 'Account';
}

function renderCloudUI() {
  const label = CLOUD_STATUS_LABELS[cloud.status] || CLOUD_STATUS_LABELS.local;
  const pill = document.getElementById('sync-pill');
  if(pill) {
    pill.dataset.status = cloud.status;
    pill.title = cloudStatusTitle();
    pill.setAttribute('aria-label', `Cloud sync: ${label.text}`);
    pill.innerHTML = `<span class="sync-ico" aria-hidden="true">${label.icon}</span><span class="sync-text">${label.text}</span>`;
  }
  const accountBtn = document.getElementById('account-btn');
  if(accountBtn) {
    if(cloud.user) {
      const name = cloudUserLabel(cloud.user);
      const initial = escapeHtml(name.trim().charAt(0).toUpperCase() || '👤');
      accountBtn.innerHTML = `<span class="account-avatar" aria-hidden="true">${initial}</span><span class="account-text">${escapeHtml(name.split('@')[0].slice(0, 14))}</span>`;
      accountBtn.title = `Signed in as ${name}`;
      accountBtn.classList.add('signed-in');
    } else {
      accountBtn.innerHTML = '<span aria-hidden="true">👤</span><span class="account-text">Sign In</span>';
      accountBtn.title = 'Sign in or create an account';
      accountBtn.classList.remove('signed-in');
    }
  }
  renderCloudSettingsCard();
  renderAuthModal();
}

function renderCloudSettingsCard() {
  const el = document.getElementById('cloud-account-status');
  if(!el) return;
  const label = CLOUD_STATUS_LABELS[cloud.status] || CLOUD_STATUS_LABELS.local;
  let html;
  if(!cloud.configured) {
    html = `<div class="cloud-status-line"><strong>${label.icon} Local Guest Mode</strong></div>
      <div class="cloud-note">Your data is stored only in this browser. Cloud accounts are available once the app owner adds a Firebase config below.</div>`;
  } else if(!cloud.user) {
    html = `<div class="cloud-status-line"><strong>${label.icon} Local Mode</strong> · not signed in</div>
      <div class="cloud-note">Sign in to back up your workouts, PRs, meals and body data and use them on any device. API keys for the AI Coach always stay on this device.</div>`;
  } else {
    const meta = loadSyncMeta();
    const last = meta.lastSyncAt ? new Date(meta.lastSyncAt).toLocaleString() : 'never';
    html = `<div class="cloud-status-line"><strong>${label.icon} ${label.text}</strong> · ${escapeHtml(cloudUserLabel(cloud.user))}</div>
      <div class="cloud-note">Last synced: ${escapeHtml(last)}${cloud.statusDetail ? ` · ${escapeHtml(cloud.statusDetail)}` : ''}</div>`;
  }
  el.innerHTML = html;
  const show = (id, visible) => { const b = document.getElementById(id); if(b) b.style.display = visible ? '' : 'none'; };
  show('cloud-signin-btn', cloud.configured && !cloud.user);
  show('cloud-sync-btn', !!cloud.user);
  show('cloud-signout-btn', !!cloud.user);
  show('cloud-danger-zone', !!cloud.user);
  const cfgInput = document.getElementById('s-firebase-config');
  if(cfgInput && !cfgInput.dataset.touched) {
    const stored = localStorage.getItem('fitdash_firebase_config');
    cfgInput.value = stored ? JSON.stringify(JSON.parse(stored), null, 2) : '';
  }
  const cfgNote = document.getElementById('firebase-config-source');
  if(cfgNote) {
    cfgNote.textContent = isValidFirebaseConfig(window.FITDASH_FIREBASE_CONFIG)
      ? 'Using the config built into this site (window.FITDASH_FIREBASE_CONFIG).'
      : (getFirebaseConfig() ? `Using the saved config for project "${getFirebaseConfig().projectId}".` : 'No Firebase config saved.');
  }
}

// ── Auth modal ──────────────────────────────────────────────
let authModalView = 'signin';

function openAuthModal(view) {
  if(view) authModalView = view;
  else if(!cloud.user && authModalView === 'account') authModalView = 'signin';
  setAuthMessage('');
  renderAuthModal();
  document.getElementById('auth-modal').classList.add('open');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
}

function setAuthView(view) {
  authModalView = view;
  setAuthMessage('');
  renderAuthModal();
}

function setAuthMessage(msg, kind = 'info') {
  const el = document.getElementById('auth-message');
  if(!el) return;
  el.textContent = msg;
  el.dataset.kind = kind;
  el.style.display = msg ? 'block' : 'none';
}

function renderAuthModal() {
  const modal = document.getElementById('auth-modal');
  if(!modal) return;
  const view = cloud.user ? 'account' : (cloud.configured ? (authModalView === 'account' ? 'signin' : authModalView) : 'unconfigured');
  modal.dataset.view = view;
  const title = document.getElementById('auth-title');
  const titles = { signin: 'Sign in to FitDash', signup: 'Create your account', reset: 'Reset your password', account: 'Your account', unconfigured: 'Cloud sync not set up' };
  if(title) title.textContent = titles[view];
  modal.querySelectorAll('[data-auth-view]').forEach(el => {
    el.style.display = el.dataset.authView.split(' ').includes(view) ? '' : 'none';
  });
  modal.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === view));
  const acct = document.getElementById('auth-account-info');
  if(acct && cloud.user) {
    const label = CLOUD_STATUS_LABELS[cloud.status] || CLOUD_STATUS_LABELS.local;
    acct.innerHTML = `<div style="font-weight:700">${escapeHtml(cloudUserLabel(cloud.user))}</div>
      ${cloud.user.email && cloud.user.displayName ? `<div class="cloud-note">${escapeHtml(cloud.user.email)}</div>` : ''}
      <div class="cloud-note" style="margin-top:6px">${label.icon} ${label.text}</div>`;
  }
}

function authFormValues() {
  return {
    email: (document.getElementById('auth-email').value || '').trim(),
    password: document.getElementById('auth-password').value || '',
  };
}

function friendlyAuthError(err) {
  const code = (err && err.code) || '';
  const map = {
    'auth/invalid-email': 'That email address doesn\'t look right.',
    'auth/missing-email': 'Enter your email address.',
    'auth/missing-password': 'Enter your password.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/invalid-login-credentials': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
    'auth/network-request-failed': 'No internet connection. You can keep using FitDash in Local Mode.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
    'auth/unauthorized-domain': 'This site isn\'t authorized for sign-in yet. Add it under Firebase → Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed': 'This sign-in method isn\'t enabled in the Firebase project.',
    'auth/requires-recent-login': 'Please sign in again to confirm it\'s you.',
  };
  return map[code] || (err && err.message ? String(err.message).replace(/^Firebase:\s*/, '') : 'Something went wrong.');
}

async function withAuthBusy(fn) {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('busy');
  modal.querySelectorAll('button, input').forEach(el => { el.disabled = true; });
  try { return await fn(); }
  finally {
    modal.classList.remove('busy');
    modal.querySelectorAll('button, input').forEach(el => { el.disabled = false; });
  }
}

async function ensureCloudReady() {
  if(!cloud.configured) throw Object.assign(new Error('Cloud sync is not set up yet.'), { code: 'fitdash/not-configured' });
  await cloud.initPromise;
  if(!cloud.ready) {
    await initCloud();
    if(!cloud.ready) throw Object.assign(new Error('Couldn\'t reach the sign-in service. Check your connection.'), { code: 'auth/network-request-failed' });
  }
}

async function authSignInEmail() {
  const { email, password } = authFormValues();
  if(!email || !password) { setAuthMessage('Enter your email and password.', 'error'); return; }
  await withAuthBusy(async () => {
    try {
      await ensureCloudReady();
      await cloud.sdk.auth.signInWithEmailAndPassword(cloud.auth, email, password);
      setAuthMessage('Signed in. Syncing your data…', 'success');
    } catch(err) { setAuthMessage(friendlyAuthError(err), 'error'); }
  });
}

async function authSignUpEmail() {
  const { email, password } = authFormValues();
  if(!email || !password) { setAuthMessage('Enter an email and a password (6+ characters).', 'error'); return; }
  await withAuthBusy(async () => {
    try {
      await ensureCloudReady();
      await cloud.sdk.auth.createUserWithEmailAndPassword(cloud.auth, email, password);
      setAuthMessage('Account created. Uploading your data…', 'success');
    } catch(err) { setAuthMessage(friendlyAuthError(err), 'error'); }
  });
}

async function authResetPassword() {
  const { email } = authFormValues();
  if(!email) { setAuthMessage('Enter the email address of your account.', 'error'); return; }
  await withAuthBusy(async () => {
    try {
      await ensureCloudReady();
      await cloud.sdk.auth.sendPasswordResetEmail(cloud.auth, email);
      setAuthMessage(`If an account exists for ${email}, a reset link is on its way. Check your inbox and spam folder.`, 'success');
    } catch(err) { setAuthMessage(friendlyAuthError(err), 'error'); }
  });
}

function isNativeAppShell() {
  return !!(window.Capacitor && (typeof window.Capacitor.isNativePlatform !== 'function' || window.Capacitor.isNativePlatform()));
}

async function authSignInGoogle() {
  await withAuthBusy(async () => {
    try {
      await ensureCloudReady();
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = cloud.sdk.auth;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      // Popups don't work inside Android WebViews/Capacitor; use the redirect flow there.
      if(isNativeAppShell()) { await signInWithRedirect(cloud.auth, provider); return; }
      try {
        await signInWithPopup(cloud.auth, provider);
        setAuthMessage('Signed in. Syncing your data…', 'success');
      } catch(err) {
        if(['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(err.code)) {
          await signInWithRedirect(cloud.auth, provider);
          return;
        }
        throw err;
      }
    } catch(err) { setAuthMessage(friendlyAuthError(err), 'error'); }
  });
}

function continueAsGuest() {
  closeAuthModal();
  setCloudStatus(cloud.user ? cloud.status : 'local');
}

async function cloudSignOut() {
  if(!cloud.user) return;
  if(!confirm('Sign out of FitDash? Your data stays safe in your account.')) return;
  const wipe = confirm('Also remove your synced data from this device?\n\nOK = remove it from this device (recommended on shared phones).\nCancel = keep a local copy here.');
  clearTimeout(cloud.pushTimer); cloud.pushTimer = null;
  const synced = await syncWithCloud();
  let keepCopy = !wipe;
  if(wipe && !synced && hasUnsyncedChanges()) {
    alert('Some changes on this device have not reached your account yet (you may be offline), so FitDash will keep them on this device. Sign in again when you are online to upload them.');
    keepCopy = true;
  }
  try { await cloud.sdk.auth.signOut(cloud.auth); } catch(err) { alert(friendlyAuthError(err)); return; }
  authModalView = 'signin';
  renderAuthModal();
  const meta = loadSyncMeta();
  meta.uid = null; meta.lastSyncAt = 0; meta.cloudMod = {};
  storeSyncMeta(meta);
  if(!keepCopy) {
    CLOUD_SYNC_KEYS.forEach(k => localStorage.removeItem(k));
    location.reload();
  }
}

async function cloudSyncNow() {
  if(!cloud.user) { openAuthModal(); return; }
  await syncWithCloud({ reloadIfChanged: true });
}

// ── Firestore layout ────────────────────────────────────────
// users/{uid}/fitdash/state                 → index { schema: 2, modified: {key: ts}, chunks: {key: n}, updatedAt }
// users/{uid}/fitdash/state/keys/{key}__{i} → { v: slice i of the raw localStorage JSON for key }
// Each key lives in its own documents (split into chunks when large), so long histories never hit
// Firestore's 1 MiB document limit. Schema 1 (all values inline in state.data) is still read and is
// migrated on the next sync.
const CLOUD_CHUNK_CHARS = 200000; // ≤ 800 KB even if every character needs 4 UTF-8 bytes

function cloudStateDoc(uid) {
  return cloud.sdk.firestore.doc(cloud.db, 'users', uid, 'fitdash', 'state');
}
function cloudChunkDoc(uid, key, i) {
  return cloud.sdk.firestore.doc(cloud.db, 'users', uid, 'fitdash', 'state', 'keys', `${key}__${i}`);
}

function splitChunks(raw) {
  const out = [];
  let i = 0;
  while(i < raw.length) {
    let end = Math.min(i + CLOUD_CHUNK_CHARS, raw.length);
    // Never split a surrogate pair (emoji) across two documents.
    if(end < raw.length && /[\uD800-\uDBFF]/.test(raw[end - 1])) end--;
    out.push(raw.slice(i, end));
    i = end;
  }
  return out.length ? out : [''];
}

async function readCloudKey(get, uid, index, key) {
  if(index.data) return index.data[key];
  const n = (index.chunks || {})[key] || 0;
  if(!n) return undefined;
  const snaps = await Promise.all(Array.from({ length: n }, (_, i) => get(cloudChunkDoc(uid, key, i))));
  if(snaps.some(sn => !sn.exists())) throw Object.assign(new Error('Cloud data is incomplete; try again.'), { code: 'fitdash/partial' });
  return snaps.map(sn => (sn.data() || {}).v || '').join('');
}

function hasUnsyncedChanges() {
  const meta = loadSyncMeta();
  const uid = cloud.user && cloud.user.uid;
  return CLOUD_SYNC_KEYS.some(k => localStorage.getItem(k) !== null &&
    (meta.uid !== uid || (meta.localMod[k] || 0) > (meta.lastSyncAt || 0)));
}

// One round trip: pull what other devices changed, merge it with this device's edits, upload the result.
// It runs in a Firestore transaction, so two devices syncing at once can't overwrite each other (Firestore
// retries the callback with fresh data if the index changed underneath it). Resolves true on success.
async function syncWithCloud({ reloadIfChanged = false } = {}) {
  const user = cloud.user;
  if(!user || cloud.deleting) return false;
  if(cloud.syncing) { cloud.syncAgain = true; return false; }
  if(navigator.onLine === false) { setCloudStatus('offline'); return false; }
  cloud.syncing = true;
  setCloudStatus('syncing');
  const startedAt = Date.now();
  let ok = false;
  try {
    const result = await cloud.sdk.firestore.runTransaction(cloud.db, async tx => {
      const meta = loadSyncMeta();
      const snap = await tx.get(cloudStateDoc(user.uid));
      const index = snap.exists() ? (snap.data() || {}) : {};
      const legacy = !!index.data;
      const remoteMod = index.modified || {};
      const remoteChunks = legacy ? {} : { ...(index.chunks || {}) };
      const firstSyncOnDevice = meta.uid !== user.uid;
      const plan = await Promise.all(CLOUD_SYNC_KEYS.map(async key => {
        const localRaw = localStorage.getItem(key);
        const inCloud = legacy ? index.data[key] !== undefined : !!remoteChunks[key];
        const remoteChanged = inCloud && (firstSyncOnDevice || remoteMod[key] !== meta.cloudMod[key]);
        const localDirty = localRaw !== null && (firstSyncOnDevice || (meta.localMod[key] || 0) > (meta.lastSyncAt || 0));
        const cloudRaw = (remoteChanged || legacy) ? await readCloudKey(ref => tx.get(ref), user.uid, index, key) : undefined;
        const merged = remoteChanged
          ? mergeSyncKey(key, localRaw, cloudRaw, { meta, cloudModified: remoteMod, firstSyncOnDevice, localDirty })
          : localRaw;
        const hasValue = merged !== null && merged !== undefined;
        const upload = hasValue && (legacy || !inCloud || (remoteChanged ? merged !== cloudRaw : localDirty));
        return { key, localRaw, merged, upload, remoteChanged };
      }));
      const modified = { ...remoteMod };
      const chunks = { ...remoteChunks };
      plan.forEach(item => {
        if(!item.upload) return;
        const parts = splitChunks(item.merged);
        parts.forEach((v, i) => tx.set(cloudChunkDoc(user.uid, item.key, i), { v }));
        for(let i = parts.length; i < (remoteChunks[item.key] || 0); i++) tx.delete(cloudChunkDoc(user.uid, item.key, i));
        chunks[item.key] = parts.length;
        modified[item.key] = startedAt;
      });
      if(legacy || plan.some(item => item.upload)) {
        tx.set(cloudStateDoc(user.uid), { schema: 2, modified, chunks, updatedAt: startedAt });
      }
      return { plan, modified };
    });
    const cloudMod = { ...result.modified };
    let changed = false;
    result.plan.forEach(item => {
      if(!item.remoteChanged || item.merged === null || item.merged === undefined || item.merged === item.localRaw) return;
      if(localStorage.getItem(item.key) === item.localRaw) {
        localStorage.setItem(item.key, item.merged);
        changed = true;
      } else {
        // Edited again while syncing: keep that edit and merge this key again next time.
        delete cloudMod[item.key];
      }
    });
    const after = loadSyncMeta();
    after.uid = user.uid;
    after.lastSyncAt = startedAt;
    after.cloudMod = cloudMod;
    storeSyncMeta(after);
    setCloudStatus('synced');
    ok = true;
    if(changed) refreshAfterCloudMerge(reloadIfChanged);
  } catch(err) {
    setCloudStatus(navigator.onLine === false || err.code === 'unavailable' ? 'offline' : 'error', friendlyAuthError(err));
  } finally {
    cloud.syncing = false;
    if(cloud.syncAgain) { cloud.syncAgain = false; scheduleCloudPush(); }
  }
  return ok;
}

function parseRaw(raw) {
  try { return JSON.parse(raw); } catch(_) { return undefined; }
}

function isEmptyValue(v) {
  if(v === undefined || v === null || v === '' || v === 0) return true;
  if(Array.isArray(v)) return v.length === 0;
  if(typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}

function mergeById(local, remote) {
  const out = new Map();
  const keyOf = item => (item && (item.id !== undefined ? 'id:' + item.id : 'v:' + JSON.stringify(item)));
  remote.forEach(item => out.set(keyOf(item), item));
  local.forEach(item => out.set(keyOf(item), item));
  const merged = [...out.values()];
  if(merged.every(x => x && x.date)) merged.sort((a, b) => String(a.date).localeCompare(String(b.date)) || ((a.id || 0) - (b.id || 0)));
  return merged;
}

function mergeByDate(local, remote) {
  const out = new Map();
  remote.forEach(item => out.set(item && item.date, item));
  local.forEach(item => out.set(item && item.date, item));
  return [...out.values()].sort((a, b) => String(a && a.date).localeCompare(String(b && b.date)));
}

function mergePRs(local, remote) {
  const out = { ...remote };
  Object.entries(local).forEach(([ex, pr]) => {
    const other = out[ex];
    if(!other || (Number(pr && pr.weight) || 0) >= (Number(other.weight) || 0)) out[ex] = pr;
  });
  return out;
}

// Combine one key that another device changed. Returns the raw string to keep (and upload).
function mergeSyncKey(key, localRaw, cloudRaw, ctx) {
  if(cloudRaw === undefined || cloudRaw === null) return localRaw;
  if(localRaw === null || localRaw === cloudRaw) return cloudRaw;
  const local = parseRaw(localRaw), remote = parseRaw(cloudRaw);
  if(remote === undefined) return localRaw;
  if(local === undefined) return cloudRaw;
  // Nothing changed here since the last sync: take the cloud copy (this also carries deletions across devices).
  if(!ctx.localDirty) return cloudRaw;
  // A device signing in for the first time with nothing of its own takes the account copy.
  if(ctx.firstSyncOnDevice && isEmptyValue(local)) return cloudRaw;
  const localNewer = (ctx.meta.localMod[key] || 0) >= (ctx.cloudModified[key] || 0);
  // One side was deliberately cleared (e.g. Clear History): the newer action wins instead of resurrecting data.
  if(isEmptyValue(local) || isEmptyValue(remote)) return localNewer ? localRaw : cloudRaw;
  const rule = CLOUD_MERGE_RULES[key];
  if(rule === 'byId' && Array.isArray(local) && Array.isArray(remote)) return JSON.stringify(mergeById(local, remote));
  if(rule === 'byDate' && Array.isArray(local) && Array.isArray(remote)) return JSON.stringify(mergeByDate(local, remote));
  if(rule === 'byKey' && typeof local === 'object' && typeof remote === 'object' && !Array.isArray(local)) return JSON.stringify({ ...remote, ...local });
  if(rule === 'maxPR' && typeof local === 'object' && typeof remote === 'object') return JSON.stringify(mergePRs(local, remote));
  // Settings-like keys: on a device's first sign-in the account copy wins; afterwards the newer edit wins.
  if(ctx.firstSyncOnDevice) return cloudRaw;
  return localNewer ? localRaw : cloudRaw;
}

function workoutInProgress() {
  try { return typeof wo !== 'undefined' && !!wo.active; } catch(_) { return false; }
}

// In-memory state lives in globals across many scripts, so the simplest correct refresh is a reload.
function refreshAfterCloudMerge(reloadIfChanged) {
  const recent = Number(sessionStorage.getItem('fitdash_sync_reload_at') || 0);
  if(reloadIfChanged && !workoutInProgress() && Date.now() - recent > 15000) {
    sessionStorage.setItem('fitdash_sync_reload_at', String(Date.now()));
    location.reload();
    return;
  }
  if(typeof showUndoToast === 'function') {
    showUndoToast('☁️ Synced data from your account', () => location.reload());
    const undoBtn = document.getElementById('undo-btn');
    if(undoBtn) undoBtn.textContent = 'Reload';
    setTimeout(() => { if(undoBtn) undoBtn.textContent = 'Undo'; }, 5200);
  }
}

// ── Account deletion (Google Play requirement) ──────────────
async function reauthenticateForDeletion(user) {
  const a = cloud.sdk.auth;
  const providers = (user.providerData || []).map(p => p.providerId);
  if(providers.includes('google.com')) {
    await a.reauthenticateWithPopup(user, new a.GoogleAuthProvider());
    return;
  }
  const password = prompt(`For security, enter the password for ${user.email} to delete your account:`);
  if(!password) throw Object.assign(new Error('Account deletion was cancelled.'), { code: 'fitdash/cancelled' });
  await a.reauthenticateWithCredential(user, a.EmailAuthProvider.credential(user.email, password));
}

async function deleteCloudData(uid) {
  const fs = cloud.sdk.firestore;
  const snap = await fs.getDoc(cloudStateDoc(uid));
  const chunks = snap.exists() ? ((snap.data() || {}).chunks || {}) : {};
  const refs = [];
  Object.entries(chunks).forEach(([key, n]) => { for(let i = 0; i < n; i++) refs.push(cloudChunkDoc(uid, key, i)); });
  await Promise.all(refs.map(ref => fs.deleteDoc(ref)));
  await fs.deleteDoc(cloudStateDoc(uid));
}

async function cloudDeleteAccount() {
  const user = cloud.user;
  if(!user) { alert('Sign in first to delete your account.'); return; }
  if(!confirm(`Permanently delete your FitDash account (${cloudUserLabel(user)})?\n\nThis deletes your cloud data, your sign-in account, and all FitDash data on this device. This cannot be undone.`)) return;
  const typed = prompt('Type DELETE to confirm account deletion.');
  if((typed || '').trim().toUpperCase() !== 'DELETE') { alert('Account deletion cancelled.'); return; }
  const btn = document.getElementById('cloud-delete-btn');
  if(btn) { btn.disabled = true; btn.textContent = 'Deleting…'; }
  cloud.deleting = true;
  clearTimeout(cloud.pushTimer);
  let cloudDocDeleted = false;
  try {
    await deleteCloudData(user.uid);
    cloudDocDeleted = true;
    try {
      await cloud.sdk.auth.deleteUser(user);
    } catch(err) {
      if(err.code !== 'auth/requires-recent-login') throw err;
      await reauthenticateForDeletion(user);
      await cloud.sdk.auth.deleteUser(user);
    }
    const keep = ['fitdash_firebase_config', 'fitdash_theme'];
    Object.keys(localStorage).filter(k => k.startsWith('fitdash_') && !keep.includes(k)).forEach(k => localStorage.removeItem(k));
    alert('Your FitDash account and all of its data have been deleted.');
    location.reload();
  } catch(err) {
    // Keep pushes paused so a half-finished deletion can't re-upload data before the user retries.
    const msg = cloudDocDeleted
      ? `Your cloud data was deleted, but the sign-in account could not be removed: ${friendlyAuthError(err)} Reload, sign in again, and press Delete once more.`
      : `Account deletion failed: ${friendlyAuthError(err)}`;
    alert(msg);
    if(btn) { btn.disabled = false; btn.textContent = '🗑️ Delete Account & All Cloud/Local Data'; }
    if(!cloudDocDeleted) cloud.deleting = false;
  }
}

// ── Settings: Firebase config (owner / self-hosting) ────────
function saveFirebaseConfigFromSettings() {
  const input = document.getElementById('s-firebase-config');
  const status = document.getElementById('firebase-config-status');
  try {
    const cfg = parseFirebaseConfigInput(input.value);
    if(!isValidFirebaseConfig(cfg)) throw new Error('The config needs apiKey, authDomain, projectId and appId.');
    localStorage.setItem('fitdash_firebase_config', JSON.stringify(cfg));
    status.textContent = 'Saved. Reloading to connect…';
    status.style.color = 'var(--green)';
    setTimeout(() => location.reload(), 600);
  } catch(err) {
    status.textContent = err.message;
    status.style.color = 'var(--red)';
  }
}

function clearFirebaseConfigFromSettings() {
  if(!confirm('Remove the saved Firebase config? FitDash will go back to Local Guest Mode on this device. Your local data is kept.')) return;
  localStorage.removeItem('fitdash_firebase_config');
  location.reload();
}

// ── Boot ────────────────────────────────────────────────────
async function loadFirebaseSdk() {
  const [app, auth, firestore] = await Promise.all([
    import(FIREBASE_SDK_BASE + 'firebase-app.js'),
    import(FIREBASE_SDK_BASE + 'firebase-auth.js'),
    import(FIREBASE_SDK_BASE + 'firebase-firestore.js'),
  ]);
  return { app, auth, firestore };
}

function initCloud() {
  const config = getFirebaseConfig();
  cloud.configured = !!config;
  if(!config) { setCloudStatus('local'); return Promise.resolve(); }
  if(cloud.ready) return Promise.resolve();
  cloud.initPromise = (async () => {
    try {
      cloud.sdk = cloud.sdk || await loadFirebaseSdk();
      const { app, auth, firestore } = cloud.sdk;
      const fbApp = app.getApps().length ? app.getApp() : app.initializeApp(config);
      cloud.auth = auth.getAuth(fbApp);
      cloud.db = firestore.getFirestore(fbApp);
      cloud.ready = true;
      auth.getRedirectResult(cloud.auth).catch(err => {
        if(err && err.code && err.code !== 'auth/no-auth-event') { openAuthModal('signin'); setAuthMessage(friendlyAuthError(err), 'error'); }
      });
      auth.onAuthStateChanged(cloud.auth, user => {
        cloud.user = user || null;
        if(user) {
          const modal = document.getElementById('auth-modal');
          if(modal && modal.classList.contains('open') && authModalView !== 'account') closeAuthModal();
          syncWithCloud({ reloadIfChanged: true });
        } else {
          setCloudStatus('local');
        }
      });
    } catch(err) {
      cloud.ready = false;
      setCloudStatus(navigator.onLine === false ? 'offline' : 'error', 'Could not load the sign-in service.');
    }
  })();
  return cloud.initPromise;
}

window.addEventListener('online', () => {
  if(!cloud.configured) return;
  if(!cloud.ready) { initCloud(); return; }
  if(cloud.user) syncWithCloud();
});
window.addEventListener('offline', () => { if(cloud.user) setCloudStatus('offline'); });
document.addEventListener('visibilitychange', () => {
  // Flush pending edits when the app is backgrounded (phones often kill hidden tabs).
  if(document.visibilityState === 'hidden' && cloud.user && cloud.pushTimer) { clearTimeout(cloud.pushTimer); cloud.pushTimer = null; syncWithCloud(); }
});

document.getElementById('auth-modal').addEventListener('click', e => {
  if(e.target === document.getElementById('auth-modal')) closeAuthModal();
});
document.getElementById('s-firebase-config').addEventListener('input', e => { e.target.dataset.touched = '1'; });

renderCloudUI();
initCloud();
