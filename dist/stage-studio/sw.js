
        const CACHE_NAME = "psm-stage-CGAUuN10-BRfRS7S1-CNlyn1fV-BbePLJ7o-BNxoSqh1-DIwbu41x-DlNiB0Jm-y7H9Ej9Y-DCMOtwv6-CK42n8vA-aeNm3Hxk-4E6FB-DWjzgDAB-Bm2B2XFv";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-BRfRS7S1.css","/stage-studio/assets/three-engine-CNlyn1fV.js","/stage-studio/assets/three-tools-BbePLJ7o.js","/stage-studio/assets/index-BNxoSqh1.js","/stage-studio/assets/main-DIwbu41x.js","/stage-studio/assets/index-DlNiB0Jm.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-DCMOtwv6.js","/stage-studio/assets/web-CK42n8vA.js","/stage-studio/assets/web-aeNm3Hxk.js","/stage-studio/assets/web-BF-4E6FB.js","/stage-studio/assets/web-DWjzgDAB.js","/stage-studio/assets/web-Bm2B2XFv.js"];

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
      