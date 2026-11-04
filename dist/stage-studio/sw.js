
        const CACHE_NAME = "psm-stage-v2-CGAUuN10-Gq4T_e7n-BtCAaDxU-D59qk2hx-B9_G8Qx0-B_91ROrA-BxWFA4N3-y7H9Ej9Y-6EaJxeED-CXgg6Qbx-ZLchT2Sh-CuLKTSNg-dXN-BQEZrdOm";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/models/backline/electric-guitar-v1.glb","/stage-studio/models/backline/bass-guitar-four-string-v1.glb","/stage-studio/models/backline/guitar-combo-amp-v1.glb","/stage-studio/models/backline/acoustic-guitar-v1.glb","/stage-studio/models/backline/guitar-stand-v1.glb","/stage-studio/models/backline/drum-kit-five-piece-v1.glb","/stage-studio/models/backline/keyboard-88-v1.glb","/stage-studio/models/backline/microphone-stand-v1.glb","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Gq4T_e7n.css","/stage-studio/assets/three-engine-BtCAaDxU.js","/stage-studio/assets/three-tools-D59qk2hx.js","/stage-studio/assets/index-B9_G8Qx0.js","/stage-studio/assets/main-B_91ROrA.js","/stage-studio/assets/index-BxWFA4N3.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-6EaJxeED.js","/stage-studio/assets/web-CXgg6Qbx.js","/stage-studio/assets/web-ZLchT2Sh.js","/stage-studio/assets/web-CuLKTSNg.js","/stage-studio/assets/web-xGNN-dXN.js","/stage-studio/assets/web-BQEZrdOm.js"];

        async function readCached(request) {
          try { return await caches.match(request); }
          catch { return undefined; }
        }
        async function remember(request, response) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          } catch {
            // Cache denial or quota must never discard a successful network response.
          }
        }

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
                  await remember(appEntry, response);
                }
                return response;
              } catch {
                return (await readCached(request)) || (await readCached(appEntry)) ||
                  new Response('Offline app shell unavailable.', { status: 503 });
              }
            })());
            return;
          }

          event.respondWith((async () => {
            const cached = await readCached(request);
            if (cached) return cached;

            const response = await fetch(request);
            if (response.ok) {
              await remember(request, response);
            }
            return response;
          })());
        });
      