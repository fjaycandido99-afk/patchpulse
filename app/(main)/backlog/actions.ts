'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type UpdateBacklogInput = {
  gameId: string
  status?: BacklogStatus
  progress?: number
  nextNote?: string | null
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

export async function updateBacklogItem(input: UpdateBacklogInput) {
  const { gameId, status, progress, nextNote } = input

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
    } else if (status === 'finished') {
      updates.progress = 100
      updates.finished_at = now
    } else if (existing?.status === 'finished') {
      // Changing from finished to paused/backlog/dropped
      updates.finished_at = null
    }
  }

  if (progress !== undefined && status !== 'finished') {
    updates.progress = clampProgress(progress)
  }

  if (nextNote !== undefined) {
    updates.next_note = nextNote
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
