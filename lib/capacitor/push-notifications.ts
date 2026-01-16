'use client'

import { Capacitor } from '@capacitor/core'

// Check if running in Capacitor (native iOS/Android)
export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

// Check platform
export function getPlatform(): 'ios' | 'android' | 'web' {
  const platform = Capacitor.getPlatform()
  if (platform === 'ios') return 'ios'
  if (platform === 'android') return 'android'
  return 'web'
}

// Dynamic import to avoid loading on web
async function getPushNotifications() {
  if (!isNative()) {
    throw new Error('Native push notifications only available on native platforms')
  }
  const { PushNotifications } = await import('@capacitor/push-notifications')
  return PushNotifications
}

/**
 * Request permission for push notifications
 */
export async function requestNativePushPermission(): Promise<boolean> {
  if (!isNative()) return false

  try {
    const PushNotifications = await getPushNotifications()

    // Check current permission status
    const permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      // Request permission
      const result = await PushNotifications.requestPermissions()
      return result.receive === 'granted'
    }

    return permStatus.receive === 'granted'
  } catch (error) {
    console.error('Failed to request push permission:', error)
    return false
  }
}

/**
 * Register for push notifications and get device token
 */
export async function registerNativePush(): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  if (!isNative()) {
    return { success: false, error: 'Not available on web' }
  }

  try {
    const PushNotifications = await getPushNotifications()

    // Request permission first
    console.log('[Push] Requesting permission...')
    const hasPermission = await requestNativePushPermission()
    if (!hasPermission) {
      console.log('[Push] Permission denied')
      return { success: false, error: 'Permission denied' }
    }
    console.log('[Push] Permission granted, registering with APNs...')

    // Register with APNs/FCM
    await PushNotifications.register()
    console.log('[Push] Register called, waiting for token...')

    // Wait for registration event
    return new Promise((resolve) => {
      let resolved = false

      // Success - got token
      PushNotifications.addListener('registration', async (token) => {
        if (resolved) return
        resolved = true
        console.log('[Push] Got token:', token.value?.substring(0, 20) + '...')

        // Save token to backend
        try {
          await saveDeviceToken(token.value, getPlatform())
          console.log('[Push] Token saved to backend')
          resolve({ success: true, token: token.value })
        } catch (err) {
          console.error('[Push] Failed to save token:', err)
          resolve({ success: false, error: 'Failed to save token' })
        }
      })

      // Error
      PushNotifications.addListener('registrationError', (error) => {
        if (resolved) return
        resolved = true
        console.error('[Push] Registration error:', error)
        resolve({ success: false, error: error.error || 'Registration failed' })
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        if (resolved) return
        resolved = true
        console.error('[Push] Registration timed out after 10 seconds')
        resolve({ success: false, error: 'Registration timeout - check iOS Settings' })
      }, 10000)
    })
  } catch (error: any) {
    console.error('[Push] Native push registration failed:', error)
    return { success: false, error: error.message || 'Registration failed' }
  }
}

/**
 * Unregister from push notifications
 */
export async function unregisterNativePush(): Promise<boolean> {
  if (!isNative()) return false

  try {
    // Remove token from backend
    await deleteDeviceToken()

    // Note: There's no way to fully unregister from APNs/FCM
    // The best practice is just to remove the token from your server
    return true
  } catch (error) {
    console.error('Failed to unregister push:', error)
    return false
  }
}

/**
 * Set up push notification listeners
 * Call this on app startup
 */
export async function setupPushListeners(): Promise<void> {
  if (!isNative()) return

  try {
    const PushNotifications = await getPushNotifications()

    // Handle received notification (foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification)

      // You could show an in-app notification here
      // For now, the system will show it automatically
    })

    // Handle notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action:', action)

      const data = action.notification.data

      // Navigate to the relevant page
      if (data?.url) {
        window.location.href = data.url
      } else if (data?.gameId) {
        window.location.href = `/games/${data.gameId}`
      } else if (data?.patchId) {
        window.location.href = `/patches/${data.patchId}`
      }

      // Mark as read if we have notification ID
      if (data?.notificationId) {
        fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.notificationId }),
        }).catch(console.error)
      }
    })

    console.log('Push notification listeners set up')
  } catch (error) {
    console.error('Failed to set up push listeners:', error)
  }
}

/**
 * Check if push notifications are enabled
 */
export async function isNativePushEnabled(): Promise<boolean> {
  if (!isNative()) return false

  // Add timeout to prevent hanging forever
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), 5000) // 5 second timeout
  })

  const checkPromise = async (): Promise<boolean> => {
    try {
      const PushNotifications = await getPushNotifications()
      const permStatus = await PushNotifications.checkPermissions()

      if (permStatus.receive !== 'granted') return false

      // Also check if we have a token saved on backend
      const response = await fetch('/api/push/device/status')
      const data = await response.json()

      return data.enabled === true
    } catch (error) {
      console.error('Failed to check push status:', error)
      return false
    }
  }

  return Promise.race([checkPromise(), timeoutPromise])
}

/**
 * Save device token to backend
 */
async function saveDeviceToken(token: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
  const response = await fetch('/api/push/device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform }),
  })

  if (!response.ok) {
    throw new Error('Failed to save device token')
  }
}

/**
 * Delete device token from backend
 */
async function deleteDeviceToken(): Promise<void> {
  await fetch('/api/push/device', {
    method: 'DELETE',
  })
}
