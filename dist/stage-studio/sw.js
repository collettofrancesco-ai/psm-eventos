
        const CACHE_NAME = "psm-stage-CGAUuN10-el-SZQHhQ_i-B2ZI79e_-239_V0yt-ik-DtxalhnN-y7H9Ej9Y-C3jKuTrt-CbTKyxfF-C_mBP2Yi-Bef8u34q-BnpngjnF-J";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Rohpx-el.css","/stage-studio/assets/three-engine-SZQHhQ_i.js","/stage-studio/assets/three-tools-B2ZI79e_.js","/stage-studio/assets/index-239_V0yt.js","/stage-studio/assets/main-B2Q-C-ik.js","/stage-studio/assets/index-DtxalhnN.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-C3jKuTrt.js","/stage-studio/assets/web-CbTKyxfF.js","/stage-studio/assets/web-C_mBP2Yi.js","/stage-studio/assets/web-Bef8u34q.js","/stage-studio/assets/web-BnpngjnF.js","/stage-studio/assets/web-B82HBW-J.js"];

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
      