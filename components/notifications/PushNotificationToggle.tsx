'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2, Smartphone, Globe } from 'lucide-react'
import { Capacitor } from '@capacitor/core'

// Check if running in native app
function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

type PushStatus = 'loading' | 'enabled' | 'disabled' | 'denied' | 'unsupported'

export function PushNotificationToggle() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [isToggling, setIsToggling] = useState(false)
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    let mounted = true

    // Timeout fallback - if check takes too long, default to disabled
    const timeout = setTimeout(() => {
      if (mounted && status === 'loading') {
        console.log('[PushToggle] Status check timed out, defaulting to disabled')
        setStatus('disabled')
      }
    }, 8000)

    const checkStatus = async () => {
      const native = isNativePlatform()
      console.log('[PushToggle] isNativePlatform:', native)
      if (!mounted) return
      setIsNative(native)

      if (native) {
        // Check native push status
        try {
          console.log('[PushToggle] Checking native push status...')
          const { isNativePushEnabled } = await import('@/lib/capacitor/push-notifications')
          const enabled = await isNativePushEnabled()
          console.log('[PushToggle] Native push enabled:', enabled)
          setStatus(enabled ? 'enabled' : 'disabled')
        } catch (err) {
          console.error('[PushToggle] Native push check error:', err)
          setStatus('disabled') // Default to disabled instead of unsupported so user can try
        }
      } else {
        // Check web push status
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          setStatus('unsupported')
          return
        }

        if (Notification.permission === 'denied') {
          setStatus('denied')
          return
        }

        // Check if we have an active subscription
        try {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.getSubscription()
          setStatus(subscription ? 'enabled' : 'disabled')
        } catch {
          setStatus('disabled')
        }
      }
    }

    checkStatus()

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [])

  const handleToggle = async () => {
    if (isToggling || status === 'denied' || status === 'unsupported') return

    setIsToggling(true)

    try {
      if (isNative) {
        // Toggle native push
        if (status === 'enabled') {
          const { unregisterNativePush } = await import('@/lib/capacitor/push-notifications')
          await unregisterNativePush()
          setStatus('disabled')
        } else {
          const { registerNativePush } = await import('@/lib/capacitor/push-notifications')
          const result = await registerNativePush()
          if (result.success) {
            setStatus('enabled')
          } else if (result.error?.toLowerCase().includes('denied')) {
            setStatus('denied')
          } else if (result.error?.toLowerCase().includes('timeout')) {
            // Timeout usually means push notifications aren't properly configured
            // or the app needs push notification entitlements
            console.error('Push registration timeout:', result.error)
            alert('Push notification setup timed out. Please check that notifications are enabled in iOS Settings > PatchPulse.')
            setStatus('disabled')
          } else {
            console.error('Push registration failed:', result.error)
            setStatus('disabled')
          }
        }
      } else {
        // Toggle web push
        if (status === 'enabled') {
          const { unregisterPushNotifications } = await import('@/lib/push-notifications')
          await unregisterPushNotifications()
          setStatus('disabled')
        } else {
          // Request permission first
          const permission = await Notification.requestPermission()
          if (permission === 'denied') {
            setStatus('denied')
            return
          }

          const { registerPushNotifications } = await import('@/lib/push-notifications')
          const subscription = await registerPushNotifications()
          setStatus(subscription ? 'enabled' : 'disabled')
        }
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error)
    } finally {
      setIsToggling(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="rounded-xl border border-white/10 bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">Checking status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unsupported') {
    return (
      <div className="rounded-xl border border-white/10 bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-500/10">
            <BellOff className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Not supported on this device
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="rounded-xl border border-white/10 bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <BellOff className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Permission denied. Enable in {isNative ? 'Settings > PatchPulse > Notifications' : 'browser settings'}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const enabledClass = status === 'enabled' ? 'bg-primary/10' : 'bg-zinc-500/10'
  const toggleBgClass = status === 'enabled' ? 'bg-primary' : 'bg-zinc-700'
  const togglePosClass = status === 'enabled' ? 'translate-x-5' : 'translate-x-0'
  const notifTypeText = isNative ? 'native' : 'browser'

  return (
    <div className="rounded-xl border border-white/10 bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${enabledClass}`}>
            {status === 'enabled' ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-zinc-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">Push Notifications</p>
              {isNative ? (
                <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {status === 'enabled'
                ? `Receiving ${notifTypeText} notifications`
                : 'Get notified about patches and updates'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`relative h-7 w-12 rounded-full transition-colors ${toggleBgClass} ${isToggling ? 'opacity-50' : ''}`}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${togglePosClass}`}
          />
          {isToggling && (
            <Loader2 className="absolute inset-0 m-auto w-4 h-4 animate-spin text-white" />
          )}
        </button>
      </div>
    </div>
  )
}
