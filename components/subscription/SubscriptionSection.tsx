'use client'

import { useState } from 'react'
import { Crown, Check, Loader2, RotateCcw, ExternalLink } from 'lucide-react'
import { UsageBar } from './UpgradePrompt'

type SubscriptionInfo = {
  plan: 'free' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'expired'
  provider: 'stripe' | 'apple' | 'google' | 'manual' | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  usage: {
    backlog: { used: number; limit: number }
    favorites: { used: number; limit: number }
    followed: { used: number; limit: number }
  }
  features: {
    notifications: boolean
    aiSummaries: boolean
  }
}

type Props = {
  subscription: SubscriptionInfo
}

export function SubscriptionSection({ subscription }: Props) {
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const isPro = subscription.plan === 'pro' && subscription.status === 'active'

  const handleRestorePurchases = async () => {
    setIsRestoring(true)
    setRestoreMessage(null)

    try {
      // This would be called from the iOS app with the receipt
      // For web, we just check the current subscription status
      const response = await fetch('/api/subscriptions/restore', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.restored) {
        setRestoreMessage({
          type: 'success',
          text: 'Purchases restored successfully!',
        })
        // Refresh the page to update subscription status
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setRestoreMessage({
          type: 'error',
          text: data.message || 'No purchases to restore',
        })
      }
    } catch {
      setRestoreMessage({
        type: 'error',
        text: 'Failed to restore purchases. Please try again.',
      })
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPro
                  ? 'bg-gradient-to-br from-primary to-violet-500'
                  : 'bg-muted'
              }`}
            >
              <Crown className={`w-6 h-6 ${isPro ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </h3>
              {isPro && subscription.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                    ? `Expires ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              )}
              {!isPro && (
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock all features
                </p>
              )}
            </div>
          </div>

          {!isPro && (
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Crown className="w-4 h-4" />
              Upgrade
            </a>
          )}
        </div>

        {/* Pro features */}
        {isPro && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Unlimited games</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Smart notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>AI summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        )}

        {/* Subscription management for Pro users */}
        {isPro && subscription.provider === 'stripe' && (
          <div className="mt-4 pt-4 border-t border-border">
            <a
              href="/api/subscriptions/portal"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Manage subscription
            </a>
          </div>
        )}
      </div>

      {/* Usage - Only show for Free users */}
      {!isPro && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
          <h3 className="font-semibold">Usage</h3>

          <UsageBar
            label="Backlog games"
            used={subscription.usage.backlog.used}
            limit={subscription.usage.backlog.limit}
            showUpgrade={true}
          />

          <UsageBar
            label="Favorite games"
            used={subscription.usage.favorites.used}
            limit={subscription.usage.favorites.limit}
            showUpgrade={true}
          />

          <UsageBar
            label="Followed games"
            used={subscription.usage.followed.used}
            limit={subscription.usage.followed.limit}
            showUpgrade={true}
          />
        </div>
      )}

      {/* Restore Purchases - De-emphasized, collapsible style */}
      <details className="group">
        <summary className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors list-none">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="w-4 h-4" />
            <span>Billing & Support</span>
          </div>
          <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <div className="mt-2 p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Restore Purchases</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Restore Pro from another device
              </p>
            </div>
            <button
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {isRestoring ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RotateCcw className="w-3 h-3" />
              )}
              Restore
            </button>
          </div>

          {restoreMessage && (
            <div
              className={`mt-3 px-3 py-2 rounded-lg text-sm ${
                restoreMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {restoreMessage.text}
            </div>
          )}
        </div>
      </details>
    </div>
  )
}
