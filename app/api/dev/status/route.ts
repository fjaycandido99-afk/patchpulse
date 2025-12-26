import { createClient } from '@/lib/supabase/server'
import { getSubscriptionInfo } from '@/lib/subscriptions/limits'
import { NextResponse } from 'next/server'

// Development-only endpoint to check subscription status
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      authenticated: false,
      message: 'Not logged in'
    })
  }

  // Get raw subscription data
  const { data: rawSub } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get processed subscription info
  const subscriptionInfo = await getSubscriptionInfo(user.id)

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    email: user.email,
    rawSubscription: rawSub || 'No subscription record found',
    processedInfo: subscriptionInfo,
    proFeaturesEnabled: subscriptionInfo.plan === 'pro',
  })
}
