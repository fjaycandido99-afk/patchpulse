import { cookies } from 'next/headers'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isGuestModeFromCookies } from '@/lib/guest'
import { PlayRecommendations } from '@/components/ai/PlayRecommendations'
import { NewsDigest } from '@/components/ai/NewsDigest'
import { BacklogHealth } from '@/components/ai/BacklogHealth'
import { ProPowerTools } from '@/components/ai/ProPowerTools'

export const metadata: Metadata = {
  title: 'PatchPulse Insights',
  description: 'Smart gaming insights and recommendations powered by PatchPulse',
}

export default async function InsightsPage() {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // User is only a guest if they have the cookie AND are not logged in
  const isGuest = !user && hasGuestCookie

  if (!user && !isGuest) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">PatchPulse Insights</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Early signals and personalized game intelligence
        </p>
        {/* Glow divider */}
        <div className="relative h-0.5 w-full overflow-visible mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        </div>
      </div>

      <div className="space-y-6">
        {/* What Should I Play */}
        <PlayRecommendations />

        {/* News Summary */}
        <NewsDigest />

        {/* Backlog Health */}
        <BacklogHealth />

        {/* Pro Power Tools */}
        <ProPowerTools />
      </div>
    </div>
  )
}
