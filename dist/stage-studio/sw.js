
        const CACHE_NAME = "psm-stage-CGAUuN10-LcE4TaT_-CaJ3X_dh-Czahv3Y4-CQsIhrTn-B7spSkmw-BXpPhvFe-y7H9Ej9Y-aMIfVQJ7-uEjRibXK-mrWZke0v-BZFYyTTw-Duar0pth-Dzt7g_Z0";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/","/manifest.webmanifest","/favicon.png","/assets/psm-logo-CGAUuN10.png","/assets/index-LcE4TaT_.css","/assets/three-engine-CaJ3X_dh.js","/assets/three-tools-Czahv3Y4.js","/assets/index-CQsIhrTn.js","/assets/main-B7spSkmw.js","/assets/index-BXpPhvFe.js","/assets/Purchases.es-y7H9Ej9Y.js","/assets/web-aMIfVQJ7.js","/assets/web-uEjRibXK.js","/assets/web-mrWZke0v.js","/assets/web-BZFYyTTw.js","/assets/web-Duar0pth.js","/assets/web-Dzt7g_Z0.js"];

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
      