
        const CACHE_NAME = "psm-stage-CGAUuN10-BqTq1m0T-BY3xq276-BO54gwW-DOnFoBo0-U-EMvPwCic-y7H9Ej9Y-BUKXdkmg-CpxjDXrB-mcN90ucZ-CIVCWimR-CFqdCAO1-bZJuWICo";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/stage-studio/","/stage-studio/manifest.webmanifest","/stage-studio/favicon.png","/stage-studio/assets/psm-logo-CGAUuN10.png","/stage-studio/assets/index-BqTq1m0T.css","/stage-studio/assets/three-engine-BY3xq276.js","/stage-studio/assets/three-tools--BO54gwW.js","/stage-studio/assets/index-DOnFoBo0.js","/stage-studio/assets/main-CrkZcY-U.js","/stage-studio/assets/index-EMvPwCic.js","/stage-studio/assets/Purchases.es-y7H9Ej9Y.js","/stage-studio/assets/web-BUKXdkmg.js","/stage-studio/assets/web-CpxjDXrB.js","/stage-studio/assets/web-mcN90ucZ.js","/stage-studio/assets/web-CIVCWimR.js","/stage-studio/assets/web-CFqdCAO1.js","/stage-studio/assets/web-bZJuWICo.js"];

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
      