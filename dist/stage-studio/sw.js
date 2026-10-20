
        const CACHE_NAME = "psm-stage-CGAUuN10-LcE4TaT_-TXXvxniV-COlicc2N-2Sprqr1p-FnfupzNM-BA27HjoT-y7H9Ej9Y-ab--CfB5oxmT-CUt5eDeg-swHgoK-h";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/","/manifest.webmanifest","/favicon.png","/assets/psm-logo-CGAUuN10.png","/assets/index-LcE4TaT_.css","/assets/three-engine-TXXvxniV.js","/assets/three-tools-COlicc2N.js","/assets/index-2Sprqr1p.js","/assets/main-FnfupzNM.js","/assets/index-BA27HjoT.js","/assets/Purchases.es-y7H9Ej9Y.js","/assets/web-DnImH-ab.js","/assets/web-ywFufle-.js","/assets/web-CfB5oxmT.js","/assets/web-CUt5eDeg.js","/assets/web-D-swHgoK.js","/assets/web-BdYSwB-h.js"];

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
              const appEntry = new URL("/", self.location.origin).href;
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
      