import { createAdminClient } from '@/lib/supabase/admin'
import {
  getUserNotificationPrefs,
  applyPriorityAlertRules,
  getDefaultNotificationPrefs
} from '@/lib/ai/smart-notifications'

type ContentType = 'patch' | 'news'

type NotificationTask = {
  id: string
  entity_type: string
  entity_id: string
  payload: {
    game_id: string
    title: string
    content?: string
    impact_score?: number
    is_rumor?: boolean
    topics?: string[]
  }
}

type ProcessResult = {
  taskId: string
  notified: number
  skipped: number
  error?: string
}

/**
 * Queue a smart notification task for async processing
 */
export async function queueSmartNotification(
  contentType: ContentType,
  contentId: string,
  payload: {
    game_id: string
    title: string
    content?: string
    impact_score?: number
    is_rumor?: boolean
    topics?: string[]
  }
): Promise<string | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ai_processing_queue')
    .insert({
      task_type: 'smart_notification',
      entity_type: contentType,
      entity_id: contentId,
      priority: payload.impact_score && payload.impact_score >= 7 ? 8 : 5,
      payload,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to queue smart notification:', error)
    return null
  }

  return data.id
}

/**
 * Process pending smart notification tasks
 */
export async function processSmartNotificationQueue(
  batchSize: number = 10
): Promise<{ processed: number; results: ProcessResult[] }> {
  const supabase = createAdminClient()

  // Fetch pending tasks
  const { data: tasks, error: fetchError } = await supabase
    .from('ai_processing_queue')
    .select('*')
    .eq('task_type', 'smart_notification')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(batchSize)

  if (fetchError || !tasks || tasks.length === 0) {
    return { processed: 0, results: [] }
  }

  const results: ProcessResult[] = []

  for (const task of tasks as NotificationTask[]) {
    // Mark as processing
    await supabase
      .from('ai_processing_queue')
      .update({ status: 'processing', attempts: (task as any).attempts + 1 })
      .eq('id', task.id)

    try {
      const result = await processNotificationTask(task)
      results.push(result)

      // Mark as completed
      await supabase
        .from('ai_processing_queue')
        .update({
          status: 'completed',
          result: { notified: result.notified, skipped: result.skipped },
        })
        .eq('id', task.id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.push({ taskId: task.id, notified: 0, skipped: 0, error: errorMessage })

      // Mark as failed or retry
      const attempts = (task as any).attempts || 0
      const maxAttempts = (task as any).max_attempts || 3

      await supabase
        .from('ai_processing_queue')
        .update({
          status: attempts >= maxAttempts ? 'failed' : 'pending',
          error_message: errorMessage,
        })
        .eq('id', task.id)
    }
  }

  return { processed: tasks.length, results }
}

/**
 * Process a single notification task
 */
async function processNotificationTask(task: NotificationTask): Promise<ProcessResult> {
  const supabase = createAdminClient()
  const { entity_type, entity_id, payload } = task

  // Get followers of the game
  const { data: followers } = await supabase
    .from('user_games')
    .select('user_id')
    .eq('game_id', payload.game_id)

  if (!followers || followers.length === 0) {
    return { taskId: task.id, notified: 0, skipped: 0 }
  }

  // Get game info for notification
  const { data: game } = await supabase
    .from('games')
    .select('id, name')
    .eq('id', payload.game_id)
    .single()

  const gameName = game?.name || 'Unknown Game'
  let notified = 0
  let skipped = 0

  // Process each follower
  for (const follower of followers) {
    const userId = follower.user_id

    const shouldNotify = await shouldCreateNotification(
      userId,
      entity_type as ContentType,
      payload,
      supabase
    )

    if (!shouldNotify.notify) {
      skipped++
      continue
    }

    // Create the notification
    const notificationType = entity_type === 'patch' ? 'new_patch' : 'new_news'
    const priority = shouldNotify.priority

    const notificationData: Record<string, unknown> = {
      user_id: userId,
      type: notificationType,
      title: payload.title,
      body: generateNotificationBody(entity_type as ContentType, payload, gameName),
      priority,
      game_id: payload.game_id,
      metadata: {
        smart_filtered: true,
        filter_reason: shouldNotify.reason,
      },
    }

    // Add patch_id or news_id
    if (entity_type === 'patch') {
      notificationData.patch_id = entity_id
    } else {
      notificationData.news_id = entity_id
    }

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notificationData)

    if (!insertError) {
      notified++
    }
  }

  return { taskId: task.id, notified, skipped }
}

