
        const CACHE_NAME = "psm-stage-CGAUuN10-CuXuc6KU-BVzS0wSK-Dv_MYiBT-FhikTDtx-DvOT61Z7-CFplFASa-y7H9Ej9Y-CfRqZvnc-Kjo8PMYc-VwmKgK55-1C2U5N3F-D2oksGpe-CflzAJ7V";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CuXuc6KU.css","/stage-studio/assets/three-engine-BVzS0wSK.js","/stage-studio/assets/three-tools-Dv_MYiBT.js","/stage-studio/assets/index-FhikTDtx.js","/stage-studio/assets/main-DvOT61Z7.js","/stage-studio/assets/index-CFplFASa.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-CfRqZvnc.js","/stage-studio/assets/web-Kjo8PMYc.js","/stage-studio/assets/web-VwmKgK55.js","/stage-studio/assets/web-1C2U5N3F.js","/stage-studio/assets/web-D2oksGpe.js","/stage-studio/assets/web-CflzAJ7V.js"];

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
      