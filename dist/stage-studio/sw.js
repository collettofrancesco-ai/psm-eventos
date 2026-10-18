
        const CACHE_NAME = "psm-stage-CGAUuN10-MaRiHrLq-TsUT39QV-0CsZD-DnrnUcoU-D17i_sSB-CsCESV8u-y7H9Ej9Y-Dx86a-DBGz4tVf-BmUa4T8h-BPUCzZ80-DEvERAfg-";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-MaRiHrLq.css","/stage-studio/assets/three-engine-TsUT39QV.js","/stage-studio/assets/three-tools-CO-0CsZD.js","/stage-studio/assets/index-DnrnUcoU.js","/stage-studio/assets/main-D17i_sSB.js","/stage-studio/assets/index-CsCESV8u.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BQ-Dx86a.js","/stage-studio/assets/web-DBGz4tVf.js","/stage-studio/assets/web-BmUa4T8h.js","/stage-studio/assets/web-BPUCzZ80.js","/stage-studio/assets/web-DEvERAfg.js","/stage-studio/assets/web-CqiSiC5-.js"];

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
      