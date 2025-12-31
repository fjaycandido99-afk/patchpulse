import { Metadata } from 'next'
import { getNotifications, getNotificationStats } from '@/lib/notifications'
import { NotificationsList } from './NotificationsList'

export const metadata: Metadata = {
  title: 'Notifications | PatchPulse',
  description: 'View all your gaming notifications',
}

export default async function NotificationsPage() {
  const [notifications, stats] = await Promise.all([
    getNotifications(50),
    getNotificationStats(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-2 text-muted-foreground">
          Stay updated on patches, news, and releases from your followed games.
        </p>
      </div>

      <NotificationsList
        initialNotifications={notifications}
        initialStats={stats}
      />
    </div>
  )
}
