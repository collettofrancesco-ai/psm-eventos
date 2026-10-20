
        const CACHE_NAME = "psm-stage-CGAUuN10-DarK7dko-BW9NMYfz-C4hRwJKk-0NR3349B-BI62HCRh-kIU1I8S7-y7H9Ej9Y-BdFt-DqnYXnGi-B3_pf793-W4jy6_0w-DpKCe6QG-Cyvqns1T";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-DarK7dko.css","/stage-studio/assets/three-engine-BW9NMYfz.js","/stage-studio/assets/three-tools-C4hRwJKk.js","/stage-studio/assets/index-0NR3349B.js","/stage-studio/assets/main-BI62HCRh.js","/stage-studio/assets/index-kIU1I8S7.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-SpJ-BdFt.js","/stage-studio/assets/web-DqnYXnGi.js","/stage-studio/assets/web-B3_pf793.js","/stage-studio/assets/web-W4jy6_0w.js","/stage-studio/assets/web-DpKCe6QG.js","/stage-studio/assets/web-Cyvqns1T.js"];

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
      