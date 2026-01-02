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

type Props = {
  className?: string
}

export function PushNotificationToggle({ className = '' }: Props) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      const supported = isPushSupported()
      setIsSupported(supported)

      if (supported) {
        const perm = getNotificationPermission()
        setPermission(perm)

        // Check if there's an actual push subscription
        if (perm === 'granted' && 'serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsEnabled(!!subscription)
          } catch {
            setIsEnabled(false)
          }
        } else {
          setIsEnabled(false)
        }
      }
    }

    checkSubscription()
  }, [])

  const handleToggle = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      if (isEnabled) {
        // Disable push notifications
        await unregisterPushNotifications()
        setIsEnabled(false)
      } else {
        // Request permission and enable
        const perm = await requestNotificationPermission()
        setPermission(perm)

        if (perm === 'granted') {
          const subscription = await registerPushNotifications()
          setIsEnabled(!!subscription)
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
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
            Enable in browser settings to receive notifications
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-xl bg-zinc-800/50 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isEnabled ? 'bg-primary/20' : 'bg-zinc-700'
        }`}>
          <Bell className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-zinc-400'}`} />
        </div>
        <div>
          <p className="text-sm font-medium">Push Notifications</p>
          <p className="text-xs text-muted-foreground">
            {isEnabled ? 'Get notified even when away' : 'Stay updated on the go'}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          isEnabled ? 'bg-primary' : 'bg-zinc-600'
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
  )
}
