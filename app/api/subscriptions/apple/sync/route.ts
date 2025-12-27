import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Sync subscription from native iOS app (RevenueCat)
 * Called after successful purchase or restore on device
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For restore without login, we can still process if we have valid data
  const body = await request.json()
  const { originalAppUserId, productId, expirationDate, isActive } = body

  if (!productId) {
    return NextResponse.json({ error: 'Missing product info' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  try {
    // Determine user ID - prefer logged in user, fall back to RevenueCat user ID
    const userId = user?.id

    if (!userId) {
      // User not logged in - store pending subscription
      // They'll need to log in to activate it
      return NextResponse.json({
        success: true,
        pending: true,
        message: 'Subscription recorded. Log in to activate.',
        revenueCatUserId: originalAppUserId,
      })
    }

    // Determine plan from product ID
    const plan = isActive ? 'pro' : 'free'
    const status = isActive ? 'active' : 'expired'

    // Upsert subscription
    await adminClient.from('user_subscriptions').upsert({
      user_id: userId,
      plan,
      status,
      provider: 'apple',
      provider_subscription_id: originalAppUserId,
      current_period_end: expirationDate ? new Date(expirationDate).toISOString() : null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

    // Log the sync event
    await adminClient.from('subscription_events').insert({
      user_id: userId,
      event_type: 'synced',
      provider: 'apple',
      provider_event_id: `sync_${Date.now()}`,
      metadata: {
        product_id: productId,
        revenuecat_user_id: originalAppUserId,
        source: 'native_app',
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        plan,
        status,
        expiresAt: expirationDate,
      },
    })
  } catch (error) {
    console.error('Apple sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}
