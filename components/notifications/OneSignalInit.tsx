'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: OneSignalType) => void>
    OneSignal?: OneSignalType
  }
}

type OneSignalType = {
  init: (config: Record<string, unknown>) => Promise<void>
  login: (externalId: string) => Promise<void>
  logout: () => Promise<void>
  User: {
    PushSubscription: {
      optIn: () => Promise<void>
      optOut: () => Promise<void>
    }
  }
  Notifications: {
    permission: boolean
    permissionNative: 'default' | 'granted' | 'denied'
    requestPermission: () => Promise<void>
  }
}

type Props = {
  userId?: string
}

export function OneSignalInit({ userId }: Props) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  const [isIOSNative, setIsIOSNative] = useState(false)

  useEffect(() => {
    // Check if iOS native app (WKWebView - has iPhone/iPad but no Safari/)
    const isNative = typeof window !== 'undefined' &&
      /iPhone|iPad/.test(navigator.userAgent) &&
      !navigator.userAgent.includes('Safari/')
    setIsIOSNative(isNative)

    if (!appId) {
      console.log('[OneSignal] No app ID configured')
      return
    }

    // Skip OneSignal on native iOS apps - they handle push natively
    if (isNative) {
      console.log('[OneSignal] Skipping on native iOS app')
      return
    }

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
        notifyButton: {
          enable: false, // We have our own UI
        },
        welcomeNotification: {
          disable: true,
        },
      })

      console.log('[OneSignal] Initialized')

      // If user is logged in, associate their ID with OneSignal
      if (userId && userId !== 'guest') {
        try {
          await OneSignal.login(userId)
          console.log('[OneSignal] User logged in:', userId)
        } catch (err) {
          console.error('[OneSignal] Login error:', err)
        }
      }
    })
  }, [appId, userId])

  // Don't load OneSignal SDK on native iOS apps or if no app ID
  if (!appId || isIOSNative) return null

  return (
    <Script
      src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
      strategy="lazyOnload"
    />
  )
}

// Hook to use OneSignal
export function useOneSignal() {
  const requestPermission = async () => {
    if (!window.OneSignal) {
      console.error('[OneSignal] Not initialized')
      return false
    }

    try {
      await window.OneSignal.Notifications.requestPermission()
      return window.OneSignal.Notifications.permission
    } catch (err) {
      console.error('[OneSignal] Permission request failed:', err)
      return false
    }
  }

  const optIn = async () => {
    if (!window.OneSignal) return false
    try {
      await window.OneSignal.User.PushSubscription.optIn()
      return true
    } catch (err) {
      console.error('[OneSignal] Opt-in failed:', err)
      return false
    }
  }

  const optOut = async () => {
    if (!window.OneSignal) return false
    try {
      await window.OneSignal.User.PushSubscription.optOut()
      return true
    } catch (err) {
      console.error('[OneSignal] Opt-out failed:', err)
      return false
    }
  }

  const isSubscribed = () => {
    return window.OneSignal?.Notifications.permission ?? false
  }

  return {
    requestPermission,
    optIn,
    optOut,
    isSubscribed,
  }
}
