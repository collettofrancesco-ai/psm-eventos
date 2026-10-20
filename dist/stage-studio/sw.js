
        const CACHE_NAME = "psm-stage-CGAUuN10-DarK7dko-BW9NMYfz-C4hRwJKk-BoXdgZPg-Dkq7egpK-Bwr1wGJu-y7H9Ej9Y-DqRn6I_m-DFhyReuu-CGyRfm5q-Cd6i2JEz-BtUhMpW6-BzE4SjRQ";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-DarK7dko.css","/stage-studio/assets/three-engine-BW9NMYfz.js","/stage-studio/assets/three-tools-C4hRwJKk.js","/stage-studio/assets/index-BoXdgZPg.js","/stage-studio/assets/main-Dkq7egpK.js","/stage-studio/assets/index-Bwr1wGJu.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-DqRn6I_m.js","/stage-studio/assets/web-DFhyReuu.js","/stage-studio/assets/web-CGyRfm5q.js","/stage-studio/assets/web-Cd6i2JEz.js","/stage-studio/assets/web-BtUhMpW6.js","/stage-studio/assets/web-BzE4SjRQ.js"];

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
      