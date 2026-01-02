'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerPushNotifications,
  unregisterPushNotifications,
} from '@/lib/push-notifications'
import {
  isNative,
  registerNativePush,
  unregisterNativePush,
  isNativePushEnabled,
} from '@/lib/capacitor/push-notifications'

type Props = {
  className?: string
}

export function PushNotificationToggle({ className = '' }: Props) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | 'native'>('default')
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start with loading
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true)

      try {
        // Check if running on native platform
        if (isNative()) {
          setIsSupported(true)
          setPermission('native')

          try {
            const enabled = await isNativePushEnabled()
            setIsEnabled(enabled)
          } catch {
            setIsEnabled(false)
          }

          setIsLoading(false)
          return
        }
      } catch {
        // isNative() check failed, continue with web check
      }

      // Web push check
      const supported = isPushSupported()
      setIsSupported(supported)

      if (!supported) {
        setIsLoading(false)
        return
      }

      const perm = getNotificationPermission()
      setPermission(perm)

      // Check if there's an actual push subscription with timeout
      if (perm === 'granted' && 'serviceWorker' in navigator) {
        try {
          // Add 3 second timeout to prevent hanging
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )

          const registration = await Promise.race([
            navigator.serviceWorker.ready,
            timeoutPromise
          ]) as ServiceWorkerRegistration

          if (registration) {
            const subscription = await registration.pushManager.getSubscription()
            setIsEnabled(!!subscription)
          }
        } catch {
          setIsEnabled(false)
        }
      } else {
        setIsEnabled(false)
      }

      setIsLoading(false)
    }

    checkSubscription()
  }, [])

  const handleToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Native push (iOS/Android)
      if (isNative()) {
        if (isEnabled) {
          await unregisterNativePush()
          setIsEnabled(false)
        } else {
          const result = await registerNativePush()
          if (result.success) {
            setIsEnabled(true)
          } else {
            setError(result.error || 'Failed to enable notifications')
          }
        }
        setIsLoading(false)
        return
      }

      // Web push
      if (isEnabled) {
        await unregisterPushNotifications()
        setIsEnabled(false)
      } else {
        const perm = await requestNotificationPermission()
        setPermission(perm)

        if (perm === 'granted') {
          const subscription = await registerPushNotifications()
          setIsEnabled(!!subscription)
          if (!subscription) {
            setError('Failed to register for notifications')
          }
        } else if (perm === 'denied') {
          setError('Permission denied. Enable in settings.')
        }
      }
    } catch (err) {
      console.error('Error toggling push notifications:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show anything if not supported (after loading completes)
  if (!isLoading && !isSupported) {
    return null
  }

  if (permission === 'denied') {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
          <BellOff className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-300">Push Notifications Blocked</p>
          <p className="text-xs text-zinc-500">
            {isNative()
              ? 'Enable in Settings > PatchPulse > Notifications'
              : 'Enable in browser settings to receive notifications'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isEnabled ? 'bg-primary/20' : 'bg-zinc-700'
          }`}>
            <Bell className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-zinc-400'}`} />
          </div>
          <div>
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Checking...' : isEnabled ? 'Get notified even when away' : 'Stay updated on the go'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isLoading ? 'bg-zinc-600' : isEnabled ? 'bg-primary' : 'bg-zinc-600'
          }`}
          aria-label={isEnabled ? 'Disable push notifications' : 'Enable push notifications'}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          >
            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            )}
          </span>
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 px-4">{error}</p>
      )}
    </div>
  )
}
