
        const CACHE_NAME = "psm-stage-CGAUuN10-C-CNlyn1fV-BbePLJ7o-YTKhCY6H--C5VY7XSx-y7H9Ej9Y-6IKoGYhz-CZLtlCNt-DIusQgM8-CffqlU2m-B_tyY3N5-DgIg1NfY";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Do5RIM-C.css","/stage-studio/assets/three-engine-CNlyn1fV.js","/stage-studio/assets/three-tools-BbePLJ7o.js","/stage-studio/assets/index-YTKhCY6H.js","/stage-studio/assets/main-7Mjq_GC-.js","/stage-studio/assets/index-C5VY7XSx.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-6IKoGYhz.js","/stage-studio/assets/web-CZLtlCNt.js","/stage-studio/assets/web-DIusQgM8.js","/stage-studio/assets/web-CffqlU2m.js","/stage-studio/assets/web-B_tyY3N5.js","/stage-studio/assets/web-DgIg1NfY.js"];

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
      