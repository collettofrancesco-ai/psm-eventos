
        const CACHE_NAME = "psm-stage-CGAUuN10-W5-CWD9U2oL-Ck6Iw_ux-UPvTTiLx-BDZ47Dfn-C185WG8D-y7H9Ej9Y-ByBpJcUO-BrRNDNwz-B6E3rpBG-BqAmkfeZ-1W_25lPx-CmDBJB_X";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-KTywh-W5.css","/stage-studio/assets/three-engine-CWD9U2oL.js","/stage-studio/assets/three-tools-Ck6Iw_ux.js","/stage-studio/assets/index-UPvTTiLx.js","/stage-studio/assets/main-BDZ47Dfn.js","/stage-studio/assets/index-C185WG8D.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-ByBpJcUO.js","/stage-studio/assets/web-BrRNDNwz.js","/stage-studio/assets/web-B6E3rpBG.js","/stage-studio/assets/web-BqAmkfeZ.js","/stage-studio/assets/web-1W_25lPx.js","/stage-studio/assets/web-CmDBJB_X.js"];

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
      