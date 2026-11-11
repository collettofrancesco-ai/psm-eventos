
        const CACHE_NAME = "psm-stage-v2-CGAUuN10-B84fMffS-BtCAaDxU-D8NAGzPU-CGr64P_v-Ddm7rWwO-CEUBnkp2-y7H9Ej9Y-BWTASnFP-DgrB6N2H-BXBuDoGC-D4SNrHBz-8a416P1X-CZKUKLb2";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/models/backline/electric-guitar-v1.glb","/stage-studio/models/backline/bass-guitar-four-string-v1.glb","/stage-studio/models/backline/guitar-combo-amp-v1.glb","/stage-studio/models/backline/acoustic-guitar-v1.glb","/stage-studio/models/backline/guitar-stand-v1.glb","/stage-studio/models/backline/drum-kit-five-piece-v1.glb","/stage-studio/models/backline/keyboard-88-v1.glb","/stage-studio/models/backline/microphone-stand-v1.glb","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B84fMffS.css","/stage-studio/assets/three-engine-BtCAaDxU.js","/stage-studio/assets/three-tools-D8NAGzPU.js","/stage-studio/assets/index-CGr64P_v.js","/stage-studio/assets/main-Ddm7rWwO.js","/stage-studio/assets/index-CEUBnkp2.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BWTASnFP.js","/stage-studio/assets/web-DgrB6N2H.js","/stage-studio/assets/web-BXBuDoGC.js","/stage-studio/assets/web-D4SNrHBz.js","/stage-studio/assets/web-8a416P1X.js","/stage-studio/assets/web-CZKUKLb2.js"];

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
      