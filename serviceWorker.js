// 推しウマ記録アプリ - Service Worker

const CACHE_NAME = 'oshiuma-tracker-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './detail.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Service Worker インストール時
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Caching files');
                return cache.addAll(URLS_TO_CACHE);
            })
            .then(function() {
                console.log('Service Worker: Installed successfully');
                // 新しいService Workerを即座にアクティブにする
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('Service Worker: Install failed', error);
            })
    );
});

// Service Worker アクティベート時
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        // 古いキャッシュを削除
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                console.log('Service Worker: Activated successfully');
                // 既存のクライアントを即座に制御下に置く
                return self.clients.claim();
            })
            .catch(function(error) {
                console.error('Service Worker: Activation failed', error);
            })
    );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', function(event) {
    // HTTPSまたはlocalhostのリクエストのみ処理
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    // キャッシュにある場合はそれを返す
                    if (response) {
                        return response;
                    }
                    
                    // キャッシュにない場合はネットワークから取得
                    return fetch(event.request)
                        .then(function(response) {
                            // レスポンスが無効な場合はそのまま返す
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            
                            // レスポンスをクローンしてキャッシュに保存
                            const responseToCache = response.clone();
                            
                            caches.open(CACHE_NAME)
                                .then(function(cache) {
                                    // HTMLファイルのみキャッシュに追加
                                    if (event.request.url.includes('.html') || 
                                        event.request.url.includes('.css') || 
                                        event.request.url.includes('.js')) {
                                        cache.put(event.request, responseToCache);
                                    }
                                });
                            
                            return response;
                        })
                        .catch(function(error) {
                            console.error('Service Worker: Fetch failed', error);
                            
                            // オフライン時の代替ページ
                            if (event.request.mode === 'navigate') {
                                return caches.match('./index.html');
                            }
                            
                            throw error;
                        });
                })
        );
    }
});

// プッシュ通知の処理（将来の拡張用）
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || '推しウマ記録アプリからの通知です',
            icon: './images/icon-192.png',
            badge: './images/icon-192.png',
            tag: 'oshiuma-notification',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: '開く'
                },
                {
                    action: 'close',
                    title: '閉じる'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || '推しウマ記録', options)
        );
    }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(function(clientList) {
                    // 既にアプリが開かれている場合はそのタブにフォーカス
                    for (let i = 0; i < clientList.length; i++) {
                        const client = clientList[i];
                        if (client.url.includes('oshiuma-tracker') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // アプリが開かれていない場合は新しいタブで開く
                    if (clients.openWindow) {
                        return clients.openWindow('./');
                    }
                })
        );
    }
});

// バックグラウンド同期の処理（将来の拡張用）
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        
        event.waitUntil(
            // バックグラウンドでのデータ同期処理
            doBackgroundSync()
        );
    }
});

// バックグラウンド同期の実装（将来の拡張用）
function doBackgroundSync() {
    return new Promise(function(resolve) {
        // 現在はローカルストレージのみなので何もしない
        console.log('Service Worker: Background sync completed');
        resolve();
    });
}

// アプリケーション更新の通知
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// キャッシュ容量の管理
self.addEventListener('storage', function(event) {
    // ストレージ使用量が多い場合の警告（将来の拡張用）
    if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate()
            .then(function(estimate) {
                const usagePercentage = (estimate.usage / estimate.quota) * 100;
                if (usagePercentage > 80) {
                    console.warn('Service Worker: Storage usage is high:', usagePercentage + '%');
                }
            });
    }
});

// エラーハンドリング
self.addEventListener('error', function(event) {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Script loaded successfully');