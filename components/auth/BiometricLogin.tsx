'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Fingerprint, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  checkBiometricAvailable,
  hasStoredCredential,
  getStoredEmail,
  authenticateWithBiometric,
  clearStoredCredential,
} from '@/lib/webauthn'

type BiometricLoginProps = {
  onUsePassword: () => void
}

export function BiometricLogin({ onUsePassword }: BiometricLoginProps) {
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState(false)
  const [hasCredential, setHasCredential] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasAutoTriggered = useRef(false)

  const handleBiometricLogin = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await authenticateWithBiometric()

    if (result.success) {
      router.push('/home')
      router.refresh()
    } else {
      setError(result.error || 'Authentication failed')
      setIsLoading(false)

      // If credential is invalid, clear it
      if (result.error?.includes('not found')) {
        clearStoredCredential()
        setHasCredential(false)
      }
    }
  }, [router])

  useEffect(() => {
    const init = async () => {
      const available = await checkBiometricAvailable()
      const stored = hasStoredCredential()
      const storedEmail = getStoredEmail()

      setIsAvailable(available)
      setHasCredential(stored)
      setEmail(storedEmail)

      // Auto-trigger Face ID on mount (once only)
      if (available && stored && !hasAutoTriggered.current) {
        hasAutoTriggered.current = true
        handleBiometricLogin()
      }
    }

    init()
  }, [handleBiometricLogin])

  // Show nothing if biometric not available or no stored credential
  if (!isAvailable || !hasCredential) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* User info */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Fingerprint className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
        {email && (
          <p className="text-zinc-400 text-sm">{email}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Face ID button */}
      <button
        onClick={handleBiometricLogin}
        disabled={isLoading}
        className="w-full py-4 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <Fingerprint className="w-6 h-6" />
            Use Face ID
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-zinc-500">or</span>
        </div>
      </div>

      {/* Password fallback */}
      <button
        onClick={onUsePassword}
        className="w-full py-3 px-4 rounded-xl bg-white/5 text-zinc-400 font-medium hover:bg-white/10 hover:text-white transition-colors"
      >
        Use password instead
      </button>
    </div>
  )
}
