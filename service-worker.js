const CACHE_NAME = 'fitdash-shell-v9';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './icons/logo.svg', './icons/favicon.svg', './icons/favicon-32.png', './icons/icon-192.png',
  './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.ico',
  './js/data.js', './js/state.js', './js/progression.js', './js/routines.js', './js/workout.js',
  './js/ui.js', './js/nutrition.js', './js/ai.js', './js/quicklog.js', './js/reminders.js', './js/form-guide.js', './js/express.js', './js/firebase-sync.js', './js/app.js', './privacy.html'
];
const APP_PAGES = ['./', './index.html'].map(p => new URL(p, self.location).pathname);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('fitdash-shell-') && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for same-origin files (revalidated, so a deploy shows up on the next load);
// every fresh copy is cached as the offline fallback.
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;
  const isNav = req.mode === 'navigate';
  const isAppPage = isNav && APP_PAGES.includes(url.pathname);
  event.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if(res.ok && (!isNav || isAppPage)) {
        const cache = await caches.open(CACHE_NAME);
        if(isAppPage) await Promise.all(['./', './index.html'].map(k => cache.put(k, res.clone())));
        else await cache.put(req, res.clone());
      }
      return res;
    } catch(err) {
      // Navigations may carry ?reminder=… from a notification click; fall back to the cached app.
      const cached = isNav
        ? (isAppPage ? await caches.match('./index.html') : await caches.match(req, { ignoreSearch: true }))
        : await caches.match(req);
      if(cached) return cached;
      throw err;
    }
  })());
});

// Reminder notifications: focus (or open) FitDash and hand the action to the page.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const data = event.notification.data || {};
  const msg = { type: 'fitdash-reminder', id: data.id, kind: data.kind, action: event.action || 'open' };
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const client = list[0];
    if(client) {
      client.postMessage(msg);
      return event.action === 'snooze' ? undefined : client.focus();
    }
    // Snooze state lives in the page's localStorage, so with no window open it can't be stored.
    if(event.action === 'snooze') return undefined;
    const qs = new URLSearchParams({ reminder: data.id || '', kind: data.kind || '' }).toString();
    return self.clients.openWindow('./index.html?' + qs);
  }));
});
