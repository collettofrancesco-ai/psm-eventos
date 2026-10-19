
        const CACHE_NAME = "psm-stage-CGAUuN10-CuXuc6KU-CTnKwTqa-C2Zhp24q-qzEP1gld-DPFYyFpP-DEkRNHoM-y7H9Ej9Y-N5okKbSL-DTHYzJng-Bd3SQdvj-Bq49JGvD-5UNV1KTD-D2xvQ9bR";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CuXuc6KU.css","/stage-studio/assets/three-engine-CTnKwTqa.js","/stage-studio/assets/three-tools-C2Zhp24q.js","/stage-studio/assets/index-qzEP1gld.js","/stage-studio/assets/main-DPFYyFpP.js","/stage-studio/assets/index-DEkRNHoM.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-N5okKbSL.js","/stage-studio/assets/web-DTHYzJng.js","/stage-studio/assets/web-Bd3SQdvj.js","/stage-studio/assets/web-Bq49JGvD.js","/stage-studio/assets/web-5UNV1KTD.js","/stage-studio/assets/web-D2xvQ9bR.js"];

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
      