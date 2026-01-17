'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { backfillPatchesForGame, needsBackfill } from '@/lib/fetchers/backfill-patches'
import { canFollowGame } from '@/lib/subscriptions/limits'

export async function followGame(gameId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if already following
  const { data: existing } = await supabase
    .from('user_games')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (existing) {
    // Already following - unfollow
    const { error } = await supabase
      .from('user_games')
      .delete()
      .eq('user_id', user.id)
      .eq('game_id', gameId)

    if (error) {
      console.error('Failed to unfollow game:', error)
      return { error: 'Failed to unfollow game' }
    }

    revalidatePath('/', 'layout')
    return { success: true, following: false }
  } else {
    // Check if user can follow more games (subscription limit)
    const limitCheck = await canFollowGame(user.id)
    if (!limitCheck.allowed) {
      return {
        error: 'limit_reached',
        message: `You've reached your limit of ${limitCheck.maxCount} followed games. Upgrade to Pro for unlimited games.`,
        currentCount: limitCheck.currentCount,
        maxCount: limitCheck.maxCount,
      }
    }

    // Not following - follow
    const { error } = await supabase
      .from('user_games')
      .insert({ user_id: user.id, game_id: gameId })

    if (error) {
      console.error('Failed to follow game:', error)
      return { error: 'Failed to follow game' }
    }

    // Trigger backfill of historical patches (async, don't wait)
    triggerBackfill(gameId).catch(console.error)

    revalidatePath('/', 'layout')
    return { success: true, following: true }
  }
}

// Trigger backfill in background (non-blocking)
async function triggerBackfill(gameId: string) {
  try {
    const needs = await needsBackfill(gameId)
    if (needs) {
      await backfillPatchesForGame(gameId)
    }
  } catch {
    // Backfill failures are non-critical
  }
}

export async function isFollowingGame(gameId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('user_games')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  return !!data
}
