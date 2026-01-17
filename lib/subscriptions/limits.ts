import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Plan limits
export const PLAN_LIMITS = {
  free: {
    backlog: 5,
    followed: 5,
    hasNotifications: false,
    hasAISummaries: false,
    hasFullReleases: false,
    hasBookmarks: false,
  },
  pro: {
    backlog: Infinity,
    followed: Infinity,
    hasNotifications: true,
    hasAISummaries: true,
    hasFullReleases: true,
    hasBookmarks: true,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
export type LimitType = 'backlog' | 'followed'

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

// Check if user can follow more games (watchlist only - games NOT in backlog)
export async function canFollowGame(userId?: string): Promise<LimitCheckResult> {
  const supabase = await createClient()

  const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
  if (!targetUserId) {
    return { allowed: false, currentCount: 0, maxCount: 0, plan: 'free' }
  }

  const plan = await getUserPlan(targetUserId)
  const limit = PLAN_LIMITS[plan].followed

  // Get all followed game IDs
  const { data: followedGames } = await supabase
    .from('user_games')
    .select('game_id')
    .eq('user_id', targetUserId)

  // Get all backlog game IDs
  const { data: backlogGames } = await supabase
    .from('backlog_items')
    .select('game_id')
    .eq('user_id', targetUserId)

  const followedIds = new Set((followedGames || []).map(g => g.game_id))
  const backlogIds = new Set((backlogGames || []).map(g => g.game_id))

  // Count followed games that are NOT in backlog (watchlist-only)
  const watchlistOnlyCount = [...followedIds].filter(id => !backlogIds.has(id)).length

  return {
    allowed: watchlistOnlyCount < limit,
    currentCount: watchlistOnlyCount,
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

  // Get usage counts - need to calculate watchlist-only count
  const [backlogResult, followedResult] = await Promise.all([
    supabase
      .from('backlog_items')
      .select('game_id')
      .eq('user_id', targetUserId),
    supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', targetUserId),
  ])

  const backlogIds = new Set((backlogResult.data || []).map(g => g.game_id))
  const followedIds = (followedResult.data || []).map(g => g.game_id)

  // Watchlist = followed games NOT in backlog
  const watchlistOnlyCount = followedIds.filter(id => !backlogIds.has(id)).length
  const backlogCount = backlogIds.size

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
        used: backlogCount,
        limit: limits.backlog === Infinity ? -1 : limits.backlog,
      },
      followed: {
        used: watchlistOnlyCount,
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
