const CACHE_NAME = 'gcs-monitor-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // API 요청은 캐시 안 함 (항상 네트워크)
  if (e.request.url.includes('api.gcsmagma.com')) return;

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
