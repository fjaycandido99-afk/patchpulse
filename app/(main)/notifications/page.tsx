import { cookies } from 'next/headers'
import { Metadata } from 'next'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { isGuestModeFromCookies } from '@/lib/guest'
import { createClient } from '@/lib/supabase/server'
import { getNotifications, getNotificationStats, getTodaysNews } from '@/lib/notifications'
import { NotificationsList } from './NotificationsList'
import { PushNotificationToggle } from '@/components/notifications/PushNotificationToggle'
import { GuestGuard } from '@/components/auth/GuestGuard'

export const metadata: Metadata = {
  title: 'Notifications | PatchPulse',
  description: 'View all your gaming notifications',
}

export default async function NotificationsPage() {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // User is only a guest if they have the cookie AND are not logged in
  const isGuest = !user && hasGuestCookie

  // Show sign-up prompt for guests
  if (isGuest) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated on patches, news, and releases from your followed games.
          </p>
        </div>
        <GuestGuard feature="receive notifications">
          <div />
        </GuestGuard>
      </div>
    )
  }

  const [notifications, stats, todaysNews] = await Promise.all([
    getNotifications(50),
    getNotificationStats(),
    getTodaysNews(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-2 text-muted-foreground">
              Stay updated on patches, news, and releases from your followed games.
            </p>
          </div>
          <Link
            href="/notifications/settings"
            className="flex-shrink-0 p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 transition-colors"
            title="Notification Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        {/* Glow divider */}
        <div className="relative h-0.5 w-full overflow-visible mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        </div>
      </div>

      {/* Push Notification Settings */}
      <PushNotificationToggle />

      <NotificationsList
        initialNotifications={notifications}
        initialStats={stats}
        todaysNews={todaysNews}
      />
    </div>
  )
}
