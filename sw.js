/* ==========================================================================
   SERVICE WORKER — Verses v2
   Cache-first for static assets, network-first for API calls.
   ========================================================================== */

const CACHE_NAME = 'verses-v2-static';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/main.js',
  './js/themes.js',
  './js/store.js',
  './js/verse-app.js',
  './js/effects/text-scramble.js',
  './js/effects/god-rays.js',
  './js/effects/particles.js',
  './js/effects/magnetic.js',
  './js/effects/card-tilt.js',
  './plans/psalms-7.json',
  './plans/proverbs-7.json',
  'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network-first with cache fallback
  if (url.hostname === 'bible-api.com') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Font requests: cache-first
  if (url.hostname.includes('fonts.')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return resp;
      }))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
