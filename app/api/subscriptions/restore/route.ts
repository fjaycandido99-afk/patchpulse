import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if user has any active subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({
        restored: false,
        message: 'No subscription found for this account',
      })
    }

    // Check if subscription is still valid
    const isActive = subscription.status === 'active'
    const isNotExpired = subscription.current_period_end
      ? new Date(subscription.current_period_end) > new Date()
      : false

    if (isActive && isNotExpired) {
      return NextResponse.json({
        restored: true,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          provider: subscription.provider,
          expiresAt: subscription.current_period_end,
        },
      })
    }

    // If subscription exists but is expired/canceled
    return NextResponse.json({
      restored: false,
      message: 'Your subscription has expired. Please renew to continue.',
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        provider: subscription.provider,
        expiredAt: subscription.current_period_end,
      },
    })
  } catch (error) {
    console.error('Restore purchases error:', error)
    return NextResponse.json(
      { error: 'Failed to restore purchases' },
      { status: 500 }
    )
  }
}
