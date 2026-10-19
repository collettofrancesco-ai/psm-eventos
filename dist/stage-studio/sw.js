
        const CACHE_NAME = "psm-stage-CGAUuN10-BqTq1m0T-CWD9U2oL-Ck6Iw_ux-DrfwuyHQ-DPsaFeUo-uX2KIwJo-y7H9Ej9Y-C_GC9I_B-BYZKA3vN-4h-DrKutsnN-DPptDxQ9-w";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-BqTq1m0T.css","/stage-studio/assets/three-engine-CWD9U2oL.js","/stage-studio/assets/three-tools-Ck6Iw_ux.js","/stage-studio/assets/index-DrfwuyHQ.js","/stage-studio/assets/main-DPsaFeUo.js","/stage-studio/assets/index-uX2KIwJo.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-C_GC9I_B.js","/stage-studio/assets/web-BYZKA3vN.js","/stage-studio/assets/web-_wpHO-4h.js","/stage-studio/assets/web-DrKutsnN.js","/stage-studio/assets/web-DPptDxQ9.js","/stage-studio/assets/web-CBhqz3-w.js"];

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
      