
        const CACHE_NAME = "psm-stage-CGAUuN10-D8EJShGW-BORBm3RQ-BvOip_8p-ubt_Y15b-IsMN614P-Df3s98D0-y7H9Ej9Y-EM7Gk0-rB8YRnuv-CBKH71L8-BI5Gq33G-ZfwQ4pdi-Be4cD_N3";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-D8EJShGW.css","/stage-studio/assets/three-engine-BORBm3RQ.js","/stage-studio/assets/three-tools-BvOip_8p.js","/stage-studio/assets/index-ubt_Y15b.js","/stage-studio/assets/main-IsMN614P.js","/stage-studio/assets/index-Df3s98D0.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-C-EM7Gk0.js","/stage-studio/assets/web-rB8YRnuv.js","/stage-studio/assets/web-CBKH71L8.js","/stage-studio/assets/web-BI5Gq33G.js","/stage-studio/assets/web-ZfwQ4pdi.js","/stage-studio/assets/web-Be4cD_N3.js"];

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
      