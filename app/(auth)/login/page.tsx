'use client'

import { useState, useEffect } from 'react'
import { signInWithEmail } from '../actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BiometricLogin } from '@/components/auth/BiometricLogin'
import { BiometricPrompt } from '@/components/auth/BiometricPrompt'
import { hasStoredCredential, checkBiometricAvailable } from '@/lib/webauthn'
import { Gamepad2, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react'

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
    <div className="flex min-h-screen">
      {/* Left side - Features showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, gamer
            </h2>
            <p className="text-muted-foreground text-lg">
              Your games have been busy. Let&apos;s see what&apos;s new.
            </p>
          </div>

          {/* Stats/Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">Stay Ahead</h3>
                <p className="text-sm text-muted-foreground">Know about balance changes before your next match</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Catch-up</h3>
                <p className="text-sm text-muted-foreground">AI summaries of what changed and why it matters</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold">Your Library</h3>
                <p className="text-sm text-muted-foreground">All your followed games in one place</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {mode === 'biometric' ? (
            <BiometricLogin onUsePassword={handleUsePassword} />
          ) : (
            <>
              <div className="text-center">
                {/* Logo/Brand */}
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
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
                      className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                      className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
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
    </div>
  )
}
