const VERSION = '0.0.1-dev-5';

const assetsToCache = {
    statics: ['index.html', 'dist/bundle.js', 'css/bootstrap.min.css', 'favicon.ico', 'manifest.json'],
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

const pregs = {};

const shouldUrlBeCachedByCache = (url, cacheSection) => {
    if (!pregs[cacheSection]) {
        pregs[cacheSection] = new RegExp(`(?:${assetsToCache[cacheSection].join('|')})$`);
    }

    const result = pregs[cacheSection].test(url);

    return result;
};

self.addEventListener('fetch', e => {
    if (shouldUrlBeCachedByCache(e.request.url, 'statics')) {
        e.respondWith(cacheStatics(e.request));
    }
});
