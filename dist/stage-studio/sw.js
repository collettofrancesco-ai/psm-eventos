
        const CACHE_NAME = "psm-stage-CGAUuN10-Bd0EqChw-BtCAaDxU-zhswcxLC-QOFcqJsi-Dp3Jk6c0-D87Guzdl-y7H9Ej9Y-DsiOpatt-z1E1qKVC-BMLQQo1o-BbFfh2l1-BNDmzix1-qVSdrHSW";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/models/backline/electric-guitar-v1.glb","/stage-studio/models/backline/bass-guitar-four-string-v1.glb","/stage-studio/models/backline/guitar-combo-amp-v1.glb","/stage-studio/models/backline/acoustic-guitar-v1.glb","/stage-studio/models/backline/guitar-stand-v1.glb","/stage-studio/models/backline/drum-kit-five-piece-v1.glb","/stage-studio/models/backline/keyboard-88-v1.glb","/stage-studio/models/backline/microphone-stand-v1.glb","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Bd0EqChw.css","/stage-studio/assets/three-engine-BtCAaDxU.js","/stage-studio/assets/three-tools-zhswcxLC.js","/stage-studio/assets/index-QOFcqJsi.js","/stage-studio/assets/main-Dp3Jk6c0.js","/stage-studio/assets/index-D87Guzdl.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-DsiOpatt.js","/stage-studio/assets/web-z1E1qKVC.js","/stage-studio/assets/web-BMLQQo1o.js","/stage-studio/assets/web-BbFfh2l1.js","/stage-studio/assets/web-BNDmzix1.js","/stage-studio/assets/web-qVSdrHSW.js"];

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
      