
        const CACHE_NAME = "psm-stage-CGAUuN10-B3W8yDXn-BCMyYWwb-BvzURc2N-7-CyC08NNp-DJBoQtn4-y7H9Ej9Y-DFN9PI2d-CjZLWrRv-Dqpe9DSp-BBgTwW8H-DdGqbRz9-B3_E98hP";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3W8yDXn.css","/stage-studio/assets/three-engine-BCMyYWwb.js","/stage-studio/assets/three-tools-BvzURc2N.js","/stage-studio/assets/index-DX01v6-7.js","/stage-studio/assets/main-CyC08NNp.js","/stage-studio/assets/index-DJBoQtn4.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-DFN9PI2d.js","/stage-studio/assets/web-CjZLWrRv.js","/stage-studio/assets/web-Dqpe9DSp.js","/stage-studio/assets/web-BBgTwW8H.js","/stage-studio/assets/web-DdGqbRz9.js","/stage-studio/assets/web-B3_E98hP.js"];

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
      