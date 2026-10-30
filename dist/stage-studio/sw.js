
        const CACHE_NAME = "psm-stage-CGAUuN10-Cx195cDR-BtCAaDxU-B3M8aRdW-CM_AlPf_-B1FtBRv0-ByMng12I-y7H9Ej9Y-gOYGzQCO-DtbOPlN2-DeWbkHga-mavqhwBn-aHDHzOez-DTcIR41N";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/models/backline/electric-guitar-v1.glb","/stage-studio/models/backline/bass-guitar-four-string-v1.glb","/stage-studio/models/backline/guitar-combo-amp-v1.glb","/stage-studio/models/backline/acoustic-guitar-v1.glb","/stage-studio/models/backline/guitar-stand-v1.glb","/stage-studio/models/backline/drum-kit-five-piece-v1.glb","/stage-studio/models/backline/keyboard-88-v1.glb","/stage-studio/models/backline/microphone-stand-v1.glb","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Cx195cDR.css","/stage-studio/assets/three-engine-BtCAaDxU.js","/stage-studio/assets/three-tools-B3M8aRdW.js","/stage-studio/assets/index-CM_AlPf_.js","/stage-studio/assets/main-B1FtBRv0.js","/stage-studio/assets/index-ByMng12I.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-gOYGzQCO.js","/stage-studio/assets/web-DtbOPlN2.js","/stage-studio/assets/web-DeWbkHga.js","/stage-studio/assets/web-mavqhwBn.js","/stage-studio/assets/web-aHDHzOez.js","/stage-studio/assets/web-DTcIR41N.js"];

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
                // Revalidate HTML on every online navigation so a cached entry cannot keep
                // an older deployment visible after the site has already been updated.
                const response = await fetch(request, { cache: "no-cache" });
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
      