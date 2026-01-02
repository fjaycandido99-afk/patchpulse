'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'

type Props = {
  className?: string
}

export function PushNotificationToggle({ className = '' }: Props) {
  const [isSupported, setIsSupported] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      setIsSupported(false)
      return
    }

    setPermission(Notification.permission)
    setIsEnabled(Notification.permission === 'granted')
  }, [])

  const handleToggle = async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      if (isEnabled) {
        // Can't revoke permission, just disable locally
        setIsEnabled(false)
        // Could save preference to backend here
      } else {
        // Request permission
        const result = await Notification.requestPermission()
        setPermission(result)

        if (result === 'granted') {
          setIsEnabled(true)
          // Show test notification
          new Notification('PatchPulse', {
            body: 'Push notifications enabled!',
            icon: '/logo.png',
          })
        } else if (result === 'denied') {
          setError('Permission denied. Enable in browser/device settings.')
        }
      }
    } catch (err) {
      console.error('Error toggling notifications:', err)
      setError('Failed to enable notifications')
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
          <p className="text-sm font-medium text-zinc-300">Notifications Blocked</p>
          <p className="text-xs text-zinc-500">
            Enable in your browser or device settings
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
              {isEnabled ? 'You will receive notifications' : 'Get notified about patches and news'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors ${
            isEnabled ? 'bg-primary' : 'bg-zinc-600'
          }`}
          aria-label={isEnabled ? 'Disable notifications' : 'Enable notifications'}
        >
          <span
            className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
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
