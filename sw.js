const CACHE_NAME = 'apex-v1-rc2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
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
            // Use individual additions to prevent one failed fetch (like blocked Leaflet)
            // from breaking the entire installation.
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

    // NETWORK-FIRST for core application files to ensure sync
    // Better path matching for GitHub Pages subdirectories
    const isCoreFile = url.origin === self.location.origin &&
        (url.pathname.endsWith('/') ||
            url.pathname.endsWith('index.html') ||
            url.pathname.endsWith('script.js') ||
            url.pathname.endsWith('manifest.json'));

    if (isCoreFile) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
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
