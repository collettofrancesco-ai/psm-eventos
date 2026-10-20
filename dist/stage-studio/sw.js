
        const CACHE_NAME = "psm-stage-CGAUuN10-B3Ev9nIz-BW9NMYfz-C4hRwJKk-CKjW_V4P-y5C7wWeO-Dmn0NTbu-y7H9Ej9Y-_vIfh9fe-C7MjxTh7-24yrWoqb-P-BffZSZ2g-DTb8C1bt";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/","/manifest.webmanifest","/favicon.png","/assets/psm-logo-CGAUuN10.png","/assets/index-B3Ev9nIz.css","/assets/three-engine-BW9NMYfz.js","/assets/three-tools-C4hRwJKk.js","/assets/index-CKjW_V4P.js","/assets/main-y5C7wWeO.js","/assets/index-Dmn0NTbu.js","/assets/Purchases.es-y7H9Ej9Y.js","/assets/web-_vIfh9fe.js","/assets/web-C7MjxTh7.js","/assets/web-24yrWoqb.js","/assets/web-BaLwB4-P.js","/assets/web-BffZSZ2g.js","/assets/web-DTb8C1bt.js"];

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
              const appEntry = new URL("/", self.location.origin).href;
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
      