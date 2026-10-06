const CACHE_NAME = 'fitdash-shell-v2';
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

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
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
    return event.action === 'snooze' ? undefined : self.clients.openWindow('./index.html');
  }));
});
