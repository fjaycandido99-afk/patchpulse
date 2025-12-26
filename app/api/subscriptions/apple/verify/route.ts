import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Apple App Store Server API endpoints
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt'
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt'

type AppleReceiptResponse = {
  status: number
  environment?: 'Sandbox' | 'Production'
  receipt?: {
    bundle_id: string
    in_app: Array<{
      product_id: string
      transaction_id: string
      original_transaction_id: string
      purchase_date_ms: string
      expires_date_ms?: string
    }>
  }
  latest_receipt_info?: Array<{
    product_id: string
    transaction_id: string
    original_transaction_id: string
    purchase_date_ms: string
    expires_date_ms: string
    is_trial_period: string
    is_in_intro_offer_period?: string
  }>
  pending_renewal_info?: Array<{
    product_id: string
    auto_renew_status: string
    is_in_billing_retry_period?: string
  }>
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { receiptData } = await request.json()

  if (!receiptData) {
    return NextResponse.json({ error: 'Receipt data required' }, { status: 400 })
  }

  const sharedSecret = process.env.APPLE_SHARED_SECRET

  if (!sharedSecret) {
    console.error('APPLE_SHARED_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    // Try production first, then sandbox
    let response = await verifyWithApple(APPLE_PRODUCTION_URL, receiptData, sharedSecret)

    // Status 21007 means receipt is from sandbox
    if (response.status === 21007) {
      response = await verifyWithApple(APPLE_SANDBOX_URL, receiptData, sharedSecret)
    }

    if (response.status !== 0) {
      return NextResponse.json(
        { error: 'Invalid receipt', code: response.status },
        { status: 400 }
      )
    }

    // Get the latest subscription info
    const latestReceipt = response.latest_receipt_info?.sort(
      (a, b) => parseInt(b.expires_date_ms) - parseInt(a.expires_date_ms)
    )[0]

    if (!latestReceipt) {
      return NextResponse.json(
        { error: 'No subscription found in receipt' },
        { status: 400 }
      )
    }

    // Check if subscription is still valid
    const expiresDate = new Date(parseInt(latestReceipt.expires_date_ms))
    const isValid = expiresDate > new Date()

    // Get auto-renew status
    const pendingRenewal = response.pending_renewal_info?.find(
      (p) => p.product_id === latestReceipt.product_id
    )
    const willRenew = pendingRenewal?.auto_renew_status === '1'

    // Update subscription in database
    const adminClient = createAdminClient()

    await adminClient.from('user_subscriptions').upsert({
      user_id: user.id,
      plan: isValid ? 'pro' : 'free',
      status: isValid ? 'active' : 'expired',
      provider: 'apple',
      provider_subscription_id: latestReceipt.original_transaction_id,
      current_period_end: expiresDate.toISOString(),
      cancel_at_period_end: !willRenew,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

    // Log the event
    await adminClient.from('subscription_events').insert({
      user_id: user.id,
      event_type: 'verified',
      provider: 'apple',
      provider_event_id: latestReceipt.transaction_id,
      metadata: {
        product_id: latestReceipt.product_id,
        environment: response.environment,
        is_trial: latestReceipt.is_trial_period === 'true',
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        plan: isValid ? 'pro' : 'free',
        status: isValid ? 'active' : 'expired',
        expiresAt: expiresDate.toISOString(),
        willRenew,
        productId: latestReceipt.product_id,
      },
    })
  } catch (error) {
    console.error('Apple receipt verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

async function verifyWithApple(
  url: string,
  receiptData: string,
  sharedSecret: string
): Promise<AppleReceiptResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': sharedSecret,
      'exclude-old-transactions': true,
    }),
  })

  return response.json()
}
