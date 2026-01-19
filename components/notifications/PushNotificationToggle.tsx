'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2, Smartphone, Globe } from 'lucide-react'

type PushStatus = 'loading' | 'enabled' | 'disabled' | 'denied' | 'unsupported'
type PushMode = 'native' | 'web' | 'unknown'

export function PushNotificationToggle() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [isToggling, setIsToggling] = useState(false)
  const [mode, setMode] = useState<PushMode>('unknown')

  useEffect(() => {
    let mounted = true

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (mounted && status === 'loading') {
        console.log('[PushToggle] Timed out, showing toggle')
        setStatus('disabled')
      }
    }, 5000)

    const checkStatus = async () => {
      // Wait a bit for environment to settle
      await new Promise(resolve => setTimeout(resolve, 300))
      if (!mounted) return

      // Try to detect and check native push first
      try {
        const { isNative, isNativePushEnabled } = await import('@/lib/capacitor/push-notifications')

        if (isNative()) {
          console.log('[PushToggle] Native platform detected')
          setMode('native')

          const enabled = await isNativePushEnabled()
          console.log('[PushToggle] Native push enabled:', enabled)
          if (mounted) setStatus(enabled ? 'enabled' : 'disabled')
          return
        }
      } catch (err) {
        console.log('[PushToggle] Native check failed:', err)
      }

      // Fall back to web push
      console.log('[PushToggle] Using web push')
      setMode('web')

      if (typeof window === 'undefined') {
        setStatus('unsupported')
        return
      }

      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setStatus('unsupported')
        return
      }

      if (Notification.permission === 'denied') {
        setStatus('denied')
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (mounted) setStatus(subscription ? 'enabled' : 'disabled')
      } catch {
        if (mounted) setStatus('disabled')
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
      if (mode === 'native') {
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
              Permission denied. Enable in {mode === 'native' ? 'Settings > PatchPulse > Notifications' : 'browser settings'}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const enabledClass = status === 'enabled' ? 'bg-primary/10' : 'bg-zinc-500/10'
  const toggleBgClass = status === 'enabled' ? 'bg-primary' : 'bg-zinc-700'
  const togglePosClass = status === 'enabled' ? 'translate-x-5' : 'translate-x-0'

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
              {mode === 'native' ? (
                <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {status === 'enabled'
                ? `Receiving ${mode} notifications`
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
