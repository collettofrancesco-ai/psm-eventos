
        const CACHE_NAME = "psm-stage-CGAUuN10-CoRbL6Fx-UDJ-Dn1JjDWM-CYfuWrx_-DlhcGPfD--y7H9Ej9Y-Dsq_dseC-BRAzUd07-EkRqOU_a-Cl78z3m3-B8kuJsUc-Bnbq_Dbe";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CoRbL6Fx.css","/stage-studio/assets/three-engine-BNSF-UDJ.js","/stage-studio/assets/three-tools-Dn1JjDWM.js","/stage-studio/assets/index-CYfuWrx_.js","/stage-studio/assets/main-DlhcGPfD.js","/stage-studio/assets/index-BpgUI0R-.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Dsq_dseC.js","/stage-studio/assets/web-BRAzUd07.js","/stage-studio/assets/web-EkRqOU_a.js","/stage-studio/assets/web-Cl78z3m3.js","/stage-studio/assets/web-B8kuJsUc.js","/stage-studio/assets/web-Bnbq_Dbe.js"];

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
      