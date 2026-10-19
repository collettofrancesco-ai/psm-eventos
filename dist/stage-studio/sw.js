
        const CACHE_NAME = "psm-stage-CGAUuN10-CuXuc6KU-vhnIfbls---C2QgyP9P-opxs-y7H9Ej9Y-ChuUBNCP-xwjG-yzxSIL1O-Cui2n1Ns-DRifQSdn-XtQ3";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CuXuc6KU.css","/stage-studio/assets/three-engine-vhnIfbls.js","/stage-studio/assets/three-tools-CMLn_Ia-.js","/stage-studio/assets/index-Bu0LdsN-.js","/stage-studio/assets/main-C2QgyP9P.js","/stage-studio/assets/index-f8Q-opxs.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-ChuUBNCP.js","/stage-studio/assets/web-DA2-xwjG.js","/stage-studio/assets/web-yzxSIL1O.js","/stage-studio/assets/web-Cui2n1Ns.js","/stage-studio/assets/web-DRifQSdn.js","/stage-studio/assets/web-BHv-XtQ3.js"];

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
      