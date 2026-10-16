
        const CACHE_NAME = "psm-stage-CGAUuN10-B3W8yDXn-TziEpa5t-W12_9BCf-JzB8Z324-3DPDUzeJ-B_x6oRmo-y7H9Ej9Y-Q7OKv0_R-D99Ulnme-0BHdw1nL-Duzd3niC-DyfW3VO6-kbvr4EL_";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3W8yDXn.css","/stage-studio/assets/three-engine-TziEpa5t.js","/stage-studio/assets/three-tools-W12_9BCf.js","/stage-studio/assets/index-JzB8Z324.js","/stage-studio/assets/main-3DPDUzeJ.js","/stage-studio/assets/index-B_x6oRmo.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Q7OKv0_R.js","/stage-studio/assets/web-D99Ulnme.js","/stage-studio/assets/web-0BHdw1nL.js","/stage-studio/assets/web-Duzd3niC.js","/stage-studio/assets/web-DyfW3VO6.js","/stage-studio/assets/web-kbvr4EL_.js"];

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
      