/**
 * Determine if a notification should be created for a user
 */
async function shouldCreateNotification(
  userId: string,
  contentType: ContentType,
  payload: NotificationTask['payload'],
  supabase: ReturnType<typeof createAdminClient>
): Promise<{ notify: boolean; priority: number; reason: string }> {
  // Get user preferences
  let prefs
  try {
    prefs = await getUserNotificationPrefs(userId)
  } catch {
    prefs = getDefaultNotificationPrefs()
  }

  // Check if game is muted
  const gameOverride = prefs.game_overrides[payload.game_id]
  if (gameOverride?.muted) {
    return { notify: false, priority: 0, reason: 'game_muted' }
  }

  // Check category preferences
  if (contentType === 'patch') {
    const isMajor = (payload.impact_score || 0) >= 7

    if (isMajor && !prefs.notify_major_patches) {
      return { notify: false, priority: 0, reason: 'major_patches_disabled' }
    }
    if (!isMajor && !prefs.notify_minor_patches) {
      return { notify: false, priority: 0, reason: 'minor_patches_disabled' }
    }
  }

  if (contentType === 'news') {
    // Check if it's a rumor
    if (payload.is_rumor) {
      // Only notify for important rumor topics
      const importantTopics = ['Launch', 'DLC', 'Delay']
      const hasImportantTopic = payload.topics?.some(t => importantTopics.includes(t))
      if (!hasImportantTopic) {
        return { notify: false, priority: 0, reason: 'rumor_filtered' }
      }
    }

    // Check topic-based preferences
    const topics = payload.topics || []
    if (topics.includes('Esports') && !prefs.notify_esports) {
      return { notify: false, priority: 0, reason: 'esports_disabled' }
    }
    if (topics.includes('Cosmetic') && !prefs.notify_cosmetics) {
      return { notify: false, priority: 0, reason: 'cosmetics_disabled' }
    }
    if (topics.includes('DLC') && !prefs.notify_dlc) {
      return { notify: false, priority: 0, reason: 'dlc_disabled' }
    }
    if (topics.includes('Sale') && !prefs.notify_sales) {
      return { notify: false, priority: 0, reason: 'sales_disabled' }
    }
  }

  // Calculate base priority
  let priority = 3
  if (contentType === 'patch') {
    const impactScore = payload.impact_score || 5
    if (impactScore >= 8) priority = 5
    else if (impactScore >= 6) priority = 4
    else if (impactScore >= 4) priority = 3
    else priority = 2
  } else if (contentType === 'news') {
    const topics = payload.topics || []
    if (topics.includes('Launch')) priority = 5
    else if (topics.includes('DLC') || topics.includes('Delay')) priority = 4
    else if (payload.is_rumor) priority = 2
    else priority = 3
  }

  // Apply priority alert rules (Pro users)
  try {
    const ruleResult = await applyPriorityAlertRules(userId, {
      type: contentType,
      game_id: payload.game_id,
      impact_score: payload.impact_score,
      priority,
    })

    if (ruleResult.matched) {
      priority = Math.min(5, priority + ruleResult.priority_boost)
    }
  } catch {
    // Ignore rule errors, use default priority
  }

  return { notify: true, priority, reason: 'passed_filters' }
}

/**
 * Generate notification body text
 */
function generateNotificationBody(
  contentType: ContentType,
  payload: NotificationTask['payload'],
  gameName: string
): string {
  if (contentType === 'patch') {
    const impactScore = payload.impact_score || 5
    if (impactScore >= 8) {
      return `Major update for ${gameName}`
    } else if (impactScore >= 6) {
      return `New patch available for ${gameName}`
    } else {
      return `Minor update for ${gameName}`
    }
  } else {
    if (payload.is_rumor) {
      return `New rumor about ${gameName}`
    }
    return `News about ${gameName}`
  }
}
