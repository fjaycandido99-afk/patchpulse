'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { canAddToBacklog, canFollowGame } from '@/lib/subscriptions/limits'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type UpdateBacklogInput = {
  gameId: string
  status?: BacklogStatus
  progress?: number
  nextNote?: string | null
  pauseReason?: string | null
}

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  return { user, supabase }
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export async function addToBacklog(gameId: string) {
  if (!gameId || typeof gameId !== 'string') {
    throw new Error('Invalid game ID')
  }

  const { user, supabase } = await getCurrentUser()

  // Check if game is already in backlog (updates don't count against limit)
  const { data: existing } = await supabase
    .from('backlog_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  // Only check limit if this is a new addition
  if (!existing) {
    const limitCheck = await canAddToBacklog(user.id)
    if (!limitCheck.allowed) {
      return {
        success: false,
        limitReached: true,
        currentCount: limitCheck.currentCount,
        maxCount: limitCheck.maxCount,
        plan: limitCheck.plan,
      }
    }
  }

  const { error } = await supabase
    .from('backlog_items')
    .upsert(
      {
        user_id: user.id,
        game_id: gameId,
        status: 'backlog',
        progress: 0,
      },
      {
        onConflict: 'user_id,game_id',
        ignoreDuplicates: true,
      }
    )

  if (error) {
    throw new Error('Failed to add game to backlog')
  }

  revalidatePath('/backlog')
  return { success: true }
}

export async function addToBacklogWithStatus(gameId: string, status: BacklogStatus) {
  if (!gameId || typeof gameId !== 'string') {
    throw new Error('Invalid game ID')
  }

  const { user, supabase } = await getCurrentUser()

  // Check if game is already in backlog (updates don't count against limit)
  const { data: existing } = await supabase
    .from('backlog_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  // Only check limit if this is a new addition
  if (!existing) {
    const limitCheck = await canAddToBacklog(user.id)
    if (!limitCheck.allowed) {
      return {
        success: false,
        limitReached: true,
        currentCount: limitCheck.currentCount,
        maxCount: limitCheck.maxCount,
        plan: limitCheck.plan,
      }
    }
  }

  const now = new Date().toISOString()
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    game_id: gameId,
    status,
    progress: status === 'finished' ? 100 : 0,
  }

  // Set timestamps based on status
  if (status === 'playing') {
    insertData.started_at = now
    insertData.last_played_at = now
  } else if (status === 'finished') {
    insertData.started_at = now
    insertData.finished_at = now
  }

  const { error } = await supabase
    .from('backlog_items')
    .upsert(insertData, {
      onConflict: 'user_id,game_id',
    })

  if (error) {
    throw new Error('Failed to add game to library')
  }

  revalidatePath('/backlog')
  revalidatePath('/home')
  return { success: true }
}

export async function updateBacklogItem(input: UpdateBacklogInput) {
  const { gameId, status, progress, nextNote, pauseReason } = input

  if (!gameId || typeof gameId !== 'string') {
    throw new Error('Invalid game ID')
  }

  const { user, supabase } = await getCurrentUser()

  const { data: existing } = await supabase
    .from('backlog_items')
    .select('id, status, started_at, finished_at')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = {}

  if (status !== undefined) {
    updates.status = status

    if (status === 'playing') {
      if (!existing?.started_at) {
        updates.started_at = now
      }
      if (existing?.finished_at) {
        updates.finished_at = null
      }
      // Clear pause reason when resuming
      updates.pause_reason = null
    } else if (status === 'finished') {
      updates.progress = 100
      updates.finished_at = now
      updates.pause_reason = null
    } else if (status === 'paused' || status === 'dropped') {
      // Save pause reason when pausing or dropping
      if (pauseReason !== undefined) {
        updates.pause_reason = pauseReason
      }
    } else if (existing?.status === 'finished') {
      // Changing from finished to backlog
      updates.finished_at = null
    }
  }

  if (progress !== undefined && status !== 'finished') {
    updates.progress = clampProgress(progress)
  }

  if (nextNote !== undefined) {
    updates.next_note = nextNote
  }

  // Allow updating pause_reason independently
  if (pauseReason !== undefined && status === undefined) {
    updates.pause_reason = pauseReason
  }

  if (Object.keys(updates).length === 0) {
    return { success: true }
  }

  if (existing) {
    const { error } = await supabase
      .from('backlog_items')
      .update(updates)
      .eq('id', existing.id)

    if (error) {
      throw new Error('Failed to update backlog item')
    }
  } else {
    const { error } = await supabase.from('backlog_items').insert({
      user_id: user.id,
      game_id: gameId,
      status: status || 'backlog',
      progress: progress !== undefined ? clampProgress(progress) : 0,
      next_note: nextNote ?? null,
      started_at: status === 'playing' ? now : null,
      finished_at: status === 'finished' ? now : null,
    })

    if (error) {
      throw new Error('Failed to create backlog item')
    }
  }

  revalidatePath('/backlog')
  return { success: true }
}

export async function searchGamesForBacklog(query: string) {
  if (!query || query.length < 2) {
    return []
  }

  // Search doesn't require authentication - just query the games table
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('id, name, slug, cover_url')
    .ilike('name', `%${query}%`)
    .limit(15)

  if (error || !data) {
    return []
  }

  return data
}

export async function followAndAddToBacklog(gameId: string) {
  if (!gameId || typeof gameId !== 'string') {
    throw new Error('Invalid game ID')
  }

  const { user, supabase } = await getCurrentUser()

  // Check if already following
  const { data: existingFollow } = await supabase
    .from('user_games')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  // Check if already in backlog
  const { data: existingBacklog } = await supabase
    .from('backlog_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  // Check follow limit if new follow
  if (!existingFollow) {
    const followCheck = await canFollowGame(user.id)
    if (!followCheck.allowed) {
      return {
        success: false,
        limitReached: true,
        limitType: 'followed' as const,
        currentCount: followCheck.currentCount,
        maxCount: followCheck.maxCount,
        plan: followCheck.plan,
      }
    }
  }

  // Check backlog limit if new backlog item
  if (!existingBacklog) {
    const backlogCheck = await canAddToBacklog(user.id)
    if (!backlogCheck.allowed) {
      return {
        success: false,
        limitReached: true,
        limitType: 'backlog' as const,
        currentCount: backlogCheck.currentCount,
        maxCount: backlogCheck.maxCount,
        plan: backlogCheck.plan,
      }
    }
  }

  // First, ensure the user follows the game
  await supabase
    .from('user_games')
    .upsert(
      { user_id: user.id, game_id: gameId },
      { onConflict: 'user_id,game_id', ignoreDuplicates: true }
    )

  // Then add to backlog
  const { error } = await supabase
    .from('backlog_items')
    .upsert(
      {
        user_id: user.id,
        game_id: gameId,
        status: 'backlog',
        progress: 0,
      },
      {
        onConflict: 'user_id,game_id',
        ignoreDuplicates: true,
      }
    )

  if (error) {
    throw new Error('Failed to add game to backlog')
  }

  revalidatePath('/backlog')
  revalidatePath('/home')
  return { success: true }
}

export async function dismissReturnSuggestion(suggestionId: string) {
  if (!suggestionId || typeof suggestionId !== 'string') {
    throw new Error('Invalid suggestion ID')
  }

  const { user, supabase } = await getCurrentUser()

  const { error } = await supabase
    .from('return_suggestions')
    .update({ is_dismissed: true })
    .eq('id', suggestionId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to dismiss suggestion')
  }

  revalidatePath('/home')
  return { success: true }
}

export async function actOnReturnSuggestion(suggestionId: string, gameId: string) {
  if (!suggestionId || typeof suggestionId !== 'string') {
    throw new Error('Invalid suggestion ID')
  }

  const { user, supabase } = await getCurrentUser()

  // Mark suggestion as acted on
  const { error: suggestionError } = await supabase
    .from('return_suggestions')
    .update({ is_acted_on: true })
    .eq('id', suggestionId)
    .eq('user_id', user.id)

  if (suggestionError) {
    throw new Error('Failed to update suggestion')
  }

  // Update backlog item status back to playing
  const now = new Date().toISOString()
  const { error: backlogError } = await supabase
    .from('backlog_items')
    .update({
      status: 'playing',
      pause_reason: null,
      last_played_at: now,
    })
    .eq('user_id', user.id)
    .eq('game_id', gameId)

  if (backlogError) {
    throw new Error('Failed to update backlog status')
  }

  revalidatePath('/home')
  revalidatePath('/backlog')
  return { success: true }
}

export async function markPlayedToday(gameId: string) {
  if (!gameId || typeof gameId !== 'string') {
    throw new Error('Invalid game ID')
  }

  const { user, supabase } = await getCurrentUser()

  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from('backlog_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('backlog_items')
      .update({ last_played_at: now })
      .eq('id', existing.id)

    if (error) {
      throw new Error('Failed to update last played date')
    }
  } else {
    const { error } = await supabase.from('backlog_items').insert({
      user_id: user.id,
      game_id: gameId,
      status: 'playing',
      progress: 0,
      last_played_at: now,
      started_at: now,
    })

    if (error) {
      throw new Error('Failed to create backlog item')
    }
  }

  const { error: eventError } = await supabase.from('user_events').insert({
    user_id: user.id,
    game_id: gameId,
    event_type: 'played',
    event_at: now,
    metadata: { source: 'backlog' },
  })

  if (eventError) {
    throw new Error('Failed to record play event')
  }

  revalidatePath('/backlog')
  revalidatePath('/home')
  return { success: true }
}
