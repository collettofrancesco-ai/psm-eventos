
        const CACHE_NAME = "psm-stage-CGAUuN10-B3W8yDXn-DzlNdBEZ-D9ZcUk39-CYTHoqHn-zHL_prVv-Bs6TPUBL-y7H9Ej9Y-BtDLegba-BPHTDmY2-C8Lsh8uj-BULd6Xu9-B8h7n5O5-GubIV";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3W8yDXn.css","/stage-studio/assets/three-engine-DzlNdBEZ.js","/stage-studio/assets/three-tools-D9ZcUk39.js","/stage-studio/assets/index-CYTHoqHn.js","/stage-studio/assets/main-zHL_prVv.js","/stage-studio/assets/index-Bs6TPUBL.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BtDLegba.js","/stage-studio/assets/web-BPHTDmY2.js","/stage-studio/assets/web-C8Lsh8uj.js","/stage-studio/assets/web-BULd6Xu9.js","/stage-studio/assets/web-B8h7n5O5.js","/stage-studio/assets/web-tC-GubIV.js"];

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
              const appEntry = new URL("/stage-studio/", self.location.origin).href;
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
      