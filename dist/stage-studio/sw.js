
        const CACHE_NAME = "psm-stage-CGAUuN10-CuXuc6KU-vhnIfbls--BU2kWZi3-B5Q20RWT-DyhT64Qr-y7H9Ej9Y-acg0E8on-BLMlxGN4-DA5wEI6g-CTA1jUKV-DUyOOC6V-CgnJAgy6";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CuXuc6KU.css","/stage-studio/assets/three-engine-vhnIfbls.js","/stage-studio/assets/three-tools-CMLn_Ia-.js","/stage-studio/assets/index-BU2kWZi3.js","/stage-studio/assets/main-B5Q20RWT.js","/stage-studio/assets/index-DyhT64Qr.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-acg0E8on.js","/stage-studio/assets/web-BLMlxGN4.js","/stage-studio/assets/web-DA5wEI6g.js","/stage-studio/assets/web-CTA1jUKV.js","/stage-studio/assets/web-DUyOOC6V.js","/stage-studio/assets/web-CgnJAgy6.js"];

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
      