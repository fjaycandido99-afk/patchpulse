/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

// Push notification types
interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  image?: string
  tag?: string
  priority?: number
  notificationId?: string
  type?: string
  gameId?: string
}

// Handle push events
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) {
    console.log('Push event with no data')
    return
  }

  try {
    const payload: PushPayload = event.data.json()

    // Use extended options with type assertion for browser-specific properties
    const options = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
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
    } as NotificationOptions

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    )
  } catch (error) {
    console.error('Error handling push event:', error)
  }
})

// Handle notification click
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const data = event.notification.data || {}
  const url = data.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          // Navigate to the notification URL
          if ('navigate' in client) {
            return (client as WindowClient).navigate(url)
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

  // Optionally mark notification as read
  if (data.notificationId) {
    fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.notificationId }),
    }).catch((err) => console.error('Failed to mark notification read:', err))
  }
})

// Handle notification close (user dismissed without clicking)
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  const data = event.notification.data || {}

  // Analytics or tracking could go here
  console.log('Notification closed:', data.type || 'unknown')
})

export {}
