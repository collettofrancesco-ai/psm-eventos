
        const CACHE_NAME = "psm-stage-v2-CGAUuN10-dD9oZoVO-BtCAaDxU-D59qk2hx-DyTZovkz-Dm4IV6vP-CZE1hRcS-y7H9Ej9Y-N3djYZxZ-CxeoJXNI-bZfmPAan-C1x9bY0_-BZZCt2g1-Dcwj0PVY";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio-beta/","/stage-studio-beta/manifest.webmanifest","/stage-studio-beta/favicon.png","/stage-studio-beta/models/backline/electric-guitar-v1.glb","/stage-studio-beta/models/backline/bass-guitar-four-string-v1.glb","/stage-studio-beta/models/backline/guitar-combo-amp-v1.glb","/stage-studio-beta/models/backline/acoustic-guitar-v1.glb","/stage-studio-beta/models/backline/guitar-stand-v1.glb","/stage-studio-beta/models/backline/drum-kit-five-piece-v1.glb","/stage-studio-beta/models/backline/keyboard-88-v1.glb","/stage-studio-beta/models/backline/microphone-stand-v1.glb","/stage-studio-beta/assets/psm-logo-CGAUuN10.png","/stage-studio-beta/assets/index-dD9oZoVO.css","/stage-studio-beta/assets/three-engine-BtCAaDxU.js","/stage-studio-beta/assets/three-tools-D59qk2hx.js","/stage-studio-beta/assets/index-DyTZovkz.js","/stage-studio-beta/assets/main-Dm4IV6vP.js","/stage-studio-beta/assets/index-CZE1hRcS.js","/stage-studio-beta/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio-beta/assets/web-N3djYZxZ.js","/stage-studio-beta/assets/web-CxeoJXNI.js","/stage-studio-beta/assets/web-bZfmPAan.js","/stage-studio-beta/assets/web-C1x9bY0_.js","/stage-studio-beta/assets/web-BZZCt2g1.js","/stage-studio-beta/assets/web-Dcwj0PVY.js"];

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
      