import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

type DecodedPayload = {
  notificationType: NotificationType
  subtype?: string
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
}

export async function POST(request: Request) {
  const supabase = createAdminClient()

  try {
    const body = await request.json()
    const { signedPayload } = body

    if (!signedPayload) {
      return NextResponse.json({ error: 'Missing signedPayload' }, { status: 400 })
    }

    // Decode the JWS payload (base64url encoded)
    // In production, you should verify the signature with Apple's public key
    const payload = decodeJWS<DecodedPayload>(signedPayload)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { notificationType, data, notificationUUID } = payload

    // Decode transaction info
    const transactionInfo = decodeJWS<TransactionInfo>(data.signedTransactionInfo)
    if (!transactionInfo) {
      return NextResponse.json({ error: 'Invalid transaction info' }, { status: 400 })
    }

    // Decode renewal info if present
    const renewalInfo = data.signedRenewalInfo
      ? decodeJWS<RenewalInfo>(data.signedRenewalInfo)
      : null

    // Find user by original transaction ID or app account token
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('provider_subscription_id', transactionInfo.originalTransactionId)
      .single()

    const userId = existingSub?.user_id || transactionInfo.appAccountToken

    if (!userId) {
      console.log('Apple webhook: No user found for transaction', transactionInfo.originalTransactionId)
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ received: true })
    }

    // Process based on notification type
    switch (notificationType) {
      case 'SUBSCRIBED': {
        await upsertSubscription(supabase, userId, transactionInfo, renewalInfo, 'active')
        await logEvent(supabase, userId, 'created', notificationUUID, {
          product_id: transactionInfo.productId,
          environment: data.environment,
        })
        break
      }

      case 'DID_RENEW': {
        await upsertSubscription(supabase, userId, transactionInfo, renewalInfo, 'active')
        await logEvent(supabase, userId, 'renewed', notificationUUID, {
          product_id: transactionInfo.productId,
        })
        break
      }

      case 'DID_CHANGE_RENEWAL_STATUS': {
        // User toggled auto-renewal
        const willRenew = renewalInfo?.autoRenewStatus === 1
        await supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: !willRenew,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, willRenew ? 'reactivated' : 'canceled', notificationUUID, {
          auto_renew_status: renewalInfo?.autoRenewStatus,
        })
        break
      }

      case 'DID_FAIL_TO_RENEW': {
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, 'payment_failed', notificationUUID, {
          is_in_billing_retry: renewalInfo?.isInBillingRetryPeriod,
          expiration_intent: renewalInfo?.expirationIntent,
        })
        break
      }

      case 'EXPIRED':
      case 'GRACE_PERIOD_EXPIRED': {
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
        })
        break
      }

      case 'REFUND':
      case 'REVOKE': {
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        await logEvent(supabase, userId, 'refunded', notificationUUID, {
          notification_type: notificationType,
        })
        break
      }

      case 'DID_CHANGE_RENEWAL_PREF': {
        // User changed subscription tier (e.g., monthly to yearly)
        await logEvent(supabase, userId, 'updated', notificationUUID, {
          new_product_id: renewalInfo?.autoRenewProductId,
        })
        break
      }

      default:
        console.log('Unhandled Apple notification type:', notificationType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Apple webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

function decodeJWS<T>(jws: string): T | null {
  try {
    // JWS format: header.payload.signature
    const parts = jws.split('.')
    if (parts.length !== 3) return null

    // Decode the payload (second part)
    const payload = parts[1]
    // Base64url to base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Decode
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
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
