
        const CACHE_NAME = "psm-stage-CGAUuN10-B3Ev9nIz-BW9NMYfz-C4hRwJKk-ZYEEL46y-CWMIgzxX-C3MY_cVY-y7H9Ej9Y-1Zsl3O6p-Cru41J0b-t3egDTaf-Bxr3HpPq-DGm6w7t1-CYy6Kq5c";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B3Ev9nIz.css","/stage-studio/assets/three-engine-BW9NMYfz.js","/stage-studio/assets/three-tools-C4hRwJKk.js","/stage-studio/assets/index-ZYEEL46y.js","/stage-studio/assets/main-CWMIgzxX.js","/stage-studio/assets/index-C3MY_cVY.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-1Zsl3O6p.js","/stage-studio/assets/web-Cru41J0b.js","/stage-studio/assets/web-t3egDTaf.js","/stage-studio/assets/web-Bxr3HpPq.js","/stage-studio/assets/web-DGm6w7t1.js","/stage-studio/assets/web-CYy6Kq5c.js"];

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
      