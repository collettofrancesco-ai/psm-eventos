
        const CACHE_NAME = "psm-stage-CGAUuN10-B3Ev9nIz-BW9NMYfz-C4hRwJKk-Djcj17RZ-CSJLwaDB-BdKTvHuZ-y7H9Ej9Y-DJHadj6s-gJAyvxb_-BIfW0vBG-ekCBPB-Ejiy70u6-C56WwTYc";
        const CACHE_PREFIX = 'psm-stage-';
        const PRECACHE_URLS = ["/","/manifest.webmanifest","/favicon.png","/assets/psm-logo-CGAUuN10.png","/assets/index-B3Ev9nIz.css","/assets/three-engine-BW9NMYfz.js","/assets/three-tools-C4hRwJKk.js","/assets/index-Djcj17RZ.js","/assets/main-CSJLwaDB.js","/assets/index-BdKTvHuZ.js","/assets/Purchases.es-y7H9Ej9Y.js","/assets/web-DJHadj6s.js","/assets/web-gJAyvxb_.js","/assets/web-BIfW0vBG.js","/assets/web-C-ekCBPB.js","/assets/web-Ejiy70u6.js","/assets/web-C56WwTYc.js"];

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
      