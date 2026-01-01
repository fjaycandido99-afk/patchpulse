'use client'

import { useState } from 'react'
import { Check, Crown, Loader2, Sparkles, Bell, Brain, Zap } from 'lucide-react'

type Props = {
  currentPlan: 'free' | 'pro'
  isLoggedIn: boolean
}

const FREE_FEATURES = [
  '5 backlog games',
  '5 favorite games',
  '10 followed games',
  'Basic game tracking',
  'News feed access',
]

const PRO_FEATURES = [
  'Unlimited backlog games',
  'Unlimited favorites',
  'Unlimited follows',
  'Smart notifications',
  'Smart patch summaries',
  'Priority support',
]

export function PricingCards({ currentPlan, isLoggedIn }: Props) {
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(false)

  const monthlyPrice = 4.99
  const yearlyPrice = 49.99
  const yearlySavings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)

  const handleUpgrade = async () => {
    if (!isLoggedIn) {
      window.location.href = '/login?redirect=/pricing'
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        alert(`Checkout error: ${data.error}`)
        console.error('Checkout error:', data.error)
        setIsLoading(false)
      } else {
        alert('Failed to create checkout session. Please try again.')
        console.error('No checkout URL returned:', data)
        setIsLoading(false)
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.')
      console.error('Checkout error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 pb-12">
      {/* Interval Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setInterval('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === 'month'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === 'year'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="ml-1.5 text-xs text-green-400">
              Save {yearlySavings}%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Free</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started with basic tracking
            </p>
          </div>

          <ul className="mt-8 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {currentPlan === 'free' ? (
              <div className="w-full py-2.5 text-center text-sm text-muted-foreground">
                Current plan
              </div>
            ) : (
              <div className="w-full py-2.5 text-center text-sm text-muted-foreground">
                Downgrade in settings
              </div>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div className="relative rounded-xl border-2 border-primary bg-card p-6">
          {/* Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Most Popular
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Pro
            </h3>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                ${interval === 'year' ? yearlyPrice : monthlyPrice}
              </span>
              <span className="text-muted-foreground">
                /{interval === 'year' ? 'year' : 'month'}
              </span>
            </div>
            {interval === 'year' && (
              <p className="mt-1 text-sm text-green-400">
                ${(yearlyPrice / 12).toFixed(2)}/month, billed yearly
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to stay on top of gaming
            </p>
          </div>

          <ul className="mt-8 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {currentPlan === 'pro' ? (
              <div className="w-full py-2.5 text-center text-sm text-muted-foreground">
                Current plan
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {isLoggedIn ? 'Upgrade to Pro' : 'Sign in to Upgrade'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="max-w-4xl mx-auto mt-12 grid sm:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h4 className="mt-3 font-semibold">Unlimited Tracking</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Track as many games as you want in your backlog, favorites, and follows
          </p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <h4 className="mt-3 font-semibold">Smart Notifications</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Get notified about patches, updates, and news for your games
          </p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h4 className="mt-3 font-semibold">Smart Summaries</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            TL;DR summaries of patch notes powered by PatchPulse
          </p>
        </div>
      </div>
    </div>
  )
}
