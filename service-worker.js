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

    event.respondWith(
        caches.match(event.request.clone()).then(function (resp) {
               return resp || fetch(event.request).then(function(response) {
                   //No Cache, so hitting network..
                   caches.open(cacheVersion).then(function (cache){
                       cache.put(event.request.clone(), response);
                   });
                   return response.clone();
               });
        }).catch(function(error) {
            //No cache no network 503 service unaivalable..
            var myBlob = new Blob();
            var init = { "status" : 503 , "statusText" : "Service Unaivailable!" };
            var myResponse = new Response(myBlob,init);
            return myResponse
        })
    );
});
