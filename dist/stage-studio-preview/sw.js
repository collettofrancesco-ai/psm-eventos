
        const CACHE_NAME = "psm-stage-v2-CGAUuN10-Gq4T_e7n-BtCAaDxU-D8NAGzPU-Cp_YGYNm-Cnf8LnbG-hUj6U-y7H9Ej9Y-QKnbStsx-DEXr1wgr-DfRq09Ma-Cb3BXQzi-D3nlpSY1-DXGtt6gu";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio-preview/","/stage-studio-preview/manifest.webmanifest","/stage-studio-preview/favicon.png","/stage-studio-preview/models/backline/electric-guitar-v1.glb","/stage-studio-preview/models/backline/bass-guitar-four-string-v1.glb","/stage-studio-preview/models/backline/guitar-combo-amp-v1.glb","/stage-studio-preview/models/backline/acoustic-guitar-v1.glb","/stage-studio-preview/models/backline/guitar-stand-v1.glb","/stage-studio-preview/models/backline/drum-kit-five-piece-v1.glb","/stage-studio-preview/models/backline/keyboard-88-v1.glb","/stage-studio-preview/models/backline/microphone-stand-v1.glb","/stage-studio-preview/assets/psm-logo-CGAUuN10.png","/stage-studio-preview/assets/index-Gq4T_e7n.css","/stage-studio-preview/assets/three-engine-BtCAaDxU.js","/stage-studio-preview/assets/three-tools-D8NAGzPU.js","/stage-studio-preview/assets/index-Cp_YGYNm.js","/stage-studio-preview/assets/main-Cnf8LnbG.js","/stage-studio-preview/assets/index-CC-hUj6U.js","/stage-studio-preview/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio-preview/assets/web-QKnbStsx.js","/stage-studio-preview/assets/web-DEXr1wgr.js","/stage-studio-preview/assets/web-DfRq09Ma.js","/stage-studio-preview/assets/web-Cb3BXQzi.js","/stage-studio-preview/assets/web-D3nlpSY1.js","/stage-studio-preview/assets/web-DXGtt6gu.js"];

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
              const appEntry = new URL("/stage-studio-preview/", self.location.origin).href;
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
      