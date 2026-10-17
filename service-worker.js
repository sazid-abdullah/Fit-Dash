const CACHE_NAME = 'fitdash-shell-v4';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest'];

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
// the cached shell is only an offline fallback.
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const isNav = req.mode === 'navigate';
  event.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if(res.ok && (isNav || APP_SHELL.some(p => new URL(p, self.location).href === req.url))) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(isNav ? './index.html' : req, res.clone());
      }
      return res;
    } catch(err) {
      // Navigations may carry ?reminder=… from a notification click; fall back to the cached shell.
      const cached = isNav
        ? (await caches.match(req, { ignoreSearch: true })) || (await caches.match('./index.html'))
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
