'use client'

import { useState } from 'react'
import { signUpWithEmail } from '../actions'
import Link from 'next/link'
import { Mail, Check, ArrowRight, Gamepad2, Zap, Bell } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signUpWithEmail(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.emailConfirmationRequired) {
      setSentToEmail(result.email || email)
      setEmailSent(true)
      setLoading(false)
    }
  }

  // Email confirmation sent screen
  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Animated mail icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
              <Mail className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground">
              We sent a verification link to
            </p>
            <p className="font-medium text-foreground">{sentToEmail}</p>
          </div>

          {/* Next steps */}
          <div className="bg-card/50 border border-border rounded-xl p-4 text-left space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Next steps:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-sm">Open the email and click the verification link</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-sm">Choose your favorite games to follow</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-sm">Get notified about patches and updates</p>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or
            </p>
            <button
              onClick={() => {
                setEmailSent(false)
                setEmail('')
                setPassword('')
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              try a different email
            </button>
          </div>

          <div className="pt-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Already verified?{' '}
              <span className="font-medium text-primary">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Features showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-cyan-500/5 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Never miss a patch again
            </h2>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest changes to your favorite games.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Track Your Games</h3>
                <p className="text-sm text-muted-foreground">Follow games and get personalized patch notes</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">AI-Powered Summaries</h3>
                <p className="text-sm text-muted-foreground">Get the important changes highlighted for you</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Notifications</h3>
                <p className="text-sm text-muted-foreground">Know when major updates drop for your games</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started with PatchPulse
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
                  minLength={6}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
