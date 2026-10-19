
        const CACHE_NAME = "psm-stage-CGAUuN10-CuXuc6KU-BVzS0wSK-Dv_MYiBT--DUhE_GAN-0Suh7-y7H9Ej9Y-C_q4L0p_-TplaXyrW-C91jiqvg-DDESI4h3-DcgRgPz0-DtU1MblI";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CuXuc6KU.css","/stage-studio/assets/three-engine-BVzS0wSK.js","/stage-studio/assets/three-tools-Dv_MYiBT.js","/stage-studio/assets/index-D2qhXFJ-.js","/stage-studio/assets/main-DUhE_GAN.js","/stage-studio/assets/index-BB-0Suh7.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-C_q4L0p_.js","/stage-studio/assets/web-TplaXyrW.js","/stage-studio/assets/web-C91jiqvg.js","/stage-studio/assets/web-DDESI4h3.js","/stage-studio/assets/web-DcgRgPz0.js","/stage-studio/assets/web-DtU1MblI.js"];

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
      