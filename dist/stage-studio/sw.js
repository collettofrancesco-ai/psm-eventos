
        const CACHE_NAME = "psm-stage-CGAUuN10-BJEpDuga-D8YOsxnR-DVOL3Xnx-C_o6l_l2-A-BN1JY0fW-y7H9Ej9Y-Bdpee3ow-B7zEsrFj-BADsrx_l-BJS35pVG-CO_cBEFU-DTc7R5Bk";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-BJEpDuga.css","/stage-studio/assets/three-engine-D8YOsxnR.js","/stage-studio/assets/three-tools-DVOL3Xnx.js","/stage-studio/assets/index-C_o6l_l2.js","/stage-studio/assets/main-B9W2O8-A.js","/stage-studio/assets/index-BN1JY0fW.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Bdpee3ow.js","/stage-studio/assets/web-B7zEsrFj.js","/stage-studio/assets/web-BADsrx_l.js","/stage-studio/assets/web-BJS35pVG.js","/stage-studio/assets/web-CO_cBEFU.js","/stage-studio/assets/web-DTc7R5Bk.js"];

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
      