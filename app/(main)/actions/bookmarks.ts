'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  entityType: 'patch' | 'news',
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
