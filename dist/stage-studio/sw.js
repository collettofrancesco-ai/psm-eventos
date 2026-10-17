
        const CACHE_NAME = "psm-stage-CGAUuN10-C-SZQHhQ_i-B2ZI79e_-C4TevDVh-KaHRybPP-BhHbc2SQ-y7H9Ej9Y-Whzw-B6DyX4vs-bdagei-U-mNIKpfdv-cwOixaa3";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Do5RIM-C.css","/stage-studio/assets/three-engine-SZQHhQ_i.js","/stage-studio/assets/three-tools-B2ZI79e_.js","/stage-studio/assets/index-C4TevDVh.js","/stage-studio/assets/main-KaHRybPP.js","/stage-studio/assets/index-BhHbc2SQ.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-B37-Whzw.js","/stage-studio/assets/web-B6DyX4vs.js","/stage-studio/assets/web-C-bdagei.js","/stage-studio/assets/web-DexTut-U.js","/stage-studio/assets/web-mNIKpfdv.js","/stage-studio/assets/web-cwOixaa3.js"];

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
      