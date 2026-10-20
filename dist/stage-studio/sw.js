
        const CACHE_NAME = "psm-stage-CGAUuN10-J7L1EuPx-CaJ3X_dh-Czahv3Y4-DVolhZeQ-YIYUV-DRWsWmlX-y7H9Ej9Y-b4JQ9Xk5-BmZexU42-BRE9cq1_-DuvsgL4J-eJz7HT7p-FeWS2P";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-J7L1EuPx.css","/stage-studio/assets/three-engine-CaJ3X_dh.js","/stage-studio/assets/three-tools-Czahv3Y4.js","/stage-studio/assets/index-DVolhZeQ.js","/stage-studio/assets/main-Ba-YIYUV.js","/stage-studio/assets/index-DRWsWmlX.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-b4JQ9Xk5.js","/stage-studio/assets/web-BmZexU42.js","/stage-studio/assets/web-BRE9cq1_.js","/stage-studio/assets/web-DuvsgL4J.js","/stage-studio/assets/web-eJz7HT7p.js","/stage-studio/assets/web-B-FeWS2P.js"];

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
      