
        const CACHE_NAME = "psm-stage-CGAUuN10-a4WpD-CaJ3X_dh-Czahv3Y4-BRQgkegE-CgzOdVEO-iZq-y7H9Ej9Y-CJB_zc1W-C6ACGsQq-GBiCNBPc-P_tzT_ng-ixpVj5OY-CQOFc511";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-BV-a4WpD.css","/stage-studio/assets/three-engine-CaJ3X_dh.js","/stage-studio/assets/three-tools-Czahv3Y4.js","/stage-studio/assets/index-BRQgkegE.js","/stage-studio/assets/main-CgzOdVEO.js","/stage-studio/assets/index-C2Zi-iZq.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-CJB_zc1W.js","/stage-studio/assets/web-C6ACGsQq.js","/stage-studio/assets/web-GBiCNBPc.js","/stage-studio/assets/web-P_tzT_ng.js","/stage-studio/assets/web-ixpVj5OY.js","/stage-studio/assets/web-CQOFc511.js"];

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
                // Revalidate HTML on every online navigation so a cached entry cannot keep
                // an older deployment visible after the site has already been updated.
                const response = await fetch(request, { cache: "no-cache" });
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
      