'use client'

import { useState, useEffect } from 'react'
import { signInWithEmail } from '../actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BiometricLogin } from '@/components/auth/BiometricLogin'
import { BiometricPrompt } from '@/components/auth/BiometricPrompt'
import { hasStoredCredential, checkBiometricAvailable } from '@/lib/biometric'
import { createClient } from '@/lib/supabase/client'
import { Gamepad2, ArrowRight, Zap, TrendingUp, Bell, Sparkles, User, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { enableGuestMode, disableGuestMode } from '@/lib/guest'

const HAS_VISITED_KEY = 'patchpulse-has-visited'

type LoginMode = 'biometric' | 'password'
type PageMode = 'landing' | 'login'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState<LoginMode>('password')
  const [pageMode, setPageMode] = useState<PageMode | null>(null)
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false)
  const [checkingState, setCheckingState] = useState(true)

  // Check session and auto-login on mount
  useEffect(() => {
    const checkState = async () => {
      try {
        const supabase = createClient()

        // First, check if there's already a valid session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          router.push('/home')
          router.refresh()
          return
        }

        // On native, try to restore from stored session
        const storedSession = localStorage.getItem('patchpulse-auth')
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession)
            if (parsed?.refresh_token) {
              const { data, error } = await supabase.auth.refreshSession({
                refresh_token: parsed.refresh_token,
              })
              if (data?.session && !error) {
                router.push('/home')
                router.refresh()
                return
              }
            }
          } catch {
            // Invalid stored session
          }
        }

        // Try biometric stored credentials (no Face ID - like YouTube)
        const biometricData = localStorage.getItem('patchpulse-biometric')
        if (biometricData) {
          try {
            const parsed = JSON.parse(biometricData)
            if (parsed?.refreshToken) {
              const { data, error } = await supabase.auth.refreshSession({
                refresh_token: parsed.refreshToken,
              })
              if (data?.session && !error) {
                localStorage.setItem(HAS_VISITED_KEY, 'true')
                router.push('/home')
                router.refresh()
                return
              }
            }
          } catch {
            // Invalid biometric data
          }
        }

        // Check guest mode
        const isGuest = localStorage.getItem('patchpulse-guest') === 'true'
        if (isGuest) {
          router.push('/home')
          return
        }

        // Check if returning user
        const hasVisited = localStorage.getItem(HAS_VISITED_KEY) === 'true'
        const hasSessionData = Object.keys(localStorage).some(key =>
          key.includes('supabase') || key.includes('sb-')
        )
        const hasBiometricEmail = localStorage.getItem('patchpulse-biometric-email') !== null
        const hasCredential = hasStoredCredential()

        const isReturningUser = hasVisited || hasCredential || hasSessionData || hasBiometricEmail

        if (isReturningUser) {
          setPageMode('login')
          localStorage.setItem(HAS_VISITED_KEY, 'true')
        } else {
          setPageMode('landing')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        // On error, show login page
        setPageMode('login')
      } finally {
        setCheckingState(false)
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setCheckingState(false)
      setPageMode('login')
    }, 5000)

    checkState().finally(() => clearTimeout(timeout))
  }, [router])

  // Mark as visited when they proceed to login
  const markAsVisited = () => {
    localStorage.setItem(HAS_VISITED_KEY, 'true')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signInWithEmail(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Login successful
      disableGuestMode()
      markAsVisited()

      // Check if we should prompt for biometric setup
      const available = await checkBiometricAvailable()
      const hasCredential = hasStoredCredential()

      if (available && !hasCredential) {
        setShowBiometricPrompt(true)
      } else {
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
    setLoginMode('password')
  }

  const handleGetStarted = () => {
    markAsVisited()
    setPageMode('login')
  }

  const handleContinueAsGuest = () => {
    markAsVisited()
    enableGuestMode()
    router.push('/home')
  }

  // Show loading while checking state
  if (checkingState || pageMode === null) {
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

  // First-time visitor: Landing page
  if (pageMode === 'landing') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8 text-center">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>

          {/* Hero */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Your Gaming
              <br />
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Track patch notes, manage your backlog, and never miss an update for your favorite games.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Instant Alerts</h3>
              <p className="text-xs text-muted-foreground mt-1">Get notified when your games update</p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-sm">Stay Ahead</h3>
              <p className="text-xs text-muted-foreground mt-1">Know balance changes before matches</p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-sm">AI Summaries</h3>
              <p className="text-xs text-muted-foreground mt-1">TL;DR of what changed and why</p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-sm">Smart Backlog</h3>
              <p className="text-xs text-muted-foreground mt-1">Organize what to play next</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleGetStarted}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleContinueAsGuest}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
            >
              <User className="w-4 h-4" />
              Continue as Guest
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={handleGetStarted}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Returning user: Login page
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {loginMode === 'biometric' ? (
          <BiometricLogin onUsePassword={handleUsePassword} />
        ) : (
          <>
            <div className="text-center">
              {/* Logo/Brand */}
              <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-muted-foreground">
                Sign in to continue to PatchPulse
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
              >
                <User className="w-4 h-4" />
                Continue as Guest
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
