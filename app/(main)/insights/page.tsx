import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { PlayRecommendations } from '@/components/ai/PlayRecommendations'
import { NewsDigest } from '@/components/ai/NewsDigest'
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
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">PatchPulse Insights</h1>
          {isPro && <ProBadge />}
        </div>
        <p className="mt-2 text-muted-foreground">
          Personalized gaming intelligence powered by PatchPulse
        </p>
      </div>

      {!isPro ? (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Unlock PatchPulse Insights</h2>
            <p className="text-muted-foreground mb-6">
              Get personalized recommendations, smart news digests, game sentiment analysis, and more with Pro.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>What to Play Next</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>News Digest</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Patch Summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Sentiment Pulse</span>
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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* What to Play Next */}
          <div className="lg:col-span-1">
            <PlayRecommendations />
          </div>

          {/* News Digest */}
          <div className="lg:col-span-1">
            <NewsDigest />
          </div>

          {/* Quick Tips */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Smart Features Across PatchPulse</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-1">Patch Summaries</h4>
                <p className="text-sm text-muted-foreground">
                  View AI summaries on any patch page. We'll tell you what changed and why it matters.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-1">Sentiment Pulse</h4>
                <p className="text-sm text-muted-foreground">
                  See community sentiment badges on game pages. Know if now's a good time to jump in.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-1">Smart Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  We learn what you care about and filter out the noise. Less spam, more signal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
