'use client'

import { useState } from 'react'
import { Crown, Check, Loader2, RotateCcw, ExternalLink, XCircle } from 'lucide-react'
import { UsageBar } from './UpgradePrompt'
import { restorePurchases, isNative } from '@/lib/capacitor/purchases'

type SubscriptionInfo = {
  plan: 'free' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'expired'
  provider: 'stripe' | 'apple' | 'google' | 'manual' | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  usage: {
    backlog: { used: number; limit: number }
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
  const [isCanceling, setIsCanceling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [cancelMessage, setCancelMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const isPro = subscription.plan === 'pro' && subscription.status === 'active'

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    setCancelMessage(null)

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setCancelMessage({
          type: 'success',
          text: 'Subscription canceled. You will keep Pro access until the end of your billing period.',
        })
        setShowCancelConfirm(false)
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setCancelMessage({
          type: 'error',
          text: data.error || 'Failed to cancel subscription',
        })
      }
    } catch {
      setCancelMessage({
        type: 'error',
        text: 'Failed to cancel subscription. Please try again.',
      })
    } finally {
      setIsCanceling(false)
    }
  }

  const handleRestorePurchases = async () => {
    setIsRestoring(true)
    setRestoreMessage(null)

    try {
      // Use native StoreKit restore on iOS, web API otherwise
      const result = await restorePurchases()

      if (result.success) {
        setRestoreMessage({
          type: 'success',
          text: 'Purchases restored successfully!',
        })
        // Refresh the page to update subscription status
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setRestoreMessage({
          type: 'error',
          text: result.error || 'No purchases to restore',
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
                <span>Push notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>AI patch summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Early access</span>
              </div>
            </div>

            {/* Manage Subscription button */}
            <a
              href="/api/subscriptions/portal"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Subscription
            </a>

            {/* Cancel Subscription */}
            {!subscription.cancelAtPeriodEnd && (
              <div className="mt-3">
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full text-center text-sm text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                    <p className="text-sm text-center mb-3">
                      Are you sure? You&apos;ll keep Pro until {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'end of billing period'}.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        Keep Pro
                      </button>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isCanceling ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          'Yes, Cancel'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {cancelMessage && (
                  <div
                    className={`mt-3 px-3 py-2 rounded-lg text-sm ${
                      cancelMessage.type === 'success'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {cancelMessage.text}
                  </div>
                )}
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <p className="mt-3 text-center text-sm text-amber-400">
                Your subscription will end on {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'your billing date'}
              </p>
            )}
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
