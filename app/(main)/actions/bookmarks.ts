'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserPlan } from '@/lib/subscriptions/limits'

const FREE_SAVED_LIMIT = 10

// Helper to check if user can save more items
async function canUserSave(userId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getUserPlan(userId)
  if (plan === 'pro') {
    return { allowed: true }
  }

  // Count existing bookmarks
  const { count, error } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('[canUserSave] Count error:', error)
    return { allowed: false, error: 'Failed to check bookmark limit' }
  }

  if ((count || 0) >= FREE_SAVED_LIMIT) {
    return { allowed: false, error: `You've reached the limit of ${FREE_SAVED_LIMIT} saved items. Upgrade to Pro for unlimited saves.` }
  }

  return { allowed: true }
}

export type DealMetadata = {
  title: string
  salePrice: number
  normalPrice: number
  savings: number
  store: string
  thumb: string
  dealUrl: string
  steamAppId: string | null
  savedAt: string
}

export async function toggleBookmark(
  entityType: 'patch' | 'news',
  entityId: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { error: 'Failed to remove bookmark' }
    }

    revalidatePath('/', 'layout')
    return { success: true, bookmarked: false }
  } else {
    // Check limit before adding
    const canSave = await canUserSave(user.id, supabase)
    if (!canSave.allowed) {
      return { error: canSave.error || 'Save limit reached' }
    }

    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
    })

    if (error) {
      return { error: 'Failed to add bookmark' }
    }

    revalidatePath('/', 'layout')
    return { success: true, bookmarked: true }
  }
}

export async function toggleDealBookmark(
  dealId: string,
  metadata: DealMetadata
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('[toggleDealBookmark] Not authenticated')
    return { error: 'Not authenticated' }
  }

  const { data: existing, error: selectError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', 'deal')
    .eq('entity_id', dealId)
    .single()

  // PGRST116 = no rows found, which is fine
  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[toggleDealBookmark] Select error:', selectError)
  }

  if (existing) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('[toggleDealBookmark] Delete error:', error)
      return { error: 'Failed to remove bookmark' }
    }

    revalidatePath('/', 'layout')
    return { success: true, bookmarked: false }
  } else {
    // Check limit before adding
    const canSave = await canUserSave(user.id, supabase)
    if (!canSave.allowed) {
      return { error: canSave.error || 'Save limit reached' }
    }

    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      entity_type: 'deal',
      entity_id: dealId,
      metadata: metadata,
    })

    if (error) {
      console.error('[toggleDealBookmark] Insert error:', error)
      return { error: `Failed to add bookmark: ${error.message}` }
    }

    revalidatePath('/', 'layout')
    return { success: true, bookmarked: true }
  }
}

export async function isDealBookmarked(dealId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', 'deal')
    .eq('entity_id', dealId)
    .single()

  return !!data
}

export async function isBookmarked(
  entityType: 'patch' | 'news' | 'video',
  entityId: string
): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single()

  return !!data
}

export type VideoMetadata = {
  youtube_id: string
  title: string
  thumbnail_url: string | null
  channel_name: string | null
  video_type: string
  game_name: string | null
  savedAt: string
}

export async function toggleVideoBookmark(
  videoId: string,
  metadata: VideoMetadata
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: existing, error: selectError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', 'video')
    .eq('entity_id', videoId)
    .single()

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[toggleVideoBookmark] Select error:', selectError)
  }

  if (existing) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { error: 'Failed to remove bookmark' }
    }

    revalidatePath('/videos', 'page')
    revalidatePath('/bookmarks', 'page')
    return { success: true, bookmarked: false }
  } else {
    // Check limit before adding
    const canSave = await canUserSave(user.id, supabase)
    if (!canSave.allowed) {
      return { error: canSave.error || 'Save limit reached' }
    }

    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      entity_type: 'video',
      entity_id: videoId,
      metadata: metadata,
    })

    if (error) {
      return { error: `Failed to save video: ${error.message}` }
    }

    revalidatePath('/videos', 'page')
    revalidatePath('/bookmarks', 'page')
    return { success: true, bookmarked: true }
  }
}

export async function getUserVideoBookmarks(): Promise<string[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data } = await supabase
    .from('bookmarks')
    .select('entity_id')
    .eq('user_id', user.id)
    .eq('entity_type', 'video')

  return data?.map(b => b.entity_id) || []
}

export type RecommendationMetadata = {
  game_id: string
  game_name: string
  slug: string
  cover_url: string | null
  reason: string
  why_now: string | null
  recommendation_type: 'return' | 'start' | 'finish' | 'discover'
  savedAt: string
}

export async function toggleRecommendationBookmark(
  gameId: string,
  metadata: RecommendationMetadata
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('[toggleRecommendationBookmark] Not authenticated')
    return { error: 'Not authenticated' }
  }

  console.log('[toggleRecommendationBookmark] Saving for user:', user.id, 'gameId:', gameId)

  const { data: existing, error: selectError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', 'recommendation')
    .eq('entity_id', gameId)
    .single()

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('[toggleRecommendationBookmark] Select error:', selectError)
  }

  if (existing) {
    console.log('[toggleRecommendationBookmark] Removing existing bookmark:', existing.id)
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('[toggleRecommendationBookmark] Delete error:', error)
      return { error: 'Failed to remove bookmark' }
    }

    revalidatePath('/', 'layout')
    return { success: true, bookmarked: false }
  } else {
    // Check limit before adding
    const canSave = await canUserSave(user.id, supabase)
    if (!canSave.allowed) {
      return { error: canSave.error || 'Save limit reached' }
    }

    console.log('[toggleRecommendationBookmark] Creating new bookmark with metadata:', JSON.stringify(metadata))
    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      entity_type: 'recommendation',
      entity_id: gameId,
      metadata: metadata,
    })

    if (error) {
      console.error('[toggleRecommendationBookmark] Insert error:', error)
      return { error: `Failed to save recommendation: ${error.message}` }
    }

    console.log('[toggleRecommendationBookmark] Successfully saved bookmark')
    revalidatePath('/', 'layout')
    return { success: true, bookmarked: true }
  }
}
