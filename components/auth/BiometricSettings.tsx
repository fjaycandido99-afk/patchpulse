'use client'

import { useState, useEffect } from 'react'
import { Fingerprint, Loader2, Trash2, Check, AlertCircle } from 'lucide-react'
import {
  checkBiometricAvailable,
  registerBiometric,
  hasStoredCredential,
  clearStoredCredential,
} from '@/lib/webauthn'

type BiometricSettingsProps = {
  hasCredential: boolean
  lastUsedAt: string | null
  deviceName: string | null
}

export function BiometricSettings({
  hasCredential: initialHasCredential,
  lastUsedAt,
  deviceName,
}: BiometricSettingsProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [hasCredential, setHasCredential] = useState(initialHasCredential)
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkBiometricAvailable().then(setIsAvailable)
  }, [])

  const handleEnable = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const result = await registerBiometric()

    if (result.success) {
      setHasCredential(true)
      setSuccess('Face ID enabled successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to enable Face ID')
    }

    setIsLoading(false)
  }

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to disable Face ID login?')) {
      return
    }

    setIsRemoving(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/webauthn/remove', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to remove credential')
      }

      // Clear local storage
      clearStoredCredential()
      setHasCredential(false)
      setSuccess('Face ID disabled successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to disable Face ID')
    }

    setIsRemoving(false)
  }

  // Don't show if biometric is not available on this device
  if (!isAvailable) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Fingerprint className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Face ID / Touch ID</h3>
            <p className="text-sm text-muted-foreground">
              {hasCredential
                ? 'Enabled for quick login'
                : 'Use biometric authentication for faster logins'}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {hasCredential ? (
        <div className="space-y-3">
          {/* Credential info */}
          <div className="p-3 rounded-lg bg-white/5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device</span>
              <span>{deviceName || 'This device'}</span>
            </div>
            {lastUsedAt && (
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Last used</span>
                <span>{new Date(lastUsedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="w-full py-2.5 px-4 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRemoving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Disable Face ID
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={handleEnable}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4" />
              Enable Face ID
            </>
          )}
        </button>
      )}
    </div>
  )
}
