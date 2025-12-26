import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL))
  }

  try {
    // Get user's Stripe customer ID
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('provider_customer_id, provider')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.provider_customer_id || subscription.provider !== 'stripe') {
      return NextResponse.redirect(new URL('/pricing', process.env.NEXT_PUBLIC_APP_URL))
    }

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.provider_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    })

    return NextResponse.redirect(session.url)
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.redirect(new URL('/profile?error=portal_failed', process.env.NEXT_PUBLIC_APP_URL))
  }
}
