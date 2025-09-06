// Enhanced service worker: cache-first for core, stale-while-revalidate for data, offline fallback
const CORE = 'core-v2';
let CORE_ASSETS = [
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
  '/scripts/archframework/index.html',
  '/offline.html',
  '/404.html'
];

async function extendWithManifest(cache){
  try {
    const resp = await fetch('/asset-manifest.json');
    if(resp.ok){
      const list = await resp.json();
      const filtered = list.filter(p => !CORE_ASSETS.includes(p));
      await cache.addAll(filtered);
    }
  } catch(e){ /* ignore */ }
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CORE);
    await cache.addAll(CORE_ASSETS);
    await extendWithManifest(cache);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CORE).map(k=>caches.delete(k)))).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== location.origin) return;

  if(url.pathname.startsWith('/data/')) {
    e.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(resp => {
          const clone = resp.clone(); caches.open(CORE).then(c=> c.put(request, clone)); return resp; });
        return cached || fetchPromise;
      })
    );
    return;
  }

  e.respondWith((async () => {
    const cached = await caches.match(request);
    if(cached) return cached;
    try {
      const net = await fetch(request);
      const clone = net.clone();
      (async ()=> { const c = await caches.open(CORE); c.put(request, clone); })();
      return net;
    } catch(err) {
      if(request.destination === 'document') {
        const fallback = await caches.match('/offline.html');
        if(fallback) return fallback;
      }
      throw err;
    }
  })());
});
