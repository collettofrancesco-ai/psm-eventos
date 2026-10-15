
        const CACHE_NAME = "psm-stage-CGAUuN10-Ct0ovA9j-DppH7aD7-DvTXQetu-B5NRaTP4-CLUvtI56-C_OEXVo5-y7H9Ej9Y-CJ8yOIji-_oNWhAFQ-CykFoTqn-6-Ce936sN3-PRp8GrRa";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Ct0ovA9j.css","/stage-studio/assets/three-engine-DppH7aD7.js","/stage-studio/assets/three-tools-DvTXQetu.js","/stage-studio/assets/index-B5NRaTP4.js","/stage-studio/assets/main-CLUvtI56.js","/stage-studio/assets/index-C_OEXVo5.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-CJ8yOIji.js","/stage-studio/assets/web-_oNWhAFQ.js","/stage-studio/assets/web-CykFoTqn.js","/stage-studio/assets/web-hpTzAb-6.js","/stage-studio/assets/web-Ce936sN3.js","/stage-studio/assets/web-PRp8GrRa.js"];

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
      