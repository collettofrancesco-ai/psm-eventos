
        const CACHE_NAME = "psm-stage-CGAUuN10-LcE4TaT_-CaJ3X_dh-Czahv3Y4-CMLyQLUa-CmRGYSFD-Bp_mMjEH-y7H9Ej9Y-K-B8Aa3zO0-BNI8I5SJ-C7z5JZ_U-CKxHzvyQ-Cg7vjP48";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-LcE4TaT_.css","/stage-studio/assets/three-engine-CaJ3X_dh.js","/stage-studio/assets/three-tools-Czahv3Y4.js","/stage-studio/assets/index-CMLyQLUa.js","/stage-studio/assets/main-CmRGYSFD.js","/stage-studio/assets/index-Bp_mMjEH.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Dym8Vt-K.js","/stage-studio/assets/web-B8Aa3zO0.js","/stage-studio/assets/web-BNI8I5SJ.js","/stage-studio/assets/web-C7z5JZ_U.js","/stage-studio/assets/web-CKxHzvyQ.js","/stage-studio/assets/web-Cg7vjP48.js"];

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
      