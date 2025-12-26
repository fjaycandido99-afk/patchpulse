import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const userId = session.metadata?.user_id
          if (!userId) {
            console.error('No user_id in checkout session metadata')
            break
          }

          await upsertSubscription(supabase, userId, subscription)
          await logEvent(supabase, userId, 'created', 'stripe', event.id)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          // Try to find user by customer ID
          const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('provider_customer_id', subscription.customer)
            .single()

          if (existingSub) {
            await upsertSubscription(supabase, existingSub.user_id, subscription)
            await logEvent(supabase, existingSub.user_id, 'updated', 'stripe', event.id)
          }
        } else {
          await upsertSubscription(supabase, userId, subscription)
          await logEvent(supabase, userId, 'updated', 'stripe', event.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by subscription ID
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('provider_subscription_id', subscription.id)
          .single()

        if (existingSub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'expired',
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', existingSub.user_id)

          await logEvent(supabase, existingSub.user_id, 'expired', 'stripe', event.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : null

        if (subscriptionId) {
          const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('provider_subscription_id', subscriptionId)
            .single()

          if (existingSub) {
            await supabase
              .from('user_subscriptions')
              .update({
                status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', existingSub.user_id)

            await logEvent(supabase, existingSub.user_id, 'payment_failed', 'stripe', event.id)
          }
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : null

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('provider_subscription_id', subscriptionId)
            .single()

          if (existingSub) {
            await upsertSubscription(supabase, existingSub.user_id, subscription)
            await logEvent(supabase, existingSub.user_id, 'renewed', 'stripe', event.id)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function upsertSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  subscription: Stripe.Subscription
) {
  const status = mapStripeStatus(subscription.status)

  // Access period dates from items array in newer API versions
  const currentPeriodStart = subscription.items?.data[0]?.current_period_start
  const currentPeriodEnd = subscription.items?.data[0]?.current_period_end

  await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan: status === 'active' ? 'pro' : 'free',
    status,
    provider: 'stripe',
    provider_subscription_id: subscription.id,
    provider_customer_id: subscription.customer as string,
    current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id',
  })
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'canceled':
      return 'canceled'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    default:
      return 'expired'
  }
}

async function logEvent(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  eventType: string,
  provider: string,
  providerEventId: string
) {
  await supabase.from('subscription_events').insert({
    user_id: userId,
    event_type: eventType,
    provider,
    provider_event_id: providerEventId,
  })
}
