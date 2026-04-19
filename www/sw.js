const CACHE_NAME = 'designer-tools-v9';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js?v=2024041917'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // 禁用缓存，始终从服务器获取最新文件
  event.respondWith(
    fetch(event.request).then(response => {
      // 缓存成功的响应
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // 网络失败时使用缓存
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
