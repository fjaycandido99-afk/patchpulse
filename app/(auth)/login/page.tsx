'use client'

import { useState, useEffect } from 'react'
import { signInWithEmail } from '../actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BiometricLogin } from '@/components/auth/BiometricLogin'
import { BiometricPrompt } from '@/components/auth/BiometricPrompt'
import { hasStoredCredential, checkBiometricAvailable } from '@/lib/webauthn'

type LoginMode = 'biometric' | 'password'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<LoginMode>('password')
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false)
  const [checkingBiometric, setCheckingBiometric] = useState(true)

  // Check for stored biometric credential on mount
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await checkBiometricAvailable()
      const hasCredential = hasStoredCredential()

      if (available && hasCredential) {
        setMode('biometric')
      }
      setCheckingBiometric(false)
    }

    checkBiometric()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signInWithEmail(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Login successful - check if we should prompt for biometric setup
      const available = await checkBiometricAvailable()
      const hasCredential = hasStoredCredential()

      if (available && !hasCredential) {
        // Show prompt to enable Face ID
        setShowBiometricPrompt(true)
      } else {
        // Go directly to home
        router.push('/home')
        router.refresh()
      }
    }
  }

  const handleBiometricPromptComplete = () => {
    setShowBiometricPrompt(false)
    router.push('/home')
    router.refresh()
  }

  const handleBiometricPromptSkip = () => {
    setShowBiometricPrompt(false)
    router.push('/home')
    router.refresh()
  }

  const handleUsePassword = () => {
    setMode('password')
  }

  // Show loading while checking biometric availability
  if (checkingBiometric) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show biometric prompt after successful password login
  if (showBiometricPrompt) {
    return (
      <BiometricPrompt
        onComplete={handleBiometricPromptComplete}
        onSkip={handleBiometricPromptSkip}
      />
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {mode === 'biometric' ? (
          <BiometricLogin onUsePassword={handleUsePassword} />
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your PatchPulse account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
