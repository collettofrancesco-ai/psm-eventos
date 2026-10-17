
        const CACHE_NAME = "psm-stage-CGAUuN10-B97Bb2WV-SZQHhQ_i-B2ZI79e_-DzvfxGUz-CwNpSlky-CX7GaWI2-y7H9Ej9Y-xtWaZNnB-jEPSPQ-DjDnYa5T-BW87Mrlx--Cj1_K0SC";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B97Bb2WV.css","/stage-studio/assets/three-engine-SZQHhQ_i.js","/stage-studio/assets/three-tools-B2ZI79e_.js","/stage-studio/assets/index-DzvfxGUz.js","/stage-studio/assets/main-CwNpSlky.js","/stage-studio/assets/index-CX7GaWI2.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-xtWaZNnB.js","/stage-studio/assets/web-B-jEPSPQ.js","/stage-studio/assets/web-DjDnYa5T.js","/stage-studio/assets/web-BW87Mrlx.js","/stage-studio/assets/web-7eERUVX-.js","/stage-studio/assets/web-Cj1_K0SC.js"];

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
      