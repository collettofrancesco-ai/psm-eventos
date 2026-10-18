
        const CACHE_NAME = "psm-stage-CGAUuN10-BqTq1m0T-TsUT39QV-0CsZD-r-DI3B0cBR-145N0Wg2-y7H9Ej9Y-Cw1VB8Fm-WV-CV4USYmd-ByKVU4TC-BH1x0itO-D9VmYsPS";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-BqTq1m0T.css","/stage-studio/assets/three-engine-TsUT39QV.js","/stage-studio/assets/three-tools-CO-0CsZD.js","/stage-studio/assets/index-KhoJMH-r.js","/stage-studio/assets/main-DI3B0cBR.js","/stage-studio/assets/index-145N0Wg2.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Cw1VB8Fm.js","/stage-studio/assets/web-DvDWh-WV.js","/stage-studio/assets/web-CV4USYmd.js","/stage-studio/assets/web-ByKVU4TC.js","/stage-studio/assets/web-BH1x0itO.js","/stage-studio/assets/web-D9VmYsPS.js"];

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
      