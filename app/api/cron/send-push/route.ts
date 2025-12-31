import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Initialize Supabase with service role for cron access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure VAPID
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@patchpulse.app'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// GET /api/cron/send-push - Send push notifications for recent notifications
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 500 })
  }

  try {
    // Get notifications from the last 2 minutes (matches cron schedule)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

    // Get recent high-priority notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        type,
        title,
        body,
        priority,
        game_id,
        patch_id,
        news_id,
        metadata,
        created_at
      `)
      .gte('created_at', twoMinutesAgo)
      .gte('priority', 4) // Only high priority notifications
      .order('created_at', { ascending: false })

    if (notifError) {
      console.error('Error fetching notifications:', notifError)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ message: 'No notifications to send', sent: 0 })
    }

    // Group notifications by user
    const userNotifications = new Map<string, typeof notifications>()
    for (const notif of notifications) {
      const existing = userNotifications.get(notif.user_id) || []
      existing.push(notif)
      userNotifications.set(notif.user_id, existing)
    }

    // Get push subscriptions for all affected users
    const userIds = Array.from(userNotifications.keys())
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found', sent: 0 })
    }

    // Send push notifications
    let sent = 0
    let failed = 0

    for (const sub of subscriptions) {
      const userNotifs = userNotifications.get(sub.user_id)
      if (!userNotifs || userNotifs.length === 0) continue

      // Send only the most recent high-priority notification
      const notif = userNotifs[0]

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      // Build notification URL
      let url = '/notifications'
      if (notif.patch_id) {
        url = `/patches/${notif.patch_id}`
      } else if (notif.news_id) {
        url = `/news/${notif.news_id}`
      }

      const payload = {
        title: notif.title,
        body: notif.body || '',
        url,
        icon: '/icons/icon-192x192.png',
        priority: notif.priority,
        notificationId: notif.id,
        type: notif.type,
        gameId: notif.game_id,
      }

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
        sent++
      } catch (error: unknown) {
        const pushError = error as { statusCode?: number }
        // If subscription is invalid, remove it
        if (pushError.statusCode === 410 || pushError.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
        failed++
      }
    }

    return NextResponse.json({
      message: 'Push notifications processed',
      notifications: notifications.length,
      subscriptions: subscriptions.length,
      sent,
      failed,
    })
  } catch (error) {
    console.error('Error in push cron:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
