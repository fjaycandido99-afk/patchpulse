import { generateJSON } from './client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { DiffStats } from './provider'

type PriorityAlertRule = {
  id: string
  user_id: string
  name: string
  enabled: boolean
  rule_type: 'major_patch' | 'balance_changes' | 'resurfacing' | 'new_content' | 'high_priority' | 'custom'
  applies_to: 'all_games' | 'followed_games' | 'specific_games'
  game_ids: string[] | null
  thresholds: Record<string, number>
  priority_boost: number
  force_push: boolean
}

type RuleMatchResult = {
  matched: boolean
  rule?: PriorityAlertRule
  priority_boost: number
  force_push: boolean
}

type NotificationType =
  | 'major_patch'
  | 'minor_patch'
  | 'dlc'
  | 'sale'
  | 'esports'
  | 'cosmetic'
  | 'announcement'
  | 'content_update'

type NotificationPriority = 'high' | 'medium' | 'low' | 'skip'

type NotificationDecision = {
  should_notify: boolean
  priority: NotificationPriority
  notification_type: NotificationType
  reason: string
  title: string
  body: string
}

type UserNotificationPrefs = {
  notify_major_patches: boolean
  notify_minor_patches: boolean
  notify_dlc: boolean
  notify_sales: boolean
  notify_esports: boolean
  notify_cosmetics: boolean
  game_overrides: Record<string, { notify_all?: boolean; muted?: boolean }>
}

type ContentItem = {
  type: 'patch' | 'news'
  title: string
  content: string
  game_id: string
  game_name: string
  importance?: string
}

const SYSTEM_PROMPT = `You are a smart notification system for a gaming app. Your job is to decide which updates are worth notifying users about.

Most users get too many notifications. Be selective and only surface what truly matters:

HIGH priority (always notify):
- Major content updates (new characters, maps, modes)
- Critical bug fixes
- DLC/expansion releases
- Game-breaking changes

MEDIUM priority (notify if user shows interest):
- Balance patches with significant changes
- QoL improvements
- Seasonal events

LOW priority (only for enthusiasts):
- Minor bug fixes
- Small balance tweaks
- Performance optimizations

SKIP (don't notify):
- Cosmetic-only updates
- Backend maintenance
- Marketing announcements without real content
- Minor esports news

Craft notification text that's:
- Concise (title: 5-8 words, body: 1-2 sentences)
- Informative (what changed)
- Actionable (why they should care)`

/**
 * Decide if content warrants a notification
 */
export async function decideNotification(
  content: ContentItem,
  userPrefs: UserNotificationPrefs
): Promise<NotificationDecision> {
  // Quick check: is game muted?
  const gameOverride = userPrefs.game_overrides[content.game_id]
  if (gameOverride?.muted) {
    return {
      should_notify: false,
      priority: 'skip',
      notification_type: 'announcement',
      reason: 'Game is muted by user',
      title: '',
      body: '',
    }
  }

  const userPrompt = `Evaluate this ${content.type} for notification worthiness:

Game: ${content.game_name}
Title: ${content.title}
Content: ${content.content.slice(0, 2000)}

User Preferences:
- Major patches: ${userPrefs.notify_major_patches ? 'Yes' : 'No'}
- Minor patches: ${userPrefs.notify_minor_patches ? 'Yes' : 'No'}
- DLC: ${userPrefs.notify_dlc ? 'Yes' : 'No'}
- Sales: ${userPrefs.notify_sales ? 'Yes' : 'No'}
- Esports: ${userPrefs.notify_esports ? 'Yes' : 'No'}
- Cosmetics: ${userPrefs.notify_cosmetics ? 'Yes' : 'No'}
${gameOverride?.notify_all ? '- User wants ALL notifications for this game' : ''}

Return JSON with:
- should_notify: boolean
- priority: 'high' | 'medium' | 'low' | 'skip'
- notification_type: category of this update
- reason: why we're notifying (or not)
- title: notification title (if should_notify)
- body: notification body (if should_notify)`

  const result = await generateJSON<NotificationDecision>(SYSTEM_PROMPT, userPrompt, {
    
    maxTokens: 500,
    temperature: 0.3,
  })

  return result
}

