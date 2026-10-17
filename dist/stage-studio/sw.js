
        const CACHE_NAME = "psm-stage-CGAUuN10-C-CNlyn1fV-BbePLJ7o-BCwZO2v7-B1qDDaUX-DBOesagp-y7H9Ej9Y-GSgQK2l9-Cnyu2kDF-BVXqrB3C-D91uSQa3-CwoIzbgI-M";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Do5RIM-C.css","/stage-studio/assets/three-engine-CNlyn1fV.js","/stage-studio/assets/three-tools-BbePLJ7o.js","/stage-studio/assets/index-BCwZO2v7.js","/stage-studio/assets/main-B1qDDaUX.js","/stage-studio/assets/index-DBOesagp.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-GSgQK2l9.js","/stage-studio/assets/web-Cnyu2kDF.js","/stage-studio/assets/web-BVXqrB3C.js","/stage-studio/assets/web-D91uSQa3.js","/stage-studio/assets/web-CwoIzbgI.js","/stage-studio/assets/web-lyaonB-M.js"];

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
      