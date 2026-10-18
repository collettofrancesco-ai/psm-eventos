
        const CACHE_NAME = "psm-stage-CGAUuN10-B0fHSxQK-TsUT39QV-0CsZD-Ccy0njSi-C_qKnLR0-DamfFkV6-y7H9Ej9Y-DdfTG4d2-DWBybOBZ-CYFPjOHj-DsatS_Vw-_Ot-BIvN1VOp";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-B0fHSxQK.css","/stage-studio/assets/three-engine-TsUT39QV.js","/stage-studio/assets/three-tools-CO-0CsZD.js","/stage-studio/assets/index-Ccy0njSi.js","/stage-studio/assets/main-C_qKnLR0.js","/stage-studio/assets/index-DamfFkV6.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-DdfTG4d2.js","/stage-studio/assets/web-DWBybOBZ.js","/stage-studio/assets/web-CYFPjOHj.js","/stage-studio/assets/web-DsatS_Vw.js","/stage-studio/assets/web-DwIj-_Ot.js","/stage-studio/assets/web-BIvN1VOp.js"];

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
      