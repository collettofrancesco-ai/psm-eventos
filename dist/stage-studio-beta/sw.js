
        const CACHE_NAME = "psm-stage-v2-CGAUuN10-dD9oZoVO-BtCAaDxU-D59qk2hx-DCXmuVwu-DYVdlrGl-C_LwWqP6-y7H9Ej9Y-Iu9orRN9-Qhx-C0jor83T-Rq8mh16O-1d_PBmFS-BP8aFibA";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio-beta/","/stage-studio-beta/manifest.webmanifest","/stage-studio-beta/favicon.png","/stage-studio-beta/models/backline/electric-guitar-v1.glb","/stage-studio-beta/models/backline/bass-guitar-four-string-v1.glb","/stage-studio-beta/models/backline/guitar-combo-amp-v1.glb","/stage-studio-beta/models/backline/acoustic-guitar-v1.glb","/stage-studio-beta/models/backline/guitar-stand-v1.glb","/stage-studio-beta/models/backline/drum-kit-five-piece-v1.glb","/stage-studio-beta/models/backline/keyboard-88-v1.glb","/stage-studio-beta/models/backline/microphone-stand-v1.glb","/stage-studio-beta/assets/psm-logo-CGAUuN10.png","/stage-studio-beta/assets/index-dD9oZoVO.css","/stage-studio-beta/assets/three-engine-BtCAaDxU.js","/stage-studio-beta/assets/three-tools-D59qk2hx.js","/stage-studio-beta/assets/index-DCXmuVwu.js","/stage-studio-beta/assets/main-DYVdlrGl.js","/stage-studio-beta/assets/index-C_LwWqP6.js","/stage-studio-beta/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio-beta/assets/web-Iu9orRN9.js","/stage-studio-beta/assets/web-VVfn-Qhx.js","/stage-studio-beta/assets/web-C0jor83T.js","/stage-studio-beta/assets/web-Rq8mh16O.js","/stage-studio-beta/assets/web-1d_PBmFS.js","/stage-studio-beta/assets/web-BP8aFibA.js"];

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
              const appEntry = new URL("/stage-studio-beta/", self.location.origin).href;
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
      