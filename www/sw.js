const CACHE_NAME = 'designer-tools-v108';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js?v=106',
  '/js/tools-data.js?v=106'
];

self.addEventListener('install', event => {
  // 新 SW 安装时立即激活，不需要等所有标签页关闭
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // 优先网络，失败时降级到缓存（保证离线可用）
  event.respondWith(
    fetch(event.request).then(response => {
      // 网络成功时同步缓存（保持最新）
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // 网络失败时使用缓存兜底
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  // 激活后立即接管所有客户端，无需刷新
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      }),
      self.clients.claim()
    ])
  );
});
