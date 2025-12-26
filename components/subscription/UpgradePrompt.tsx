'use client'

import { useState } from 'react'
import { Crown, Sparkles, Bell, Brain, X, Loader2 } from 'lucide-react'

type UpgradePromptProps = {
  type: 'backlog' | 'favorites' | 'followed'
  currentCount: number
  maxCount: number
  onClose?: () => void
  onUpgrade?: () => void
}

const LIMIT_MESSAGES = {
  backlog: {
    title: "You're tracking 5 games",
    subtitle: 'Upgrade to Pro for unlimited backlog',
  },
  favorites: {
    title: "You've reached 5 favorites",
    subtitle: 'Upgrade to Pro to favorite more games',
  },
  followed: {
    title: "You're following 10 games",
    subtitle: 'Upgrade to Pro for unlimited follows',
  },
}

export function UpgradePrompt({
  type,
  currentCount,
  maxCount,
  onClose,
  onUpgrade,
}: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false)
  const message = LIMIT_MESSAGES[type]

  const handleUpgrade = async () => {
    setIsLoading(true)
    if (onUpgrade) {
      onUpgrade()
    } else {
      // Default: redirect to pricing page
      window.location.href = '/pricing'
    }
  }

  return (
    <div className="relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Crown className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{message.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{message.subtitle}</p>

          {/* Progress indicator */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: '100%' }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {currentCount}/{maxCount}
            </span>
          </div>

          {/* Pro features */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Unlimited games</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bell className="w-4 h-4 text-primary" />
              <span>Smart notifications</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="w-4 h-4 text-primary" />
              <span>AI summaries</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            Upgrade to Pro
          </button>

          <p className="mt-2 text-xs text-muted-foreground">
            Starting at $4.99/month
          </p>
        </div>
      </div>
    </div>
  )
}

// Inline upgrade hint (smaller, for use in lists)
export function UpgradeHint({
  type,
  currentCount,
  maxCount,
}: {
  type: 'backlog' | 'favorites' | 'followed'
  currentCount: number
  maxCount: number
}) {
  const remaining = maxCount - currentCount
  const isAtLimit = remaining <= 0
  const isNearLimit = remaining <= 2 && remaining > 0

  if (!isAtLimit && !isNearLimit) return null

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm ${
        isAtLimit
          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      <span>
        {isAtLimit
          ? `${type.charAt(0).toUpperCase() + type.slice(1)} limit reached`
          : `${remaining} ${type} slot${remaining === 1 ? '' : 's'} left`}
      </span>
      <a
        href="/pricing"
        className="font-medium text-primary hover:underline"
      >
        Upgrade
      </a>
    </div>
  )
}

// Usage bar for profile/settings
export function UsageBar({
  label,
  used,
  limit,
  showUpgrade = true,
}: {
  label: string
  used: number
  limit: number
  showUpgrade?: boolean
}) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
  const isNearLimit = !isUnlimited && percentage >= 80
  const isAtLimit = !isUnlimited && used >= limit

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={isAtLimit ? 'text-amber-400 font-medium' : 'text-foreground'}>
          {isUnlimited ? (
            <span className="text-primary">Unlimited</span>
          ) : (
            `${used} / ${limit}`
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit
                ? 'bg-amber-500'
                : isNearLimit
                  ? 'bg-amber-500/70'
                  : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {isAtLimit && showUpgrade && (
        <a
          href="/pricing"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Crown className="w-3 h-3" />
          Upgrade for unlimited
        </a>
      )}
    </div>
  )
}
