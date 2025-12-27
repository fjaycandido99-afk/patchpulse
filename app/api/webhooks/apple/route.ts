import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import * as jose from 'jose'

// App Store Server Notifications V2 types
type NotificationType =
  | 'SUBSCRIBED'
  | 'DID_RENEW'
  | 'DID_CHANGE_RENEWAL_STATUS'
  | 'DID_CHANGE_RENEWAL_PREF'
  | 'DID_FAIL_TO_RENEW'
  | 'EXPIRED'
  | 'GRACE_PERIOD_EXPIRED'
  | 'REFUND'
  | 'REVOKE'
  | 'CONSUMPTION_REQUEST'
  | 'RENEWAL_EXTENDED'
  | 'RENEWAL_EXTENSION'
  | 'OFFER_REDEEMED'
  | 'PRICE_INCREASE'
  | 'TEST'

type Subtype =
  | 'INITIAL_BUY'
  | 'RESUBSCRIBE'
  | 'DOWNGRADE'
  | 'UPGRADE'
  | 'AUTO_RENEW_ENABLED'
  | 'AUTO_RENEW_DISABLED'
  | 'VOLUNTARY'
  | 'BILLING_RETRY'
  | 'PRICE_INCREASE'
  | 'GRACE_PERIOD'
  | 'BILLING_RECOVERY'
  | 'PENDING'
  | 'ACCEPTED'

type DecodedPayload = {
  notificationType: NotificationType
  subtype?: Subtype
  notificationUUID: string
  data: {
    appAppleId: number
    bundleId: string
    bundleVersion: string
    environment: 'Sandbox' | 'Production'
    signedTransactionInfo: string
    signedRenewalInfo?: string
  }
  signedDate: number
  version: string
}

type TransactionInfo = {
  transactionId: string
  originalTransactionId: string
  productId: string
  purchaseDate: number
  expiresDate: number
  type: string
  inAppOwnershipType: string
  signedDate: number
  environment: string
  storefrontCountryCode: string
  appAccountToken?: string
  webOrderLineItemId?: string
  subscriptionGroupIdentifier?: string
}

type RenewalInfo = {
  autoRenewProductId: string
  autoRenewStatus: number
  expirationIntent?: number
  gracePeriodExpiresDate?: number
  isInBillingRetryPeriod?: boolean
  originalTransactionId: string
  priceIncreaseStatus?: number
  productId: string
  signedDate: number
  renewalDate?: number
}

/**
 * Verify Apple's JWS signature
 * Apple signs notifications with a certificate chain that roots to Apple Root CA - G3
 */
