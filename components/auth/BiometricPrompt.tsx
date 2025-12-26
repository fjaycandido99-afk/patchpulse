'use client'

import { useState, useEffect } from 'react'
import { Fingerprint, X, Loader2, Check } from 'lucide-react'
import { checkBiometricAvailable, registerBiometric } from '@/lib/webauthn'

type BiometricPromptProps = {
  onComplete: () => void
  onSkip: () => void
}

export function BiometricPrompt({ onComplete, onSkip }: BiometricPromptProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkBiometricAvailable().then(setIsAvailable)
  }, [])

  const handleEnable = async () => {
    setIsLoading(true)
    setError(null)

    const result = await registerBiometric()

    if (result.success) {
      setIsSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 1500)
    } else {
      setError(result.error || 'Failed to enable Face ID')
      setIsLoading(false)
    }
  }

  // Don't show if biometric not available
  if (!isAvailable) {
    onSkip()
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm bg-zinc-900 rounded-2xl border border-white/10 p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${isSuccess ? 'bg-green-500/20' : 'bg-primary/20'}`}>
            {isSuccess ? (
              <Check className="w-12 h-12 text-green-500" />
            ) : (
              <Fingerprint className="w-12 h-12 text-primary" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">
            {isSuccess ? 'Face ID Enabled!' : 'Enable Face ID?'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {isSuccess
              ? 'You can now use Face ID to quickly log in.'
              : 'Use Face ID for faster, more secure logins on this device.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Actions */}
        {!isSuccess && (
          <div className="space-y-3">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Enable Face ID
                </>
              )}
            </button>

            <button
              onClick={onSkip}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 text-zinc-400 font-medium hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
