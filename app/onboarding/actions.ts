'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { PLAN_LIMITS } from '@/lib/subscriptions/limits'

export async function searchGames(query: string) {
  if (!query || query.trim().length < 2) {
    return { games: [] }
  }

  const supabase = await createClient()

  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, platforms')
    .ilike('name', `%${query}%`)
    .limit(20)
    .order('name')

  if (error) {
    return { error: error.message, games: [] }
  }

  return { games: games || [] }
}

type SaveOnboardingData = {
  selectedGameIds: string[]
  preferred_platforms: string[]
  playstyle: 'casual' | 'competitive'
  notifications_enabled: boolean
}

export async function saveOnboarding(data: SaveOnboardingData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (!data.selectedGameIds || data.selectedGameIds.length === 0) {
    return { error: 'Please select at least one game' }
  }

  if (!data.preferred_platforms || data.preferred_platforms.length === 0) {
    return { error: 'Please select at least one platform' }
  }

  if (!['casual', 'competitive'].includes(data.playstyle)) {
    return { error: 'Invalid playstyle' }
  }

  // Enforce free tier limit on onboarding game selections
  const maxGames = PLAN_LIMITS.free.followed
  const limitedGameIds = data.selectedGameIds.slice(0, maxGames)

  const userGamesData = limitedGameIds.map((gameId) => ({
    user_id: user.id,
    game_id: gameId,
  }))

  const { error: gamesError } = await supabase
    .from('user_games')
    .upsert(userGamesData, {
      onConflict: 'user_id,game_id',
      ignoreDuplicates: true,
    })

  if (gamesError) {
    return { error: 'Failed to save game selections' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      preferred_platforms: data.preferred_platforms,
      playstyle: data.playstyle,
      notifications_enabled: data.notifications_enabled,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (profileError) {
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}
