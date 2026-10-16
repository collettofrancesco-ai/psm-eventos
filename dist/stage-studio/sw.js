
        const CACHE_NAME = "psm-stage-CGAUuN10-B3W8yDXn-8OKtwrpA-CDjAGCJ1-ziWQAozd-W64z8RGG-zMJ8_t8b-y7H9Ej9Y-C2r1S97f-CGmHVI6A-DUxrh5AL-CRNrG4pb-zS2-aR7";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3W8yDXn.css","/stage-studio/assets/three-engine-8OKtwrpA.js","/stage-studio/assets/three-tools-CDjAGCJ1.js","/stage-studio/assets/index-ziWQAozd.js","/stage-studio/assets/main-W64z8RGG.js","/stage-studio/assets/index-zMJ8_t8b.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-C2r1S97f.js","/stage-studio/assets/web-CGmHVI6A.js","/stage-studio/assets/web-DUxrh5AL.js","/stage-studio/assets/web-CRNrG4pb.js","/stage-studio/assets/web-Bre2-zS2.js","/stage-studio/assets/web-CYst-aR7.js"];

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
      