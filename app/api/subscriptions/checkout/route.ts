import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()

// Debug: Log first 15 chars of key to verify correct key is loaded
console.log('Stripe key prefix:', stripeKey?.substring(0, 15) || 'NOT SET')

if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not configured')
}

const stripe = stripeKey ? new Stripe(stripeKey, {
  typescript: true,
  maxNetworkRetries: 3,
}) : null

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priceId, interval } = await request.json()

  // Use the provided priceId or default based on interval
  const selectedPriceId = priceId || (
    interval === 'year'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID
  )

  if (!selectedPriceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    return NextResponse.json({ error: 'App URL not configured (NEXT_PUBLIC_APP_URL)' }, { status: 500 })
  }

  // Check for test/live mode mismatch
  const isTestKey = stripeKey?.startsWith('sk_test_')
  console.log(`Stripe mode: ${isTestKey ? 'TEST' : 'LIVE'}, Price ID: ${selectedPriceId.substring(0, 20)}...`)

  try {
    // Check if user already has a Stripe customer ID
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('provider_customer_id')
      .eq('user_id', user.id)
      .eq('provider', 'stripe')
      .single()

    let customerId = existingSub?.provider_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/profile?subscription=success`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const keyPrefix = stripeKey?.substring(0, 20) || 'NOT SET'
    return NextResponse.json(
      { error: `Failed: ${message} (key: ${keyPrefix}...)` },
      { status: 500 }
    )
  }
}
