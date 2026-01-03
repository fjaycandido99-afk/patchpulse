'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGuest } from './GuestProvider'
import { Lock, UserPlus, LogIn } from 'lucide-react'

type GuestGuardProps = {
  children: ReactNode
  feature: string
  description?: string
}

// Wraps a feature and shows a sign-up prompt for guests
export function GuestGuard({ children, feature, description }: GuestGuardProps) {
  const { isGuest } = useGuest()

  if (!isGuest) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">Sign up to {feature}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description || `Create a free account to ${feature.toLowerCase()} and unlock more features.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-[0.98]"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Link>
      </div>
    </div>
  )
}

type GuestBlockProps = {
  feature: string
  className?: string
}

// Shows inline prompt when guests try to interact with a feature
export function GuestBlock({ feature, className = '' }: GuestBlockProps) {
  const { isGuest } = useGuest()

  if (!isGuest) return null

  return (
    <div className={`rounded-lg border border-border bg-card/50 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1">Create an account to {feature}</p>
          <p className="text-xs text-muted-foreground mb-3">Free accounts can {feature.toLowerCase()} and more.</p>
          <div className="flex gap-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-3 h-3" />
              Sign Up
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

type GuestButtonBlockerProps = {
  children: ReactNode
  feature: string
  onClick?: () => void
}

// For buttons - shows a tooltip/prompt when clicked by guest
export function GuestButtonBlocker({ children, feature, onClick }: GuestButtonBlockerProps) {
  const router = useRouter()
  const { isGuest } = useGuest()

  if (!isGuest) {
    return <span onClick={onClick}>{children}</span>
  }

  return (
    <span
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push('/signup')
      }}
      className="inline-block cursor-pointer"
      title={`Sign up to ${feature}`}
    >
      {children}
    </span>
  )
}
