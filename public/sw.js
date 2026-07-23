const CACHE_NAME = 'epa-pirassununga-v2';
const APP_SHELL = ['/manifest.json', '/pwa-192.png', '/pwa-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API calls: always go to network for fresh data.
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigations (the HTML shell) and any request without a content hash in the
  // filename: network-first, so a new deploy is picked up immediately instead
  // of being stuck on a cached index.html pointing at stale JS/CSS bundles.
  const isHashedAsset = /-[A-Za-z0-9_]{6,}\.(js|css)$/.test(url.pathname);

  if (request.mode === 'navigate' || !isHashedAsset) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Hashed build assets: cache-first, since the filename changes on every build.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