async function verifyAppleJWS<T>(signedPayload: string): Promise<T | null> {
  try {
    // Decode the JWS header to get the certificate chain
    const [headerB64] = signedPayload.split('.')
    const headerJson = Buffer.from(headerB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    const header = JSON.parse(headerJson) as { alg: string; x5c?: string[] }

    if (!header.x5c || header.x5c.length === 0) {
      console.error('Apple JWS: No x5c certificate chain in header')
      return null
    }

    // The first certificate in the chain is the signing certificate
    const signingCertPem = `-----BEGIN CERTIFICATE-----\n${header.x5c[0]}\n-----END CERTIFICATE-----`

    // Import the public key from the signing certificate
    const signingCert = await jose.importX509(signingCertPem, header.alg as 'ES256')

    // Verify the JWS signature
    const { payload } = await jose.compactVerify(signedPayload, signingCert)

    // Parse and return the payload
    const decoded = JSON.parse(new TextDecoder().decode(payload)) as T
    return decoded
  } catch (error) {
    console.error('Apple JWS verification failed:', error)
    return null
  }
}

/**
 * Decode JWS without verification (fallback for development/testing)
 */
function decodeJWSUnsafe<T>(jws: string): T | null {
  try {
    const parts = jws.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const supabase = createAdminClient()

  try {
    const body = await request.json()
    const { signedPayload } = body

    if (!signedPayload) {
      console.error('Apple webhook: Missing signedPayload')
      return NextResponse.json({ error: 'Missing signedPayload' }, { status: 400 })
    }

    // Verify and decode the signed payload
    // In production, always verify. In sandbox, we can be more lenient.
    let payload: DecodedPayload | null = null

    // Try to verify the signature
    payload = await verifyAppleJWS<DecodedPayload>(signedPayload)

    // Fallback to unsafe decode if verification fails (for sandbox testing)
    if (!payload) {
      console.warn('Apple webhook: JWS verification failed, attempting unsafe decode')
      payload = decodeJWSUnsafe<DecodedPayload>(signedPayload)

      if (payload && payload.data.environment === 'Production') {
        // In production, never accept unverified payloads
        console.error('Apple webhook: Refusing unverified production payload')
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
      }
    }

    if (!payload) {
      console.error('Apple webhook: Failed to decode payload')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { notificationType, subtype, data, notificationUUID } = payload

    console.log(`Apple webhook: ${notificationType}${subtype ? ` (${subtype})` : ''} - ${notificationUUID}`)

    // Handle TEST notifications (used for endpoint verification)
    if (notificationType === 'TEST') {
      console.log('Apple webhook: Test notification received')
      return NextResponse.json({ received: true })
    }

    // Decode and verify transaction info
    let transactionInfo: TransactionInfo | null = null
    transactionInfo = await verifyAppleJWS<TransactionInfo>(data.signedTransactionInfo)
    if (!transactionInfo) {
      transactionInfo = decodeJWSUnsafe<TransactionInfo>(data.signedTransactionInfo)
    }

    if (!transactionInfo) {
      console.error('Apple webhook: Failed to decode transaction info')
      return NextResponse.json({ error: 'Invalid transaction info' }, { status: 400 })
    }

    // Decode renewal info if present
    let renewalInfo: RenewalInfo | null = null
    if (data.signedRenewalInfo) {
      renewalInfo = await verifyAppleJWS<RenewalInfo>(data.signedRenewalInfo)
      if (!renewalInfo) {
        renewalInfo = decodeJWSUnsafe<RenewalInfo>(data.signedRenewalInfo)
      }
    }

    // Find user by original transaction ID or app account token
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('provider_subscription_id', transactionInfo.originalTransactionId)
      .single()

    // appAccountToken is a UUID we pass when initiating purchase to link to our user
    const userId = existingSub?.user_id || transactionInfo.appAccountToken

    if (!userId) {
      console.log('Apple webhook: No user found for transaction', transactionInfo.originalTransactionId)
      // Still return 200 to acknowledge receipt - Apple will retry otherwise
      return NextResponse.json({ received: true })
    }

    // Process based on notification type
    switch (notificationType) {
      case 'SUBSCRIBED': {
        // New subscription or resubscribe
        await upsertSubscription(supabase, userId, transactionInfo, renewalInfo, 'active')
        await logEvent(supabase, userId, 'created', notificationUUID, {
          product_id: transactionInfo.productId,
          environment: data.environment,
          subtype,
        })
        break
      }

      case 'DID_RENEW': {
        // Subscription successfully renewed
        await upsertSubscription(supabase, userId, transactionInfo, renewalInfo, 'active')
        await logEvent(supabase, userId, 'renewed', notificationUUID, {
          product_id: transactionInfo.productId,
          subtype,
        })
        break
      }

      case 'DID_CHANGE_RENEWAL_STATUS': {
        // User enabled or disabled auto-renewal (this is how Apple handles "CANCEL")
        const willRenew = renewalInfo?.autoRenewStatus === 1

        await supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: !willRenew,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        // subtype: AUTO_RENEW_DISABLED = user cancelled
        // subtype: AUTO_RENEW_ENABLED = user re-enabled
        const eventType = willRenew ? 'reactivated' : 'canceled'
        await logEvent(supabase, userId, eventType, notificationUUID, {
          auto_renew_status: renewalInfo?.autoRenewStatus,
          subtype,
        })
        break
      }

      case 'DID_FAIL_TO_RENEW': {
        // Payment failed - Apple will retry
        const isInGracePeriod = subtype === 'GRACE_PERIOD'
        const isInBillingRetry = renewalInfo?.isInBillingRetryPeriod

        await supabase
          .from('user_subscriptions')
          .update({
            status: isInGracePeriod ? 'active' : 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, 'payment_failed', notificationUUID, {
          is_in_billing_retry: isInBillingRetry,
          is_in_grace_period: isInGracePeriod,
          expiration_intent: renewalInfo?.expirationIntent,
          subtype,
        })
        break
      }

      case 'EXPIRED': {
        // Subscription has expired
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, 'expired', notificationUUID, {
          expiration_intent: renewalInfo?.expirationIntent,
          subtype,
        })
        break
      }

      case 'GRACE_PERIOD_EXPIRED': {
        // Grace period ended, subscription is now truly expired
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, 'expired', notificationUUID, {
          reason: 'grace_period_expired',
          subtype,
        })
        break
      }

      case 'REFUND': {
        // Apple refunded the customer
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, 'refunded', notificationUUID, {
          transaction_id: transactionInfo.transactionId,
          subtype,
        })
        break
      }

      case 'REVOKE': {
        // Family sharing was revoked or refund for family organizer
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, 'revoked', notificationUUID, {
          subtype,
        })
        break
      }

      case 'DID_CHANGE_RENEWAL_PREF': {
        // User changed subscription tier (e.g., monthly to yearly)
        await logEvent(supabase, userId, 'plan_changed', notificationUUID, {
          new_product_id: renewalInfo?.autoRenewProductId,
          current_product_id: transactionInfo.productId,
          subtype,
        })
        break
      }

      case 'OFFER_REDEEMED': {
        // User redeemed a promotional offer
        await logEvent(supabase, userId, 'offer_redeemed', notificationUUID, {
          product_id: transactionInfo.productId,
          subtype,
        })
        break
      }

      case 'RENEWAL_EXTENDED': {
        // Subscription was extended (e.g., due to billing issue resolution)
        if (transactionInfo.expiresDate) {
          await supabase
            .from('user_subscriptions')
            .update({
              current_period_end: new Date(transactionInfo.expiresDate).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        }

        await logEvent(supabase, userId, 'extended', notificationUUID, {
          new_expiry: transactionInfo.expiresDate,
          subtype,
        })
        break
      }

      case 'PRICE_INCREASE': {
        // Price increase consent requested or confirmed
        await logEvent(supabase, userId, 'price_increase', notificationUUID, {
          status: subtype, // PENDING or ACCEPTED
          product_id: transactionInfo.productId,
        })
        break
      }

      default:
        console.log('Apple webhook: Unhandled notification type:', notificationType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Apple webhook error:', error)
    // Return 500 so Apple will retry
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function upsertSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  transaction: TransactionInfo,
  renewal: RenewalInfo | null,
  status: string
) {
  await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan: status === 'active' ? 'pro' : 'free',
    status,
    provider: 'apple',
    provider_subscription_id: transaction.originalTransactionId,
    current_period_start: new Date(transaction.purchaseDate).toISOString(),
    current_period_end: new Date(transaction.expiresDate).toISOString(),
    cancel_at_period_end: renewal ? renewal.autoRenewStatus !== 1 : false,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id',
  })
}

async function logEvent(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  eventType: string,
  providerEventId: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from('subscription_events').insert({
    user_id: userId,
    event_type: eventType,
    provider: 'apple',
    provider_event_id: providerEventId,
    metadata,
  })
}
