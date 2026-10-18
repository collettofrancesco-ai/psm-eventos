
        const CACHE_NAME = "psm-stage-CGAUuN10-CyFXtxfN-TsUT39QV-0CsZD-CpttNUEE-CP27ZLUm-iPe4L1Rb-y7H9Ej9Y-BEU0NEak-BHEhcUjh-D6KpD6oM-De9fINWF-DM2DGH5x-";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CyFXtxfN.css","/stage-studio/assets/three-engine-TsUT39QV.js","/stage-studio/assets/three-tools-CO-0CsZD.js","/stage-studio/assets/index-CpttNUEE.js","/stage-studio/assets/main-CP27ZLUm.js","/stage-studio/assets/index-iPe4L1Rb.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BEU0NEak.js","/stage-studio/assets/web-BHEhcUjh.js","/stage-studio/assets/web-D6KpD6oM.js","/stage-studio/assets/web-De9fINWF.js","/stage-studio/assets/web-DM2DGH5x.js","/stage-studio/assets/web-D9CuJc3-.js"];

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
      