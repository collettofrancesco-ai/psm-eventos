
        const CACHE_NAME = "psm-stage-CGAUuN10-DniodT3v-BtCAaDxU-DjIueebb-CRhCUuSi-B2Tke1Tn-1ZxG4uT8-y7H9Ej9Y-CRepkiXt-Brel0MqA-BMvk1Is3-BQaNt0MO-1nO-BmW7EYVS";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-DniodT3v.css","/stage-studio/assets/three-engine-BtCAaDxU.js","/stage-studio/assets/three-tools-DjIueebb.js","/stage-studio/assets/index-CRhCUuSi.js","/stage-studio/assets/main-B2Tke1Tn.js","/stage-studio/assets/index-1ZxG4uT8.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-CRepkiXt.js","/stage-studio/assets/web-Brel0MqA.js","/stage-studio/assets/web-BMvk1Is3.js","/stage-studio/assets/web-BQaNt0MO.js","/stage-studio/assets/web-J54A-1nO.js","/stage-studio/assets/web-BmW7EYVS.js"];

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
                // Revalidate HTML on every online navigation so a cached entry cannot keep
                // an older deployment visible after the site has already been updated.
                const response = await fetch(request, { cache: "no-cache" });
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
      