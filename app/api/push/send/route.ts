import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@patchpulse.app'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

type PushPayload = {
  title: string
  body: string
  url?: string
  icon?: string
  image?: string
  tag?: string
  priority?: number
  notificationId?: string
  type?: string
  gameId?: string
}

// POST /api/push/send - Send push notification (internal use / webhooks)
export async function POST(request: Request) {
  // Verify this is an internal request or has valid auth
  const authHeader = request.headers.get('authorization')
  const internalSecret = process.env.INTERNAL_API_SECRET

  // Allow service role or internal secret
  if (authHeader !== `Bearer ${internalSecret}` && !authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 500 })
  }

  try {
    const { userId, userIds, payload } = await request.json() as {
      userId?: string
      userIds?: string[]
      payload: PushPayload
    }

    const supabase = await createClient()

    // Get push subscriptions for user(s)
    let query = supabase.from('push_subscriptions').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds)
    } else {
      return NextResponse.json({ error: 'No users specified' }, { status: 400 })
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No subscriptions found' })
    }

    // Send push notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (error: unknown) {
          const pushError = error as { statusCode?: number }
          // If subscription is invalid, remove it
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }
          return { success: false, endpoint: sub.endpoint, error: String(error) }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length
    const failed = results.length - successful

    return NextResponse.json({
      sent: successful,
      failed,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
