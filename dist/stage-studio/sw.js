
        const CACHE_NAME = "psm-stage-CGAUuN10-B3Ev9nIz-vhnIfbls--C7cSuU5s-B_GmhJdY-DTFRBbxb-y7H9Ej9Y-B8uEYJBq-CMSBk5ub-C9h1O9K_-Bh5grO9K-C7O50RSs-DjtjU66E";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3Ev9nIz.css","/stage-studio/assets/three-engine-vhnIfbls.js","/stage-studio/assets/three-tools-CMLn_Ia-.js","/stage-studio/assets/index-C7cSuU5s.js","/stage-studio/assets/main-B_GmhJdY.js","/stage-studio/assets/index-DTFRBbxb.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-B8uEYJBq.js","/stage-studio/assets/web-CMSBk5ub.js","/stage-studio/assets/web-C9h1O9K_.js","/stage-studio/assets/web-Bh5grO9K.js","/stage-studio/assets/web-C7O50RSs.js","/stage-studio/assets/web-DjtjU66E.js"];

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
      