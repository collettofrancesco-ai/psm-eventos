
        const CACHE_NAME = "psm-stage-CGAUuN10-B3W8yDXn-TziEpa5t-W12_9BCf-CVUBFr1A-BrKz8DMO-BnsLaCQN-y7H9Ej9Y-BYLr1Xmt-Cz7_ofjK-QhfP23_A-Cc7psKym-BglUkdLd-DXSHlNPJ";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3W8yDXn.css","/stage-studio/assets/three-engine-TziEpa5t.js","/stage-studio/assets/three-tools-W12_9BCf.js","/stage-studio/assets/index-CVUBFr1A.js","/stage-studio/assets/main-BrKz8DMO.js","/stage-studio/assets/index-BnsLaCQN.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BYLr1Xmt.js","/stage-studio/assets/web-Cz7_ofjK.js","/stage-studio/assets/web-QhfP23_A.js","/stage-studio/assets/web-Cc7psKym.js","/stage-studio/assets/web-BglUkdLd.js","/stage-studio/assets/web-DXSHlNPJ.js"];

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
      