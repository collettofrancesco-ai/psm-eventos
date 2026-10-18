
        const CACHE_NAME = "psm-stage-CGAUuN10-D8EJShGW-BORBm3RQ-BvOip_8p-qxSj-CCTYlAV_-Cb3treib-y7H9Ej9Y-5g_rtvHq-DrVVjrgu-9D9ROm-1Y-DWnf7B8P-E1t5dksZ";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-D8EJShGW.css","/stage-studio/assets/three-engine-BORBm3RQ.js","/stage-studio/assets/three-tools-BvOip_8p.js","/stage-studio/assets/index-BNa-qxSj.js","/stage-studio/assets/main-CCTYlAV_.js","/stage-studio/assets/index-Cb3treib.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-5g_rtvHq.js","/stage-studio/assets/web-DrVVjrgu.js","/stage-studio/assets/web-D-9D9ROm.js","/stage-studio/assets/web-C0Gnb-1Y.js","/stage-studio/assets/web-DWnf7B8P.js","/stage-studio/assets/web-E1t5dksZ.js"];

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
      