
        const CACHE_NAME = "psm-stage-CGAUuN10-C9CLsinV-Brix67Dh-Dwuh1Lu7-ByjvHJ6F-CvLWovnX-CWW_7_vD-y7H9Ej9Y-BfBxIxon-E4-BzGKUK8d-CrJriS7B-48ze6ILQ-I";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-C9CLsinV.css","/stage-studio/assets/three-engine-Brix67Dh.js","/stage-studio/assets/three-tools-Dwuh1Lu7.js","/stage-studio/assets/index-ByjvHJ6F.js","/stage-studio/assets/main-CvLWovnX.js","/stage-studio/assets/index-CWW_7_vD.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BfBxIxon.js","/stage-studio/assets/web-BPb25-E4.js","/stage-studio/assets/web-BzGKUK8d.js","/stage-studio/assets/web-CrJriS7B.js","/stage-studio/assets/web-48ze6ILQ.js","/stage-studio/assets/web-C6DClD-I.js"];

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
      