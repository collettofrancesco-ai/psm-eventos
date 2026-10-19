
        const CACHE_NAME = "psm-stage-CGAUuN10-CRJo0MI9-D8YOsxnR-DVOL3Xnx-CNUigI0V-D3doZ7C2-BNDxCEuM-y7H9Ej9Y-BKByHSxI-HtQvrUhH-brOIDNeF-DrjOye_K-DCy0tNIJ-BXaoqWrs";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CRJo0MI9.css","/stage-studio/assets/three-engine-D8YOsxnR.js","/stage-studio/assets/three-tools-DVOL3Xnx.js","/stage-studio/assets/index-CNUigI0V.js","/stage-studio/assets/main-D3doZ7C2.js","/stage-studio/assets/index-BNDxCEuM.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BKByHSxI.js","/stage-studio/assets/web-HtQvrUhH.js","/stage-studio/assets/web-brOIDNeF.js","/stage-studio/assets/web-DrjOye_K.js","/stage-studio/assets/web-DCy0tNIJ.js","/stage-studio/assets/web-BXaoqWrs.js"];

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
      