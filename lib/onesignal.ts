// OneSignal Push Notification Service
// Docs: https://documentation.onesignal.com/reference/create-notification

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!

type NotificationPayload = {
  title: string
  body: string
  url?: string
  data?: Record<string, string>
  // Target specific users by their external_id (user_id from your DB)
  userIds?: string[]
  // Or target all subscribed users
  sendToAll?: boolean
  // iOS specific
  iosBadgeCount?: number
  iosSound?: string
}

type OneSignalResponse = {
  success: boolean
  id?: string
  recipients?: number
  error?: string
}

export async function sendPushNotification(payload: NotificationPayload): Promise<OneSignalResponse> {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error('[OneSignal] Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY')
    return { success: false, error: 'OneSignal not configured' }
  }

  const notification: Record<string, unknown> = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: payload.title },
    contents: { en: payload.body },
  }

  // Targeting
  if (payload.userIds && payload.userIds.length > 0) {
    notification.include_aliases = {
      external_id: payload.userIds,
    }
    notification.target_channel = 'push'
  } else if (payload.sendToAll) {
    notification.included_segments = ['All']
  } else {
    return { success: false, error: 'No target specified' }
  }

  // URL to open when notification is clicked
  if (payload.url) {
    notification.url = payload.url
    notification.web_url = payload.url
    notification.app_url = payload.url
  }

  // Custom data
  if (payload.data) {
    notification.data = payload.data
  }

  // iOS specific
  if (payload.iosBadgeCount !== undefined) {
    notification.ios_badgeType = 'SetTo'
    notification.ios_badgeCount = payload.iosBadgeCount
  }
  if (payload.iosSound) {
    notification.ios_sound = payload.iosSound
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notification),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[OneSignal] Error:', data)
      return { success: false, error: data.errors?.[0] || 'Unknown error' }
    }

    return {
      success: true,
      id: data.id,
      recipients: data.recipients,
    }
  } catch (error) {
    console.error('[OneSignal] Request failed:', error)
    return { success: false, error: 'Request failed' }
  }
}

// Send notification to specific user
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url?: string,
  data?: Record<string, string>
): Promise<OneSignalResponse> {
  return sendPushNotification({
    userIds: [userId],
    title,
    body,
    url,
    data,
  })
}

// Send notification to multiple users
export async function sendPushToUsers(
  userIds: string[],
  title: string,
  body: string,
  url?: string,
  data?: Record<string, string>
): Promise<OneSignalResponse> {
  return sendPushNotification({
    userIds,
    title,
    body,
    url,
    data,
  })
}

// Send notification to all subscribers
export async function sendPushToAll(
  title: string,
  body: string,
  url?: string,
  data?: Record<string, string>
): Promise<OneSignalResponse> {
  return sendPushNotification({
    sendToAll: true,
    title,
    body,
    url,
    data,
  })
}
