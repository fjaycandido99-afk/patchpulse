import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'
import { sendAPNsPushBatch } from '@/lib/apns'

// Lazy initialization of web-push VAPID credentials
let vapidConfigured = false

function configureWebPush() {
  if (vapidConfigured) return true

  // Strip padding and any whitespace/quotes from VAPID keys
  const rawPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const rawPrivateKey = process.env.VAPID_PRIVATE_KEY || ''

  const VAPID_PUBLIC_KEY = rawPublicKey.trim().replace(/[="'\s]/g, '')
  const VAPID_PRIVATE_KEY = rawPrivateKey.trim().replace(/[="'\s]/g, '')
  const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@patchpulse.app'

  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
      vapidConfigured = true
      return true
    } catch (error) {
      console.error('Failed to configure VAPID:', error)
      return false
    }
  }
  return false
}

// Check if APNs is configured
function isAPNsConfigured(): boolean {
  return !!(process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID && process.env.APNS_KEY)
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

  if (!configureWebPush()) {
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

    // Also get device tokens for native push
    let deviceTokensQuery = supabase.from('device_tokens').select('*')
    if (userId) {
      deviceTokensQuery = deviceTokensQuery.eq('user_id', userId)
    } else if (userIds && userIds.length > 0) {
      deviceTokensQuery = deviceTokensQuery.in('user_id', userIds)
    }
    const { data: deviceTokens } = await deviceTokensQuery

    const hasWebSubscriptions = subscriptions && subscriptions.length > 0
    const hasNativeDevices = deviceTokens && deviceTokens.length > 0

    if (!hasWebSubscriptions && !hasNativeDevices) {
      return NextResponse.json({ sent: 0, message: 'No subscriptions found' })
    }

    let webSuccessful = 0
    let webFailed = 0
    let nativeSuccessful = 0
    let nativeFailed = 0

    // Send web push notifications
    if (hasWebSubscriptions && configureWebPush()) {
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

      webSuccessful = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length
      webFailed = results.length - webSuccessful
    }

    // Send native push notifications (APNs for iOS)
    if (hasNativeDevices && isAPNsConfigured()) {
      const iosTokens = deviceTokens
        .filter(d => d.platform === 'ios')
        .map(d => d.token)

      if (iosTokens.length > 0) {
        const result = await sendAPNsPushBatch(iosTokens, payload)
        nativeSuccessful = result.successful
        nativeFailed = result.failed

        // Remove invalid tokens
        if (result.invalidTokens.length > 0) {
          await supabase
            .from('device_tokens')
            .delete()
            .in('token', result.invalidTokens)
        }
      }
    }

    return NextResponse.json({
      sent: webSuccessful + nativeSuccessful,
      failed: webFailed + nativeFailed,
      web: { sent: webSuccessful, failed: webFailed },
      native: { sent: nativeSuccessful, failed: nativeFailed },
      total: (subscriptions?.length || 0) + (deviceTokens?.length || 0),
    })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
