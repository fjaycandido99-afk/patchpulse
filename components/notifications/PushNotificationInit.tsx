'use client'

import { useEffect, useRef } from 'react'

// Check if running in native app
function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

/**
 * Initializes push notification listeners on native platforms.
 * This component should be mounted once in the app layout.
 * It only sets up listeners - it doesn't request permissions or register.
 */
export function PushNotificationInit() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !isNativePlatform()) return
    initialized.current = true

    const initPush = async () => {
      try {
        // Dynamic import to avoid loading on web
        const { setupPushListeners } = await import('@/lib/capacitor/push-notifications')
        await setupPushListeners()
        console.log('[PushNotificationInit] Native push listeners initialized')
      } catch (error) {
        console.error('[PushNotificationInit] Failed to initialize:', error)
      }
    }

    initPush()
  }, [])

  // This component renders nothing - it's just for initialization
  return null
}
