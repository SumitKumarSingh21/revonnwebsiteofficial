// Service Worker - lightweight, push-only. No navigation caching to avoid white-screen issues.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification event handler
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have a new notification!',
    icon: '/Revonn logo.ico',
    badge: '/Revonn logo.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      { action: 'explore', title: 'View' },
      { action: 'close', title: 'Close' }
    ]
  };

  try {
    if (event.data) {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'Revonn Notification';
      if (data.icon) options.icon = data.icon;
      if (data.badge) options.badge = data.badge;
      if (data.url) options.data.url = data.url;
    }
  } catch {}

  event.waitUntil(
    self.registration.showNotification(options.title || 'Revonn Notification', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(self.clients.openWindow(url));
});