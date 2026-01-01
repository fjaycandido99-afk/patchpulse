import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { PlayRecommendations } from '@/components/ai/PlayRecommendations'
import { NewsDigest } from '@/components/ai/NewsDigest'
import { BacklogHealth } from '@/components/ai/BacklogHealth'
import { ProPowerTools } from '@/components/ai/ProPowerTools'
import { Brain, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ProBadge } from '@/components/ui/ProBadge'

export const metadata: Metadata = {
  title: 'PatchPulse Insights',
  description: 'Smart gaming insights and recommendations powered by PatchPulse',
}

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const plan = await getUserPlan(user.id)
  const isPro = plan === 'pro'

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">PatchPulse Insights</h1>
          {isPro && <ProBadge />}
        </div>
        <p className="mt-2 text-muted-foreground">
          Early signals, smart decisions, and personalized game intelligence
        </p>
      </div>

      {!isPro ? (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Know When to Play</h2>
            <p className="text-muted-foreground mb-6">
              Stop guessing. Pro gives you early signals, momentum tracking, and AI-powered timing so you never miss the right moment to jump in.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6 text-sm text-left">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Why Now Intelligence</span>
                  <p className="text-xs text-muted-foreground">Know the optimal time to return to any game</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Momentum Tracking</span>
                  <p className="text-xs text-muted-foreground">See which games are rising, cooling, or stable</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Early Signal Feed</span>
                  <p className="text-xs text-muted-foreground">News ranked by impact, not just recency</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Backlog Health</span>
                  <p className="text-xs text-muted-foreground">Know when dormant games become active again</p>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* What to Play Next */}
            <div className="lg:col-span-1">
              <PlayRecommendations />
            </div>

            {/* News Digest */}
            <div className="lg:col-span-1">
              <NewsDigest />
            </div>
          </div>

          {/* Backlog Health */}
          <BacklogHealth />

          {/* Pro Power Tools */}
          <ProPowerTools />
        </div>
      )}
    </div>
  )
}
