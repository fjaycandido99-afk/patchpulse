import { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
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

  const [prefs, plan, gamesResult] = await Promise.all([
    user ? getUserNotificationPrefs(user.id) : getDefaultNotificationPrefs(),
    user ? getUserPlan(user.id) : 'free' as const,
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
        isPro={plan === 'pro'}
      />
    </div>
  )
}
