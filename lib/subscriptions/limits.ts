import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Plan limits
export const PLAN_LIMITS = {
  free: {
    backlog: 5,
    favorites: 5,
    followed: 10,
    hasNotifications: false,
    hasAISummaries: false,
    hasFullReleases: false,
    hasBookmarks: false,
  },
  pro: {
    backlog: Infinity,
    favorites: Infinity,
    followed: Infinity,
    hasNotifications: true,
    hasAISummaries: true,
    hasFullReleases: true,
    hasBookmarks: true,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
export type LimitType = 'backlog' | 'favorites' | 'followed'

export type LimitCheckResult = {
  allowed: boolean
  currentCount: number
  maxCount: number
  plan: Plan
}

export type SubscriptionInfo = {
  plan: Plan
  status: 'active' | 'canceled' | 'past_due' | 'expired'
  provider: 'stripe' | 'apple' | 'google' | 'manual' | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  usage: {
    backlog: { used: number; limit: number }
    favorites: { used: number; limit: number }
    followed: { used: number; limit: number }
  }
  features: {
    notifications: boolean
    aiSummaries: boolean
    fullReleases: boolean
    bookmarks: boolean
  }
}

// Get user's current plan
export async function getUserPlan(userId?: string): Promise<Plan> {
  const supabase = await createClient()

  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
  if (!targetUserId) return 'free'

  const { data } = await supabase
    .from('user_subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', targetUserId)
    .single()

  if (!data) return 'free'

  // Check if subscription is still valid
  if (data.status !== 'active') return 'free'
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    return 'free'
  }

  return (data.plan as Plan) || 'free'
}

// Check if user can add to backlog
export async function canAddToBacklog(userId?: string): Promise<LimitCheckResult> {
  const supabase = await createClient()

  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
  if (!targetUserId) {
    return { allowed: false, currentCount: 0, maxCount: 0, plan: 'free' }
  }

  const plan = await getUserPlan(targetUserId)
  const limit = PLAN_LIMITS[plan].backlog

  const { count } = await supabase
    .from('backlog_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', targetUserId)

  const currentCount = count || 0

  return {
    allowed: currentCount < limit,
    currentCount,
    maxCount: limit === Infinity ? -1 : limit,
    plan,
  }
}

// Check if user can add to favorites
export async function canAddFavorite(userId?: string): Promise<LimitCheckResult> {
  const supabase = await createClient()

  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
  if (!targetUserId) {
    return { allowed: false, currentCount: 0, maxCount: 0, plan: 'free' }
  }

  const plan = await getUserPlan(targetUserId)
  const limit = PLAN_LIMITS[plan].favorites

  const { count } = await supabase
    .from('user_games')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', targetUserId)
    .eq('is_favorite', true)

  const currentCount = count || 0

  return {
    allowed: currentCount < limit,
    currentCount,
    maxCount: limit === Infinity ? -1 : limit,
    plan,
  }
}

// Check if user can follow more games
export async function canFollowGame(userId?: string): Promise<LimitCheckResult> {
  const supabase = await createClient()

  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
  if (!targetUserId) {
    return { allowed: false, currentCount: 0, maxCount: 0, plan: 'free' }
  }

  const plan = await getUserPlan(targetUserId)
  const limit = PLAN_LIMITS[plan].followed

  const { count } = await supabase
    .from('user_games')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', targetUserId)

  const currentCount = count || 0

  return {
    allowed: currentCount < limit,
    currentCount,
    maxCount: limit === Infinity ? -1 : limit,
    plan,
  }
}

// Get full subscription info
export async function getSubscriptionInfo(userId?: string): Promise<SubscriptionInfo> {
  const supabase = await createClient()

  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
  if (!targetUserId) {
    return getDefaultSubscriptionInfo()
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  // Get usage counts
  const [backlogCount, favoritesCount, followedCount] = await Promise.all([
    supabase
      .from('backlog_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId),
    supabase
      .from('user_games')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('is_favorite', true),
    supabase
      .from('user_games')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId),
  ])

  const plan: Plan = subscription?.plan === 'pro' && subscription?.status === 'active' ? 'pro' : 'free'
  const limits = PLAN_LIMITS[plan]

  return {
    plan,
    status: (subscription?.status as SubscriptionInfo['status']) || 'active',
    provider: subscription?.provider as SubscriptionInfo['provider'] || null,
    currentPeriodEnd: subscription?.current_period_end
      ? new Date(subscription.current_period_end)
      : null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
    usage: {
      backlog: {
        used: backlogCount.count || 0,
        limit: limits.backlog === Infinity ? -1 : limits.backlog,
      },
      favorites: {
        used: favoritesCount.count || 0,
        limit: limits.favorites === Infinity ? -1 : limits.favorites,
      },
      followed: {
        used: followedCount.count || 0,
        limit: limits.followed === Infinity ? -1 : limits.followed,
      },
    },
    features: {
      notifications: limits.hasNotifications,
      aiSummaries: limits.hasAISummaries,
      fullReleases: limits.hasFullReleases,
      bookmarks: limits.hasBookmarks,
    },
  }
}

function getDefaultSubscriptionInfo(): SubscriptionInfo {
  return {
    plan: 'free',
    status: 'active',
    provider: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    usage: {
      backlog: { used: 0, limit: PLAN_LIMITS.free.backlog },
      favorites: { used: 0, limit: PLAN_LIMITS.free.favorites },
      followed: { used: 0, limit: PLAN_LIMITS.free.followed },
    },
    features: {
      notifications: false,
      aiSummaries: false,
      fullReleases: false,
      bookmarks: false,
    },
  }
}

// Admin function to grant pro access manually
export async function grantProAccess(
  userId: string,
  durationDays: number = 30,
  reason: string = 'manual'
): Promise<boolean> {
  const adminClient = createAdminClient()

  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + durationDays)

  const { error } = await adminClient.from('user_subscriptions').upsert({
    user_id: userId,
    plan: 'pro',
    status: 'active',
    provider: 'manual',
    current_period_end: periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id',
  })

  if (!error) {
    await adminClient.from('subscription_events').insert({
      user_id: userId,
      event_type: 'upgraded',
      provider: 'manual',
      metadata: { reason, duration_days: durationDays },
    })
  }

  return !error
}
