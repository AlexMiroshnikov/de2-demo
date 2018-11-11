const VERSION = '0.0.1-dev-1';

const assetsToCache = {
    statics: ['index.html', 'dist/bundle.js', 'css/bootstrap.min.css', 'favicon.ico'],
};

const cacheNamePrefixStatics = 'statics-';
const cacheNameStatics = `${cacheNamePrefixStatics}${VERSION}`;

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheNameStatics).then(cache => {
            cache.addAll(assetsToCache.statics);
        })
    );
});

self.addEventListener('activate', e => {
    const cleaned = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== cacheNameStatics && key.match(cacheNamePrefixStatics)) {
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(cleaned);
});

const cacheStatics = req => {
    return caches.match(req).then(cachedRes => {
        if (cachedRes) {
            return cachedRes;
        }

        return fetch(req).then(networkRes => {
            caches.open(cacheNameStatics).then(cache => {
                cache.put(req, networkRes);
            });
            return networkRes.clone();
        });
    });
};

self.addEventListener('fetch', e => {
    if (e.request.url.match(location.origin)) {
        e.respondWith(cacheStatics(e.request));
    }
});
