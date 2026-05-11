// public/sw.js
// Service Worker for Push Notifications

const CACHE_NAME = 'stp-cache-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/logo.png',
  '/badge.png',
];

// Install event – cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event – clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event – network-first with offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Skip non-GET requests, API calls, etc.
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html')))
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Share Target Price', body: 'Stock market update' };
  }

  const options = {
    body: data.body || 'Check the latest stock analysis',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/badge.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ShareTargetPrice.in', options)
  );
});

// Notification click event – open URL or focus existing window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  const action = event.action;

  if (action === 'close') return;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});
