
        const CACHE_NAME = "psm-stage-CGAUuN10-D8EJShGW-CNlyn1fV-BbePLJ7o-BMkYGNdK-D7keRsk9-CCcS7Glv-y7H9Ej9Y-A7fyHnSR-D_jazz9T-DvxyHjK9-Cag9xpt9-BfS9tMmO-BIlzMSgu";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-D8EJShGW.css","/stage-studio/assets/three-engine-CNlyn1fV.js","/stage-studio/assets/three-tools-BbePLJ7o.js","/stage-studio/assets/index-BMkYGNdK.js","/stage-studio/assets/main-D7keRsk9.js","/stage-studio/assets/index-CCcS7Glv.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-A7fyHnSR.js","/stage-studio/assets/web-D_jazz9T.js","/stage-studio/assets/web-DvxyHjK9.js","/stage-studio/assets/web-Cag9xpt9.js","/stage-studio/assets/web-BfS9tMmO.js","/stage-studio/assets/web-BIlzMSgu.js"];

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
      