/**
 * Get default notification preferences for a new user
 */
export function getDefaultNotificationPrefs(): UserNotificationPrefs {
  return {
    notify_major_patches: true,
    notify_minor_patches: false,
    notify_dlc: true,
    notify_sales: true,
    notify_esports: false,
    notify_cosmetics: false,
    game_overrides: {},
  }
}

/**
 * Get or create user notification preferences
 */
export async function getUserNotificationPrefs(userId: string): Promise<UserNotificationPrefs> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('smart_notification_prefs')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (data) {
    return {
      notify_major_patches: data.notify_major_patches,
      notify_minor_patches: data.notify_minor_patches,
      notify_dlc: data.notify_dlc,
      notify_sales: data.notify_sales,
      notify_esports: data.notify_esports,
      notify_cosmetics: data.notify_cosmetics,
      game_overrides: data.game_overrides as Record<string, { notify_all?: boolean; muted?: boolean }> || {},
    }
  }

  // Create default prefs
  const defaults = getDefaultNotificationPrefs()
  await supabase.from('smart_notification_prefs').insert({
    user_id: userId,
    ...defaults,
  })

  return defaults
}

/**
 * Update user preferences based on interaction
 */
export async function learnFromInteraction(
  userId: string,
  notificationType: NotificationType,
  action: 'clicked' | 'dismissed' | 'muted'
): Promise<void> {
  const supabase = createAdminClient()

  // Log the interaction
  const { data: prefs } = await supabase
    .from('smart_notification_prefs')
    .select('interaction_history')
    .eq('user_id', userId)
    .single()

  const history = (prefs?.interaction_history as Array<{
    type: NotificationType
    action: string
    timestamp: string
  }>) || []

  history.push({
    type: notificationType,
    action,
    timestamp: new Date().toISOString(),
  })

  // Keep last 100 interactions
  const trimmedHistory = history.slice(-100)

  await supabase
    .from('smart_notification_prefs')
    .update({
      interaction_history: trimmedHistory,
      last_learned_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  // If enough data, could trigger preference learning
  // For now, simple heuristic: if user dismisses 3+ of same type, disable it
  const typeInteractions = trimmedHistory.filter(h => h.type === notificationType)
  const dismissals = typeInteractions.filter(h => h.action === 'dismissed').length
  const clicks = typeInteractions.filter(h => h.action === 'clicked').length

  if (dismissals >= 3 && clicks === 0) {
    // Suggest disabling this type
    const prefField = `notify_${notificationType.replace('_', '_')}` as keyof UserNotificationPrefs
    if (prefField in getDefaultNotificationPrefs()) {
      await supabase
        .from('smart_notification_prefs')
        .update({ [prefField]: false })
        .eq('user_id', userId)
    }
  }
}

/**
 * Process pending content and create notifications
 */
export async function processNotificationsForContent(
  content: ContentItem
): Promise<{ notified: string[]; skipped: string[] }> {
  const supabase = createAdminClient()

  // Get users following this game
  const { data: followers } = await supabase
    .from('user_games')
    .select('user_id')
    .eq('game_id', content.game_id)

  if (!followers || followers.length === 0) {
    return { notified: [], skipped: [] }
  }

  const notified: string[] = []
  const skipped: string[] = []

  // Process in batches
  for (const follower of followers) {
    try {
      const prefs = await getUserNotificationPrefs(follower.user_id)
      const decision = await decideNotification(content, prefs)

      if (decision.should_notify) {
        // Would create actual notification here
        // For now, just track the decision
        notified.push(follower.user_id)
      } else {
        skipped.push(follower.user_id)
      }
    } catch (error) {
      console.error(`Notification processing failed for user ${follower.user_id}:`, error)
      skipped.push(follower.user_id)
    }
  }

  return { notified, skipped }
}

/**
 * Get user's priority alert rules
 */
export async function getUserPriorityAlertRules(userId: string): Promise<PriorityAlertRule[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('priority_alert_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true)

  return (data || []) as PriorityAlertRule[]
}

/**
 * Check if a priority alert rule matches the given content
 */
export function checkRuleMatch(
  rule: PriorityAlertRule,
  content: {
    type: 'patch' | 'news'
    game_id: string
    impact_score?: number
    diff_stats?: DiffStats | null
    priority?: number
    is_resurfacing?: boolean
  },
  userFollowedGameIds: string[]
): boolean {
  // Check scope
  if (rule.applies_to === 'specific_games') {
    if (!rule.game_ids || !rule.game_ids.includes(content.game_id)) {
      return false
    }
  } else if (rule.applies_to === 'followed_games') {
    if (!userFollowedGameIds.includes(content.game_id)) {
      return false
    }
  }
  // 'all_games' matches everything

  // Check rule type conditions
  switch (rule.rule_type) {
    case 'major_patch':
      // Match if impact_score >= threshold (default 7)
      const impactThreshold = rule.thresholds.impact_score || 7
      return (content.impact_score ?? 0) >= impactThreshold

    case 'balance_changes':
      // Match if significant buffs or nerfs
      if (!content.diff_stats) return false
      const buffsMin = rule.thresholds.buffs_min || 3
      const nerfsMin = rule.thresholds.nerfs_min || 3
      return (content.diff_stats.buffs >= buffsMin) || (content.diff_stats.nerfs >= nerfsMin)

    case 'resurfacing':
      // Match if game was dormant and got an update
      return content.is_resurfacing === true

    case 'new_content':
      // Match if new systems detected
      if (!content.diff_stats) return false
      const newSystemsMin = rule.thresholds.new_systems_min || 1
      return content.diff_stats.new_systems >= newSystemsMin

    case 'high_priority':
      // Match if notification priority >= threshold
      const priorityThreshold = rule.thresholds.priority || 4
      return (content.priority ?? 0) >= priorityThreshold

    case 'custom':
      // Custom rules not implemented in v1
      return false

    default:
      return false
  }
}

/**
 * Apply priority alert rules to a notification
 * Returns the cumulative result of all matching rules
 */
export async function applyPriorityAlertRules(
  userId: string,
  content: {
    type: 'patch' | 'news'
    game_id: string
    impact_score?: number
    diff_stats?: DiffStats | null
    priority?: number
    is_resurfacing?: boolean
  }
): Promise<RuleMatchResult> {
  const supabase = createAdminClient()

  // Get user's enabled rules
  const rules = await getUserPriorityAlertRules(userId)
  if (rules.length === 0) {
    return { matched: false, priority_boost: 0, force_push: false }
  }

  // Get user's followed games
  const { data: followedGames } = await supabase
    .from('user_games')
    .select('game_id')
    .eq('user_id', userId)

  const followedGameIds = (followedGames || []).map(g => g.game_id)

  // Check each rule
  let totalPriorityBoost = 0
  let shouldForcePush = false
  let matchedRule: PriorityAlertRule | undefined

  for (const rule of rules) {
    if (checkRuleMatch(rule, content, followedGameIds)) {
      totalPriorityBoost = Math.max(totalPriorityBoost, rule.priority_boost)
      if (rule.force_push) {
        shouldForcePush = true
      }
      if (!matchedRule) {
        matchedRule = rule
      }
    }
  }

  return {
    matched: totalPriorityBoost > 0 || shouldForcePush,
    rule: matchedRule,
    priority_boost: Math.min(totalPriorityBoost, 2), // Cap at +2
    force_push: shouldForcePush,
  }
}
