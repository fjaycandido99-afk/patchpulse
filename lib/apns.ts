// APNs (Apple Push Notification service) sender
// Requires: APNs Key (.p8 file) from Apple Developer Console

type APNsPayload = {
  title: string
  body: string
  url?: string
  notificationId?: string
  type?: string
  gameId?: string
  patchId?: string
}

type APNsConfig = {
  keyId: string
  teamId: string
  key: string // Base64 encoded .p8 key content
  bundleId: string
  production: boolean
}

// JWT token cache
let cachedToken: { token: string; expiry: number } | null = null

/**
 * Generate JWT token for APNs authentication
 */
async function generateAPNsToken(config: APNsConfig): Promise<string> {
  // Return cached token if still valid (tokens last 1 hour, we refresh at 55 min)
  if (cachedToken && Date.now() < cachedToken.expiry) {
    return cachedToken.token
  }

  const header = {
    alg: 'ES256',
    kid: config.keyId,
  }

  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: config.teamId,
    iat: now,
  }

  // Import the key
  const keyData = Buffer.from(config.key, 'base64')
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  // Create token
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
  const claimsB64 = Buffer.from(JSON.stringify(claims)).toString('base64url')
  const toSign = `${headerB64}.${claimsB64}`

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(toSign)
  )

  // Convert signature from DER to raw format
  const signatureB64 = Buffer.from(signature).toString('base64url')
  const token = `${toSign}.${signatureB64}`

  // Cache for 55 minutes
  cachedToken = {
    token,
    expiry: Date.now() + 55 * 60 * 1000,
  }

  return token
}

/**
 * Send push notification via APNs
 */
export async function sendAPNsPush(
  deviceToken: string,
  payload: APNsPayload,
  config?: Partial<APNsConfig>
): Promise<{ success: boolean; error?: string }> {
  const fullConfig: APNsConfig = {
    keyId: config?.keyId || process.env.APNS_KEY_ID || '',
    teamId: config?.teamId || process.env.APNS_TEAM_ID || '',
    key: config?.key || process.env.APNS_KEY || '',
    bundleId: config?.bundleId || process.env.APNS_BUNDLE_ID || 'app.patchpulse.ios',
    production: config?.production ?? process.env.NODE_ENV === 'production',
  }

  if (!fullConfig.keyId || !fullConfig.teamId || !fullConfig.key) {
    return { success: false, error: 'APNs not configured' }
  }

  try {
    const token = await generateAPNsToken(fullConfig)

    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        sound: 'default',
        badge: 1,
      },
      // Custom data
      url: payload.url,
      notificationId: payload.notificationId,
      type: payload.type,
      gameId: payload.gameId,
      patchId: payload.patchId,
    }

    const host = fullConfig.production
      ? 'api.push.apple.com'
      : 'api.sandbox.push.apple.com'

    const response = await fetch(
      `https://${host}/3/device/${deviceToken}`,
      {
        method: 'POST',
        headers: {
          'authorization': `bearer ${token}`,
          'apns-topic': fullConfig.bundleId,
          'apns-push-type': 'alert',
          'apns-priority': '10',
          'apns-expiration': '0',
          'content-type': 'application/json',
        },
        body: JSON.stringify(apnsPayload),
      }
    )

    if (response.ok) {
      return { success: true }
    }

    const errorBody = await response.text()
    console.error('APNs error:', response.status, errorBody)

    // Token is invalid - should be removed
    if (response.status === 410 || response.status === 400) {
      return { success: false, error: 'invalid_token' }
    }

    return { success: false, error: `APNs error: ${response.status}` }
  } catch (error) {
    console.error('Failed to send APNs push:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send push notifications to multiple iOS devices
 */
export async function sendAPNsPushBatch(
  deviceTokens: string[],
  payload: APNsPayload
): Promise<{ successful: number; failed: number; invalidTokens: string[] }> {
  const results = await Promise.allSettled(
    deviceTokens.map(token => sendAPNsPush(token, payload))
  )

  let successful = 0
  let failed = 0
  const invalidTokens: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successful++
    } else {
      failed++
      if (result.status === 'fulfilled' && result.value.error === 'invalid_token') {
        invalidTokens.push(deviceTokens[index])
      }
    }
  })

  return { successful, failed, invalidTokens }
}
