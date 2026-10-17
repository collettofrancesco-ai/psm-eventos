
        const CACHE_NAME = "psm-stage-CGAUuN10-C-CNlyn1fV-BbePLJ7o-CypCI6ov-DybcQfTW-CIjWqM3a-y7H9Ej9Y-BvWAcZ1m-B3jiRDY7-BQI9Jvhd-B_V0OGGt-C52lkMKz-WX9bHnwp";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/","/manifest.webmanifest","/favicon.png","/assets/psm-logo-CGAUuN10.png","/assets/index-Do5RIM-C.css","/assets/three-engine-CNlyn1fV.js","/assets/three-tools-BbePLJ7o.js","/assets/index-CypCI6ov.js","/assets/main-DybcQfTW.js","/assets/index-CIjWqM3a.js","/assets/Purchases.es-y7H9Ej9Y.js","/assets/web-BvWAcZ1m.js","/assets/web-B3jiRDY7.js","/assets/web-BQI9Jvhd.js","/assets/web-B_V0OGGt.js","/assets/web-C52lkMKz.js","/assets/web-WX9bHnwp.js"];

        self.addEventListener('install', event => {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.addAll(PRECACHE_URLS))
              .then(() => self.skipWaiting()),
          );
        });

        self.addEventListener('activate', event => {
          event.waitUntil(
            caches.keys()
              .then(keys => Promise.all(keys
                .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                .map(key => caches.delete(key))))
              .then(() => self.clients.claim()),
          );
        });

        self.addEventListener('fetch', event => {
          const request = event.request;
          if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

          if (request.mode === 'navigate') {
            event.respondWith((async () => {
              const appEntry = new URL("/", self.location.origin).href;
              try {
                const response = await fetch(request);
                if (response.ok) {
                  const cache = await caches.open(CACHE_NAME);
                  await cache.put(appEntry, response.clone());
                }
                return response;
              } catch {
                return (await caches.match(request)) || caches.match(appEntry);
              }
            })());
            return;
          }

          event.respondWith((async () => {
            const cached = await caches.match(request);
            if (cached) return cached;

            const response = await fetch(request);
            if (response.ok) {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, response.clone());
            }
            return response;
          })());
        });
      