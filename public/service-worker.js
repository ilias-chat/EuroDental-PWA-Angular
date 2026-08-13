importScripts('./ngsw-worker.js');

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'EuroDental', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'EuroDental';
  const options = {
    body: data.body || '',
    icon: '/icons/notification-icon-192.png',
    badge: '/icons/notification-icon-96.png',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow ? clients.openWindow(url) : undefined;
    })
  );
});
