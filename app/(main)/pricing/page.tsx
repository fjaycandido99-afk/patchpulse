import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PricingCards } from './PricingCards'
import { getSubscriptionInfo } from '@/lib/subscriptions/limits'

export const metadata: Metadata = {
  title: 'Pricing - PatchPulse',
  description: 'Upgrade to Pro for unlimited games, smart notifications, and AI summaries',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: 'free' | 'pro' = 'free'

  if (user) {
    const subscription = await getSubscriptionInfo(user.id)
    currentPlan = subscription.plan
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Choose Your Plan
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Track unlimited games, get smart notifications, and stay ahead with AI-powered summaries
        </p>
      </div>

      {/* Pricing Cards */}
      <PricingCards currentPlan={currentPlan} isLoggedIn={!!user} />

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">Can I cancel anytime?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll keep Pro features until the end of your billing period.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">What happens to my data if I downgrade?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your data is never deleted. If you exceed free limits after downgrading, you won't be able to add new items until you're within limits or upgrade again.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Do you offer refunds?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Can I switch between monthly and yearly?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yes, you can switch plans at any time. When switching to yearly, you'll get credit for your remaining monthly time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
