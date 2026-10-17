
        const CACHE_NAME = "psm-stage-CGAUuN10-C-SZQHhQ_i-B2ZI79e_-BZs2KX4I-42MTaY47-IdK-y7H9Ej9Y-DSJ_CLFN-Bqaigrc7-DrjT3xTO-Dv3mRipJ-Z6Jd7kMk-I0";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Do5RIM-C.css","/stage-studio/assets/three-engine-SZQHhQ_i.js","/stage-studio/assets/three-tools-B2ZI79e_.js","/stage-studio/assets/index-BZs2KX4I.js","/stage-studio/assets/main-42MTaY47.js","/stage-studio/assets/index-BTtN-IdK.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-DSJ_CLFN.js","/stage-studio/assets/web-Bqaigrc7.js","/stage-studio/assets/web-DrjT3xTO.js","/stage-studio/assets/web-Dv3mRipJ.js","/stage-studio/assets/web-Z6Jd7kMk.js","/stage-studio/assets/web-D14c6-I0.js"];

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
      