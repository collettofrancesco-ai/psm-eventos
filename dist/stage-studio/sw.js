
        const CACHE_NAME = "psm-stage-CGAUuN10-taGUgK-DtRXna8D-C8byRtXO-Ba17FjE4-BQ9wNxeC-BQW0VYwD-y7H9Ej9Y-w2ZlMsCq-BLxdFbBW-CgvDFVYz-C0zVezva-kgMqQGUC-gd_";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-X-taGUgK.css","/stage-studio/assets/three-engine-DtRXna8D.js","/stage-studio/assets/three-tools-C8byRtXO.js","/stage-studio/assets/index-Ba17FjE4.js","/stage-studio/assets/main-BQ9wNxeC.js","/stage-studio/assets/index-BQW0VYwD.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-w2ZlMsCq.js","/stage-studio/assets/web-BLxdFbBW.js","/stage-studio/assets/web-CgvDFVYz.js","/stage-studio/assets/web-C0zVezva.js","/stage-studio/assets/web-kgMqQGUC.js","/stage-studio/assets/web-B-Qx-gd_.js"];

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
      