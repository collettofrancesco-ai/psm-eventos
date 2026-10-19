
        const CACHE_NAME = "psm-stage-CGAUuN10-CRJo0MI9-D8YOsxnR-DVOL3Xnx-FHu-CVCtfTyM-CKypyGaY-y7H9Ej9Y-BHUCApCP-DXsN8uTI-vL6fFijr-9SH5pOMU-CzO8PhCH-DUA53OIP";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CRJo0MI9.css","/stage-studio/assets/three-engine-D8YOsxnR.js","/stage-studio/assets/three-tools-DVOL3Xnx.js","/stage-studio/assets/index-DcPG-FHu.js","/stage-studio/assets/main-CVCtfTyM.js","/stage-studio/assets/index-CKypyGaY.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BHUCApCP.js","/stage-studio/assets/web-DXsN8uTI.js","/stage-studio/assets/web-vL6fFijr.js","/stage-studio/assets/web-9SH5pOMU.js","/stage-studio/assets/web-CzO8PhCH.js","/stage-studio/assets/web-DUA53OIP.js"];

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
      