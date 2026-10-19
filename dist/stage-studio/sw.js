
        const CACHE_NAME = "psm-stage-CGAUuN10-CRJo0MI9-D8YOsxnR-DVOL3Xnx-DpEnTmxL-BS4mOTQL-CNSQx_Fy-y7H9Ej9Y-Bhpvv5kV-KSq12_YA-ClbfiO6S-C8sYmUQp-jv8__Ds0-BhjXyyKi";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-CRJo0MI9.css","/stage-studio/assets/three-engine-D8YOsxnR.js","/stage-studio/assets/three-tools-DVOL3Xnx.js","/stage-studio/assets/index-DpEnTmxL.js","/stage-studio/assets/main-BS4mOTQL.js","/stage-studio/assets/index-CNSQx_Fy.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-Bhpvv5kV.js","/stage-studio/assets/web-KSq12_YA.js","/stage-studio/assets/web-ClbfiO6S.js","/stage-studio/assets/web-C8sYmUQp.js","/stage-studio/assets/web-jv8__Ds0.js","/stage-studio/assets/web-BhjXyyKi.js"];

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
      