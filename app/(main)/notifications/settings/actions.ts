'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type CategoryPreferences = {
  notify_major_patches?: boolean
  notify_minor_patches?: boolean
  notify_dlc?: boolean
  notify_sales?: boolean
  notify_esports?: boolean
  notify_cosmetics?: boolean
}

export async function updateCategoryPreferences(
  prefs: CategoryPreferences
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('smart_notification_prefs')
    .upsert({
      user_id: user.id,
      ...prefs,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Error updating category preferences:', error)
    return { success: false, error: 'Failed to update preferences' }
  }

  revalidatePath('/notifications/settings')
  return { success: true }
}

export async function updateGameMuteStatus(
  gameId: string,
  muted: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get existing prefs
  const { data: existing } = await supabase
    .from('smart_notification_prefs')
    .select('game_overrides')
    .eq('user_id', user.id)
    .single()

  const gameOverrides = (existing?.game_overrides as Record<string, { muted?: boolean; notify_all?: boolean }>) || {}

  if (muted) {
    gameOverrides[gameId] = { ...(gameOverrides[gameId] || {}), muted: true }
  } else {
    if (gameOverrides[gameId]) {
      delete gameOverrides[gameId].muted
      // Clean up empty objects
      if (Object.keys(gameOverrides[gameId]).length === 0) {
        delete gameOverrides[gameId]
      }
    }
  }

  const { error } = await supabase
    .from('smart_notification_prefs')
    .upsert({
      user_id: user.id,
      game_overrides: gameOverrides,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Error updating game mute status:', error)
    return { success: false, error: 'Failed to update game mute status' }
  }

  revalidatePath('/notifications/settings')
  return { success: true }
}

export async function getFollowedGamesWithMuteStatus(): Promise<{
  games: Array<{
    id: string
    name: string
    slug: string
    cover_url: string | null
    muted: boolean
  }>
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { games: [] }
  }

  // Get followed games
  const { data: followedGames } = await supabase
    .from('user_games')
    .select('game:games(id, name, slug, cover_url)')
    .eq('user_id', user.id)

  // Get notification prefs
  const { data: prefs } = await supabase
    .from('smart_notification_prefs')
    .select('game_overrides')
    .eq('user_id', user.id)
    .single()

  const gameOverrides = (prefs?.game_overrides as Record<string, { muted?: boolean }>) || {}

  const games = (followedGames || [])
    .filter(fg => fg.game && !Array.isArray(fg.game))
    .map(fg => {
      const game = fg.game as unknown as { id: string; name: string; slug: string; cover_url: string | null }
      return {
        ...game,
        muted: gameOverrides[game.id]?.muted || false,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return { games }
}
