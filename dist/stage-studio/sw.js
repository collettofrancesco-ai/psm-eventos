
        const CACHE_NAME = "psm-stage-CGAUuN10-CuXuc6KU-BVzS0wSK-Dv_MYiBT-awojDMze-BEDrE4sY-D4b_83Yn-y7H9Ej9Y-CsMn3hF2-Bw79GHE6-DufYgLp4-D50ntDBR-CwulyAxt-BBclyE4R";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CuXuc6KU.css","/stage-studio/assets/three-engine-BVzS0wSK.js","/stage-studio/assets/three-tools-Dv_MYiBT.js","/stage-studio/assets/index-awojDMze.js","/stage-studio/assets/main-BEDrE4sY.js","/stage-studio/assets/index-D4b_83Yn.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-CsMn3hF2.js","/stage-studio/assets/web-Bw79GHE6.js","/stage-studio/assets/web-DufYgLp4.js","/stage-studio/assets/web-D50ntDBR.js","/stage-studio/assets/web-CwulyAxt.js","/stage-studio/assets/web-BBclyE4R.js"];

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
      