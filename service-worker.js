const CACHE_NAME = 'car-insurance-estimate-app-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  // 必要に応じて、追加でキャッシュしたいアセット（画像など）があればここに追加
  // 例: 'https://placehold.co/192x192/CC0022/ffffff?text=🚗',
  // 'https://placehold.co/512x512/CC0022/ffffff?text=🚗'
];

// インストールイベント: アプリケーションシェルをキャッシュする
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to open cache or add URLs:', error);
      })
  );
});

// アクティベートイベント: 古いキャッシュをクリアする
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチイベント: キャッシュからリソースを提供し、必要に応じてネットワークから取得する
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにリソースがあればそれを使用
        if (response) {
          return response;
        }
        // キャッシュになければネットワークから取得
        return fetch(event.request).then(
          (response) => {
            // レスポンスが不正な場合（例: 404、ネットワークエラー）はキャッシュしない
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(error => {
          console.error('Fetch failed:', error);
          // オフライン時にフォールバックページを表示する場合
          // return caches.match('/offline.html'); // 必要に応じてオフラインページを作成
        });
      })
  );
});
