'use client'

import { useState, useEffect } from 'react'
import { BiometricSettings } from '@/components/auth/BiometricSettings'

type SecuritySectionProps = {
  hasCredential: boolean
  lastUsedAt: string | null
  deviceName: string | null
}

export function SecuritySection({ hasCredential, lastUsedAt, deviceName }: SecuritySectionProps) {
  const [isNativeIOS, setIsNativeIOS] = useState<boolean | null>(null)

  useEffect(() => {
    const native = !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor?.isNativePlatform?.()
    const platform = (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.()
    setIsNativeIOS(native && platform === 'ios')
  }, [])

  // Don't render anything on native iOS
  if (isNativeIOS === null) {
    return null // Loading state
  }

  if (isNativeIOS) {
    return null
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Security</h2>
      <BiometricSettings
        hasCredential={hasCredential}
        lastUsedAt={lastUsedAt}
        deviceName={deviceName}
      />
    </section>
  )
}
