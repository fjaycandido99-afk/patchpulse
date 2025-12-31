'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Mark a specific game's updates as seen (reset unread counts)
 */
export async function markGameAsSeen(gameId: string, options?: { patches?: boolean; news?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const markPatches = options?.patches ?? true
  const markNews = options?.news ?? true

  const updates: Record<string, unknown> = {}

  if (markPatches) {
    updates.unread_patch_count = 0
    updates.last_seen_patch_at = new Date().toISOString()
  }

  if (markNews) {
    updates.unread_news_count = 0
    updates.last_seen_news_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('user_followed_games')
    .update(updates)
    .eq('user_id', user.id)
    .eq('game_id', gameId)

  if (error) {
    console.error('Error marking game as seen:', error)
    return { error: 'Failed to mark as seen' }
  }

  revalidatePath('/backlog')
  revalidatePath(`/backlog/${gameId}`)

  return { success: true }
}

/**
 * Mark all games' updates as seen
 */
export async function markAllGamesSeen() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_followed_games')
    .update({
      unread_patch_count: 0,
      unread_news_count: 0,
      last_seen_patch_at: new Date().toISOString(),
      last_seen_news_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error marking all games as seen:', error)
    return { error: 'Failed to mark all as seen' }
  }

  revalidatePath('/backlog')

  return { success: true }
}

/**
 * Get the "What's New" context for a specific game
 */
export async function getWhatsNewContext(gameId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get the followed game activity
  const { data: followedGame } = await supabase
    .from('user_followed_games')
    .select(`
      last_seen_patch_at,
      last_seen_news_at,
      unread_patch_count,
      unread_news_count,
      latest_patch_at,
      latest_patch_title,
      latest_patch_severity
    `)
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (!followedGame) {
    return null
  }

  // Get recent patches since last seen
  const lastSeenPatch = followedGame.last_seen_patch_at || '1970-01-01'
  const { data: recentPatches } = await supabase
    .from('patch_notes')
    .select('id, title, published_at, impact_score, summary_tldr')
    .eq('game_id', gameId)
    .gt('published_at', lastSeenPatch)
    .order('published_at', { ascending: false })
    .limit(5)

  // Categorize patches by severity
  const majorPatches = recentPatches?.filter(p => (p.impact_score || 50) >= 70) || []
  const balanceChanges = recentPatches?.filter(p => {
    const score = p.impact_score || 50
    return score >= 40 && score < 70
  }) || []
  const minorPatches = recentPatches?.filter(p => (p.impact_score || 50) < 40) || []

  // Build context message
  let contextMessage = ''
  let hasUpdates = false

  if (majorPatches.length > 0) {
    contextMessage = `${majorPatches.length} major update${majorPatches.length > 1 ? 's' : ''} since you last played.`
    hasUpdates = true
  } else if (balanceChanges.length > 0) {
    contextMessage = `${balanceChanges.length} balance change${balanceChanges.length > 1 ? 's' : ''} detected since last play.`
    hasUpdates = true
  } else if (minorPatches.length > 0) {
    contextMessage = 'Bug fixes only since you last played.'
    hasUpdates = true
  } else {
    // No updates - show last patch info
    if (followedGame.latest_patch_at) {
      const lastPatchDate = new Date(followedGame.latest_patch_at)
      const daysAgo = Math.floor((Date.now() - lastPatchDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysAgo === 0) {
        contextMessage = 'Last update: Today'
      } else if (daysAgo === 1) {
        contextMessage = 'Last update: Yesterday'
      } else if (daysAgo < 7) {
        contextMessage = `Last update: ${daysAgo} days ago`
      } else if (daysAgo < 30) {
        contextMessage = `Last update: ${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) > 1 ? 's' : ''} ago`
      } else {
        contextMessage = `Last update: ${lastPatchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      }
    } else {
      contextMessage = 'No major updates tracked yet.'
    }
  }

  return {
    hasUpdates,
    contextMessage,
    unreadPatchCount: followedGame.unread_patch_count || 0,
    unreadNewsCount: followedGame.unread_news_count || 0,
    majorPatches,
    balanceChanges,
    minorPatches,
    latestPatchTitle: followedGame.latest_patch_title,
    latestPatchSeverity: followedGame.latest_patch_severity || 50,
  }
}
