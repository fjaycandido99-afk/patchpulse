import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('provider_customer_id, provider_subscription_id, provider')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.provider_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    if (subscription.provider !== 'stripe') {
      return NextResponse.json({
        error: 'Please cancel through the App Store or Google Play'
      }, { status: 400 })
    }

    // Cancel at period end (user keeps access until subscription ends)
    await stripe.subscriptions.update(subscription.provider_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update local database
    await supabase
      .from('user_subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
