'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { discoverGame, type GameDiscoveryResult } from '@/lib/ai/game-discovery'
import { revalidatePath } from 'next/cache'

export type DiscoverGameResult = {
  success: boolean
  game?: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
  message: string
  needsReview?: boolean
}

export async function discoverAndAddGame(searchQuery: string): Promise<DiscoverGameResult> {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      message: 'Please sign in to add games',
    }
  }

  const adminClient = createAdminClient()

  // Check if user is Pro (no limits for Pro users)
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single()

  const isPro = profile?.is_pro === true

  // Check rate limit (3 per day for free users, unlimited for Pro)
  if (!isPro) {
    const { count } = await adminClient
      .from('game_discovery_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (count && count >= 3) {
      return {
        success: false,
        message: 'Daily limit reached (3 games/day). Upgrade to Pro for unlimited!',
      }
    }
  }

  // Run AI discovery
  const result = await discoverGame(searchQuery)

  // Record the attempt
  await adminClient.from('game_discovery_attempts').insert({
    user_id: user.id,
    search_query: searchQuery,
    result_status: result.success ? 'success' : (result.needsReview ? 'queued' : 'failed'),
  })

  // Update queue with user info if it was queued
  if (result.needsReview) {
    await adminClient
      .from('game_discovery_queue')
      .update({ requested_by: user.id })
      .eq('search_query', searchQuery)
      .eq('status', 'pending_review')
  }

  if (result.success && result.game) {
    // Auto-follow the discovered game for the user
    await adminClient
      .from('user_followed_games')
      .upsert({
        user_id: user.id,
        game_id: result.game.id,
        notify_patches: true,
        notify_news: true,
      }, {
        onConflict: 'user_id,game_id',
        ignoreDuplicates: true,
      })

    revalidatePath('/search')
    revalidatePath('/home')
    revalidatePath('/backlog')
    return {
      success: true,
      game: result.game,
      message: `${result.game.name} has been added to your library!`,
    }
  }

  if (result.needsReview) {
    return {
      success: false,
      needsReview: true,
      message: 'Game queued for review. We\'ll add it soon!',
    }
  }

  return {
    success: false,
    message: result.error || 'Could not find this game. Try a different search.',
  }
}

// For checking if a game exists before showing add button
export async function checkGameExists(searchQuery: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('games')
    .select('id')
    .ilike('name', `%${searchQuery}%`)
    .limit(1)

  return !!data && data.length > 0
}
