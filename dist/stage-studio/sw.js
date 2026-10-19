
        const CACHE_NAME = "psm-stage-CGAUuN10-CuXuc6KU-CTnKwTqa-C2Zhp24q-M-D2lk4REs-BSoVHi1M-y7H9Ej9Y-CA23ioTQ-Dsv4IVkg-jI4LjH5h-BMOHtsQl-DS98tZWj-BWrltfmP";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CuXuc6KU.css","/stage-studio/assets/three-engine-CTnKwTqa.js","/stage-studio/assets/three-tools-C2Zhp24q.js","/stage-studio/assets/index-D-uQS5-M.js","/stage-studio/assets/main-D2lk4REs.js","/stage-studio/assets/index-BSoVHi1M.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-CA23ioTQ.js","/stage-studio/assets/web-Dsv4IVkg.js","/stage-studio/assets/web-jI4LjH5h.js","/stage-studio/assets/web-BMOHtsQl.js","/stage-studio/assets/web-DS98tZWj.js","/stage-studio/assets/web-BWrltfmP.js"];

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
      