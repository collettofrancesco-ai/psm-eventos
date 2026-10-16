
        const CACHE_NAME = "psm-stage-CGAUuN10-Cu_ZZwCi-b-Dno2PU9W-CqYKdKIV-0ebsCMR4-D2W5hhHc-y7H9Ej9Y-a-VQHckNRu-CteJljDb-DpvU6pTd-CSAk7fhX-ilb94zgA";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-Cu_ZZwCi.css","/stage-studio/assets/three-engine-BgFwPd-b.js","/stage-studio/assets/three-tools-Dno2PU9W.js","/stage-studio/assets/index-CqYKdKIV.js","/stage-studio/assets/main-0ebsCMR4.js","/stage-studio/assets/index-D2W5hhHc.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-R1-5Oy-a.js","/stage-studio/assets/web-VQHckNRu.js","/stage-studio/assets/web-CteJljDb.js","/stage-studio/assets/web-DpvU6pTd.js","/stage-studio/assets/web-CSAk7fhX.js","/stage-studio/assets/web-ilb94zgA.js"];

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
      