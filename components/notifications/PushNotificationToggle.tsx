'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useOneSignal } from './OneSignalInit'

type PushStatus = 'loading' | 'enabled' | 'disabled' | 'denied' | 'unsupported'

export function PushNotificationToggle() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [isToggling, setIsToggling] = useState(false)
  const { requestPermission, optIn, optOut, isSubscribed } = useOneSignal()

  useEffect(() => {
    // Check initial status after a short delay for OneSignal to initialize
    const checkStatus = () => {
      if (typeof window === 'undefined') {
        setStatus('unsupported')
        return
      }

      // Check if OneSignal is available
      if (!window.OneSignal) {
        // OneSignal not loaded yet, check if notifications are supported
        if (!('Notification' in window)) {
          setStatus('unsupported')
          return
        }

        if (Notification.permission === 'denied') {
          setStatus('denied')
          return
        }

        setStatus('disabled')
        return
      }

      // Check OneSignal subscription status
      const subscribed = isSubscribed()
      setStatus(subscribed ? 'enabled' : 'disabled')
    }

    // Wait for OneSignal to initialize
    const timeout = setTimeout(checkStatus, 1500)

    // Also check when OneSignal becomes available
    const interval = setInterval(() => {
      if (window.OneSignal) {
        checkStatus()
        clearInterval(interval)
      }
    }, 500)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [isSubscribed])

  const handleToggle = async () => {
    if (isToggling || status === 'denied' || status === 'unsupported') return

    setIsToggling(true)

    try {
      if (status === 'enabled') {
        // Disable push
        const success = await optOut()
        if (success) {
          setStatus('disabled')
        }
      } else {
        // Enable push - request permission first
        const granted = await requestPermission()
        if (granted) {
          await optIn()
          setStatus('enabled')
        } else {
          // Check if denied
          if (Notification.permission === 'denied') {
            setStatus('denied')
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle push:', error)
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
              Permission denied. Enable in browser/device settings.
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
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              {status === 'enabled'
                ? 'Receiving push notifications'
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
