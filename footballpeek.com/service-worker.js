'use strict';

const cacheVersion = 'v1';

this.addEventListener('activate', function (event) {
    event.waitUntil(
        // Delete old cache
        caches.keys().then(function (keyList) {
            return Promise.all(
                keyList.filter(function (key) {
                    return key != cacheVersion;
                }).map(function (key) {
                    return caches.delete(key);
                }));
        })
    );
});


this.addEventListener('fetch', function (event) {
    let originalResponse;

    event.respondWith(async function () {
        const cache = await caches.open(cacheVersion)

        const cachedResponsePromise = await cache.match(event.request.clone())
        const networkResponsePromise = fetch(event.request)

        event.waitUntil(async function () {
            const networkResponse = await networkResponsePromise
            await cache.put(event.request.clone(), networkResponse.clone())
        }())

        return cachedResponsePromise || networkResponsePromise
    }());
});
