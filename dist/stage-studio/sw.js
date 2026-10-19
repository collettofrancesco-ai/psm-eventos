
        const CACHE_NAME = "psm-stage-CGAUuN10-B3Ev9nIz-vhnIfbls--CJkTkSj7-C3xQMk4f-DRoh1lNG-y7H9Ej9Y-BgWh3SrS-CELfVt5x-4xhP8HyH-BKEJvm50-BuSEu7QO-Cmg5tpnm";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3Ev9nIz.css","/stage-studio/assets/three-engine-vhnIfbls.js","/stage-studio/assets/three-tools-CMLn_Ia-.js","/stage-studio/assets/index-CJkTkSj7.js","/stage-studio/assets/main-C3xQMk4f.js","/stage-studio/assets/index-DRoh1lNG.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BgWh3SrS.js","/stage-studio/assets/web-CELfVt5x.js","/stage-studio/assets/web-4xhP8HyH.js","/stage-studio/assets/web-BKEJvm50.js","/stage-studio/assets/web-BuSEu7QO.js","/stage-studio/assets/web-Cmg5tpnm.js"];

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
      