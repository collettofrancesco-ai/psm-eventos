
        const CACHE_NAME = "psm-stage-CGAUuN10-CSOiot3_-CaJ3X_dh-Czahv3Y4-CmNaN3ec-BlfWDQX3-C3Tb7kCa-y7H9Ej9Y-Czw8zyaR-CbKwQ3yt-Db7utFtQ-BijyvoCw-y-koarJcUW";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CSOiot3_.css","/stage-studio/assets/three-engine-CaJ3X_dh.js","/stage-studio/assets/three-tools-Czahv3Y4.js","/stage-studio/assets/index-CmNaN3ec.js","/stage-studio/assets/main-BlfWDQX3.js","/stage-studio/assets/index-C3Tb7kCa.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Czw8zyaR.js","/stage-studio/assets/web-CbKwQ3yt.js","/stage-studio/assets/web-Db7utFtQ.js","/stage-studio/assets/web-BijyvoCw.js","/stage-studio/assets/web-CLNF7m-y.js","/stage-studio/assets/web-koarJcUW.js"];

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
      