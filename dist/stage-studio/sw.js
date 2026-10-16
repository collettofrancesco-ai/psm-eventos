
        const CACHE_NAME = "psm-stage-CGAUuN10-CoRbL6Fx-b-Dno2PU9W-B9SEU8Kh--oLKD-y7H9Ej9Y-ByWQnr6k-5t1Hsvx7-Z3oHQRM8-Cu_dGyXl-DGzqfaT1-CLwfKaio";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CoRbL6Fx.css","/stage-studio/assets/three-engine-BgFwPd-b.js","/stage-studio/assets/three-tools-Dno2PU9W.js","/stage-studio/assets/index-B9SEU8Kh.js","/stage-studio/assets/main-DWNTDkk-.js","/stage-studio/assets/index-qi7-oLKD.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-ByWQnr6k.js","/stage-studio/assets/web-5t1Hsvx7.js","/stage-studio/assets/web-Z3oHQRM8.js","/stage-studio/assets/web-Cu_dGyXl.js","/stage-studio/assets/web-DGzqfaT1.js","/stage-studio/assets/web-CLwfKaio.js"];

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
      