const CACHE_NAME = 'apex-v1-rc11-idb';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './map_logic.js',
    './card_templates.js',
    './idb_helper.js',
    './phase3_functions.js',
    './flash_helper.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './splash-page.png',
    './tailwind.min.js',
    './html2canvas.min.js',
    './lucide.min.js',
    './leaflet.css',
    './leaflet.js',
    './LEGAL_GUIDE.md',
    './LICENSE.md'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                ASSETS.map(asset => cache.add(asset))
            ).then(results => {
                const failed = results.filter(r => r.status === 'rejected');
                if (failed.length > 0) {
                    console.warn('[SW] Some assets failed to cache:', failed);
                }
                return cache;
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // STALE-WHILE-REVALIDATE for application files
    // This ensures fast loading on mobile by serving from cache first,
    // then updating the cache in the background.
    const isAppFile = url.origin === self.location.origin &&
        (url.pathname.endsWith('/') ||
            url.pathname.endsWith('index.html') ||
            url.pathname.endsWith('script.js') ||
            url.pathname.endsWith('idb_helper.js') ||
            url.pathname.endsWith('style.css') ||
            url.pathname.endsWith('map_logic.js') ||
            url.pathname.endsWith('card_templates.js') ||
            url.pathname.endsWith('phase3_functions.js') ||
            url.pathname.endsWith('manifest.json'));

    if (isAppFile) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fail silently if offline, the cachedResponse will be returned
                });
                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // CACHE-FIRST for everything else
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
