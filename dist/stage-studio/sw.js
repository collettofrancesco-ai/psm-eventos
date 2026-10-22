
        const CACHE_NAME = "psm-stage-CGAUuN10-CyrkvwtY-BtCAaDxU-DjIueebb-BEh9CpLR-rKNOVP-BOdQe6EG-y7H9Ej9Y-yFEkPVCS-gKvw2DRh-Bu2BMFDi-Caqa0NFX-2poXN-DmJMnojE";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CyrkvwtY.css","/stage-studio/assets/three-engine-BtCAaDxU.js","/stage-studio/assets/three-tools-DjIueebb.js","/stage-studio/assets/index-BEh9CpLR.js","/stage-studio/assets/main-D-rKNOVP.js","/stage-studio/assets/index-BOdQe6EG.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-yFEkPVCS.js","/stage-studio/assets/web-gKvw2DRh.js","/stage-studio/assets/web-Bu2BMFDi.js","/stage-studio/assets/web-Caqa0NFX.js","/stage-studio/assets/web-D4-2poXN.js","/stage-studio/assets/web-DmJMnojE.js"];

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
      