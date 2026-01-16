// Push notification service worker
// This file handles push notifications separately from the PWA caching service worker

// Handle push events
self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event with no data')
    return
  }

  try {
    const payload = event.data.json()

    const options = {
      body: payload.body || '',
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: payload.tag || 'patchpulse-notification',
      data: {
        url: payload.url || '/',
        notificationId: payload.notificationId,
        type: payload.type,
        gameId: payload.gameId,
      },
      vibrate: payload.priority && payload.priority >= 8 ? [200, 100, 200] : [100],
      requireInteraction: !!(payload.priority && payload.priority >= 8),
      silent: false,
    }

    event.waitUntil(
      self.registration.showNotification(payload.title || 'PatchPulse', options)
    )
  } catch (error) {
    console.error('Error handling push event:', error)
  }
})

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const data = event.notification.data || {}
  const url = data.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i]
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          if ('navigate' in client) {
            return client.navigate(url)
          }
          return client
        }
      }
      // If no window/tab is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )

  // Mark notification as read
  if (data.notificationId) {
    fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.notificationId }),
    }).catch(function(err) {
      console.error('Failed to mark notification read:', err)
    })
  }
})

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  var data = event.notification.data || {}
  console.log('Notification closed:', data.type || 'unknown')
})
