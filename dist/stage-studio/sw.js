
        const CACHE_NAME = "psm-stage-CGAUuN10-el-DtRXna8D-C8byRtXO-CAKx8pjU-ukL9LQAE-Ce7cIsKr-y7H9Ej9Y-CKC3wwh0-BjeepdTc-w5N5KEUE-DxmDdc74-x-DjLID_s8";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Rohpx-el.css","/stage-studio/assets/three-engine-DtRXna8D.js","/stage-studio/assets/three-tools-C8byRtXO.js","/stage-studio/assets/index-CAKx8pjU.js","/stage-studio/assets/main-ukL9LQAE.js","/stage-studio/assets/index-Ce7cIsKr.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-CKC3wwh0.js","/stage-studio/assets/web-BjeepdTc.js","/stage-studio/assets/web-w5N5KEUE.js","/stage-studio/assets/web-DxmDdc74.js","/stage-studio/assets/web-aIdayl-x.js","/stage-studio/assets/web-DjLID_s8.js"];

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
      