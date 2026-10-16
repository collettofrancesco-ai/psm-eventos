
        const CACHE_NAME = "psm-stage-CGAUuN10-B6rGlxtO-mt-BKfWQzLz-2j9Itw45-lmO4KnPm-C7s2yaXc-y7H9Ej9Y-BQPDJfyP-BhJTMnDG-DjCCq4v1-Br2diD3G-TrVSy-D5ouPCRO";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B6rGlxtO.css","/stage-studio/assets/three-engine-DfVjv-mt.js","/stage-studio/assets/three-tools-BKfWQzLz.js","/stage-studio/assets/index-2j9Itw45.js","/stage-studio/assets/main-lmO4KnPm.js","/stage-studio/assets/index-C7s2yaXc.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BQPDJfyP.js","/stage-studio/assets/web-BhJTMnDG.js","/stage-studio/assets/web-DjCCq4v1.js","/stage-studio/assets/web-Br2diD3G.js","/stage-studio/assets/web-DO-TrVSy.js","/stage-studio/assets/web-D5ouPCRO.js"];

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
      