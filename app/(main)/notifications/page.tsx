import { cookies } from 'next/headers'
import { Metadata } from 'next'
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
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-2 text-muted-foreground">
          Stay updated on patches, news, and releases from your followed games.
        </p>
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
