
        const CACHE_NAME = "psm-stage-CGAUuN10-B3Ev9nIz-BW9NMYfz-C4hRwJKk-ruJ3-lISZkMK-C6I7GGDh-y7H9Ej9Y-dFILKMoA-Cm_P10gW-ngh6r-BVBdPoLL--yNY5SZMF";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3Ev9nIz.css","/stage-studio/assets/three-engine-BW9NMYfz.js","/stage-studio/assets/three-tools-C4hRwJKk.js","/stage-studio/assets/index-DZp-ruJ3.js","/stage-studio/assets/main--lISZkMK.js","/stage-studio/assets/index-C6I7GGDh.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-dFILKMoA.js","/stage-studio/assets/web-Cm_P10gW.js","/stage-studio/assets/web-Bc-ngh6r.js","/stage-studio/assets/web-BVBdPoLL.js","/stage-studio/assets/web-DiR7MNf-.js","/stage-studio/assets/web-yNY5SZMF.js"];

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
      