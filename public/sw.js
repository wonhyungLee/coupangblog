// Service Worker - PWA 기능
const CACHE_NAME = 'wongram-shop-v1.0.0';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/css/blog-style.css',
  '/css/review-style.css',
  '/js/main.js',
  '/js/tetris.js',
  '/game/tetris',
  '/reviews',
  '/images/default-review.svg',
  '/images/tetris-preview.svg',
  // 오프라인 페이지
  '/offline.html'
];

// SW 설치 이벤트
self.addEventListener('install', event => {
  console.log('Service Worker: Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Cached All Files');
        return self.skipWaiting();
      })
  );
});

// SW 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate Event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming Clients');
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트 - 네트워크 우선, 캐시 백업 전략
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 네트워크 응답이 성공하면 캐시에 저장
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 응답
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // 캐시에도 없으면 오프라인 페이지
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// 푸시 알림 이벤트
self.addEventListener('push', event => {
  console.log('Service Worker: Push Event');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WonGram Shop', options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification Click Event');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
  console.log('Service Worker: Background Sync');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 오프라인 중 저장된 데이터 동기화
      syncOfflineData()
    );
  }
});

// 오프라인 데이터 동기화 함수
async function syncOfflineData() {
  try {
    const cache = await caches.open('offline-data');
    const requests = await cache.keys();
    
    for (let request of requests) {
      if (request.url.includes('/api/offline/')) {
        const response = await cache.match(request);
        const data = await response.json();
        
        // 서버로 데이터 전송
        await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        // 동기화 완료 후 캐시에서 삭제
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
