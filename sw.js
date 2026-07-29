const CACHE = 'body-soul-v77'; // character content lock for testers build: JOURNEY_COMPANION_LINES (incl. new kipoda entries), COMPASSION_DAY_COMPANION_LINES, GENTLE_HABIT_COMPANION_LINES, and both active pamper afterLines replaced with approved final texts
const STATIC = ['./logo.png', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTML: always fetch from network, cache only as offline fallback
  if (e.request.destination === 'document' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Other assets (logo, manifest): cache first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
