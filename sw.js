// Simple service worker: cache-first for core, stale-while-revalidate for data
const CORE = 'core-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/custom.css',
  '/js/site.js',
  '/data/scripts.json',
  '/scripts/',
  '/scripts/helix-perk-cards/',
  '/scripts/helix-perk-cards/index.html',
  '/scripts/liro-modules/',
  '/scripts/liro-modules/index.html',
  '/scripts/archframework/',
  '/scripts/archframework/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CORE).then(c => c.addAll(CORE_ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CORE).map(k=>caches.delete(k)))).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);
  // Only handle same-origin
  if(url.origin !== location.origin) return;

  if(url.pathname.startsWith('/data/')) {
    // Stale-while-revalidate for JSON
    e.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(resp => {
          const clone = resp.clone(); caches.open(CORE).then(c=> c.put(request, clone)); return resp; });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Core cache-first
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(resp => {
      const clone = resp.clone(); caches.open(CORE).then(c=> c.put(request, clone)); return resp; }))
  );
});
