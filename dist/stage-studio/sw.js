
        const CACHE_NAME = "psm-stage-CGAUuN10-D8EJShGW-CNlyn1fV-BbePLJ7o-Cll8Rcgu-6NZaL-1SfAzDup-y7H9Ej9Y-Cla4cXhe-LGL5h_Vp-B3rBiX1p-BiCAhgIU-BmjoZIyZ-D1NN2vGy";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-D8EJShGW.css","/stage-studio/assets/three-engine-CNlyn1fV.js","/stage-studio/assets/three-tools-BbePLJ7o.js","/stage-studio/assets/index-Cll8Rcgu.js","/stage-studio/assets/main-o_-6NZaL.js","/stage-studio/assets/index-1SfAzDup.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Cla4cXhe.js","/stage-studio/assets/web-LGL5h_Vp.js","/stage-studio/assets/web-B3rBiX1p.js","/stage-studio/assets/web-BiCAhgIU.js","/stage-studio/assets/web-BmjoZIyZ.js","/stage-studio/assets/web-D1NN2vGy.js"];

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
      