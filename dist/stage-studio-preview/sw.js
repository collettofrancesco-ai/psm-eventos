
        const CACHE_NAME = "psm-stage-CGAUuN10-Cx195cDR-BtCAaDxU-qpu2x0hZ-DDCmcxU8-CnkXPgxQ-Cmle7sru-y7H9Ej9Y-H-DQ4plL0r-3YfNbB_2-D6K5dZ0N-BIN4_auN-CENnNLNa";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio-preview/","/stage-studio-preview/manifest.webmanifest","/stage-studio-preview/favicon.png","/stage-studio-preview/models/backline/electric-guitar-v1.glb","/stage-studio-preview/models/backline/bass-guitar-four-string-v1.glb","/stage-studio-preview/models/backline/guitar-combo-amp-v1.glb","/stage-studio-preview/models/backline/acoustic-guitar-v1.glb","/stage-studio-preview/models/backline/guitar-stand-v1.glb","/stage-studio-preview/models/backline/drum-kit-five-piece-v1.glb","/stage-studio-preview/models/backline/keyboard-88-v1.glb","/stage-studio-preview/models/backline/microphone-stand-v1.glb","/stage-studio-preview/assets/psm-logo-CGAUuN10.png","/stage-studio-preview/assets/index-Cx195cDR.css","/stage-studio-preview/assets/three-engine-BtCAaDxU.js","/stage-studio-preview/assets/three-tools-qpu2x0hZ.js","/stage-studio-preview/assets/index-DDCmcxU8.js","/stage-studio-preview/assets/main-CnkXPgxQ.js","/stage-studio-preview/assets/index-Cmle7sru.js","/stage-studio-preview/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio-preview/assets/web-DUrTxZ-H.js","/stage-studio-preview/assets/web-DQ4plL0r.js","/stage-studio-preview/assets/web-3YfNbB_2.js","/stage-studio-preview/assets/web-D6K5dZ0N.js","/stage-studio-preview/assets/web-BIN4_auN.js","/stage-studio-preview/assets/web-CENnNLNa.js"];

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
              const appEntry = new URL("/stage-studio-preview/", self.location.origin).href;
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
      