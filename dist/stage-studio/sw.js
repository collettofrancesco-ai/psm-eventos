
        const CACHE_NAME = "psm-stage-CGAUuN10-BXwuuHVG-CaJ3X_dh-Czahv3Y4-DyY5Sppy-B8XkbUlX-BddmSH9S-y7H9Ej9Y-p2S-CgJIp4CM-CSpXowEy-z5uFjP_5-BwVq3ovq-DsMR_pZW";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-BXwuuHVG.css","/stage-studio/assets/three-engine-CaJ3X_dh.js","/stage-studio/assets/three-tools-Czahv3Y4.js","/stage-studio/assets/index-DyY5Sppy.js","/stage-studio/assets/main-B8XkbUlX.js","/stage-studio/assets/index-BddmSH9S.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Bhc7-p2S.js","/stage-studio/assets/web-CgJIp4CM.js","/stage-studio/assets/web-CSpXowEy.js","/stage-studio/assets/web-z5uFjP_5.js","/stage-studio/assets/web-BwVq3ovq.js","/stage-studio/assets/web-DsMR_pZW.js"];

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
      