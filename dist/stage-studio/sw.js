
        const CACHE_NAME = "psm-stage-CGAUuN10-C-CNlyn1fV-BbePLJ7o-B27wA3Jl-7vrHMmgH-DKFwSdGh-y7H9Ej9Y-CJ78yEKZ-X-E_npqiHs-ZSF-D2t2cKOq-BJdSQag0";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/","/manifest.webmanifest","/favicon.png","/assets/psm-logo-CGAUuN10.png","/assets/index-Do5RIM-C.css","/assets/three-engine-CNlyn1fV.js","/assets/three-tools-BbePLJ7o.js","/assets/index-B27wA3Jl.js","/assets/main-7vrHMmgH.js","/assets/index-DKFwSdGh.js","/assets/Purchases.es-y7H9Ej9Y.js","/assets/web-CJ78yEKZ.js","/assets/web-CPbpYF-X.js","/assets/web-E_npqiHs.js","/assets/web-DQDy-ZSF.js","/assets/web-D2t2cKOq.js","/assets/web-BJdSQag0.js"];

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
              const appEntry = new URL("/", self.location.origin).href;
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
      