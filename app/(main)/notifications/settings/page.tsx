import { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft, Crown, Bell, Sparkles } from 'lucide-react'
import { isGuestModeFromCookies } from '@/lib/guest'
import { createClient } from '@/lib/supabase/server'
import { getUserNotificationPrefs, getDefaultNotificationPrefs } from '@/lib/ai/smart-notifications'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { GuestGuard } from '@/components/auth/GuestGuard'
import { NotificationSettingsContent } from '@/components/notifications/NotificationSettingsContent'
import { getFollowedGamesWithMuteStatus } from './actions'

export const metadata: Metadata = {
  title: 'Notification Settings | PatchPulse',
  description: 'Customize your notification preferences',
}

export default async function NotificationSettingsPage() {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isGuest = !user && hasGuestCookie

  if (isGuest) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/notifications"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notifications
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Customize what notifications you receive.
          </p>
        </div>
        <GuestGuard feature="customize notifications">
          <div />
        </GuestGuard>
      </div>
    )
  }

  const plan = user ? await getUserPlan(user.id) : 'free' as const
  const isPro = plan === 'pro'

  // Pro-only feature gate
  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/notifications"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notifications
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Customize what notifications you receive.
          </p>
        </div>

        {/* Pro Upgrade Prompt */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pro Feature</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Notification settings are available for Pro users. Upgrade to customize exactly what updates you receive.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <Bell className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Smart Filters</p>
                <p className="text-xs text-muted-foreground">Filter by patch type</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Per-Game Control</p>
                <p className="text-xs text-muted-foreground">Mute specific games</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <Crown className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Priority Alerts</p>
                <p className="text-xs text-muted-foreground">Never miss big updates</p>
              </div>
            </div>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Pro
          </Link>
        </div>
      </div>
    )
  }

  const [prefs, gamesResult] = await Promise.all([
    user ? getUserNotificationPrefs(user.id) : getDefaultNotificationPrefs(),
    getFollowedGamesWithMuteStatus(),
  ])

  const categoryPrefs = {
    notify_major_patches: prefs.notify_major_patches,
    notify_minor_patches: prefs.notify_minor_patches,
    notify_dlc: prefs.notify_dlc,
    notify_sales: prefs.notify_sales,
    notify_esports: prefs.notify_esports,
    notify_cosmetics: prefs.notify_cosmetics,
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notifications
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Customize what notifications you receive.
        </p>
        {/* Glow divider */}
        <div className="relative h-0.5 w-full overflow-visible mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        </div>
      </div>

      <NotificationSettingsContent
        categoryPrefs={categoryPrefs}
        games={gamesResult.games}
        isPro={isPro}
      />
    </div>
  )
}
