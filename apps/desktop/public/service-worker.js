const shellCacheName = 'allmytools-shell-v1';
const shellUrls = ['/', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(shellCacheName).then((cache) => cache.addAll(shellUrls)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('allmytools-') && key !== shellCacheName)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(shellCacheName).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ??
            (await caches.match('/')) ??
            caches.match('/offline.html'),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) {
        return cached;
      }

      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(shellCacheName);
        await cache.put(request, response.clone());
      }
      return response;
    }),
  );
});
