import { createClient } from '@/lib/supabase/server'
import type { DealMetadata, RecommendationMetadata, VideoMetadata } from '../actions/bookmarks'

export type BookmarkedDeal = {
  id: string
  entity_id: string
  created_at: string
  metadata: DealMetadata
}

export type BookmarkedPatch = {
  id: string
  entity_id: string
  created_at: string
  patch: {
    id: string
    title: string
    summary_tldr: string | null
    published_at: string
    impact_score: number
    game: { id: string; name: string; cover_url: string | null } | null
  }
}

export type BookmarkedNews = {
  id: string
  entity_id: string
  created_at: string
  news: {
    id: string
    title: string
    summary: string | null
    published_at: string
    is_rumor: boolean
    image_url: string | null
    game: { id: string; name: string; cover_url: string | null } | null
  }
}

export async function getBookmarkedPatches(): Promise<BookmarkedPatch[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // First get the bookmarks
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('id, entity_id, created_at')
    .eq('user_id', user.id)
    .eq('entity_type', 'patch')
    .order('created_at', { ascending: false })

  if (bookmarksError || !bookmarks || bookmarks.length === 0) {
    if (bookmarksError) console.error('Error fetching bookmarks:', bookmarksError)
    return []
  }

  // Then fetch the patches separately
  const patchIds = bookmarks.map(b => b.entity_id)
  const { data: patches, error: patchesError } = await supabase
    .from('patch_notes')
    .select(`
      id,
      title,
      summary_tldr,
      published_at,
      impact_score,
      games(id, name, cover_url)
    `)
    .in('id', patchIds)

  if (patchesError) {
    console.error('Error fetching patches:', patchesError)
    return []
  }

  // Create a map for quick lookup
  const patchMap = new Map(patches?.map(p => [p.id, p]) || [])

  const results: BookmarkedPatch[] = []

  for (const bookmark of bookmarks) {
    const patchData = patchMap.get(bookmark.entity_id)
    if (!patchData) continue

    const gameData = Array.isArray(patchData.games) ? patchData.games[0] : patchData.games

    results.push({
      id: bookmark.id,
      entity_id: bookmark.entity_id,
      created_at: bookmark.created_at,
      patch: {
        id: patchData.id,
        title: patchData.title,
        summary_tldr: patchData.summary_tldr,
        published_at: patchData.published_at,
        impact_score: patchData.impact_score,
        game: gameData || null
      }
    })
  }

  return results
}

export async function getBookmarkedNews(): Promise<BookmarkedNews[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // First get the bookmarks
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from('bookmarks')
    .select('id, entity_id, created_at')
    .eq('user_id', user.id)
    .eq('entity_type', 'news')
    .order('created_at', { ascending: false })

  if (bookmarksError || !bookmarks || bookmarks.length === 0) {
    if (bookmarksError) console.error('Error fetching bookmarks:', bookmarksError)
    return []
  }

  // Then fetch the news items separately
  const newsIds = bookmarks.map(b => b.entity_id)
  const { data: newsItems, error: newsError } = await supabase
    .from('news_items')
    .select(`
      id,
      title,
      summary,
      published_at,
      is_rumor,
      image_url,
      games(id, name, cover_url)
    `)
    .in('id', newsIds)

  if (newsError) {
    console.error('Error fetching news:', newsError)
    return []
  }

  // Create a map for quick lookup
  const newsMap = new Map(newsItems?.map(n => [n.id, n]) || [])

  const results: BookmarkedNews[] = []

  for (const bookmark of bookmarks) {
    const newsData = newsMap.get(bookmark.entity_id)
    if (!newsData) continue

    const gameData = Array.isArray(newsData.games) ? newsData.games[0] : newsData.games

    results.push({
      id: bookmark.id,
      entity_id: bookmark.entity_id,
      created_at: bookmark.created_at,
      news: {
        id: newsData.id,
        title: newsData.title,
        summary: newsData.summary,
        published_at: newsData.published_at,
        is_rumor: newsData.is_rumor,
        image_url: (newsData as any).image_url || null,
        game: gameData || null
      }
    })
  }

  return results
}

export async function getBookmarkedDeals(): Promise<BookmarkedDeal[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('id, entity_id, created_at, metadata')
    .eq('user_id', user.id)
    .eq('entity_type', 'deal')
    .order('created_at', { ascending: false })

  if (error || !bookmarks) {
    if (error) console.error('Error fetching deal bookmarks:', error)
    return []
  }

  // Get current deal prices from the deals table
  const dealIds = bookmarks.filter(b => b.metadata).map(b => b.entity_id)

  let currentDeals: Map<string, { sale_price: number; discount_percent: number }> = new Map()

  if (dealIds.length > 0) {
    const { data: activeDeals } = await supabase
      .from('deals')
      .select('id, sale_price, discount_percent')
      .in('id', dealIds)

    if (activeDeals) {
      currentDeals = new Map(activeDeals.map(d => [d.id, { sale_price: d.sale_price, discount_percent: d.discount_percent }]))
    }
  }

  return bookmarks
    .filter(b => b.metadata)
    .map(b => {
      const savedMetadata = b.metadata as DealMetadata
      const currentDeal = currentDeals.get(b.entity_id)

      // If deal is still active, use current price; otherwise mark as ended
      if (currentDeal) {
        return {
          id: b.id,
          entity_id: b.entity_id,
          created_at: b.created_at,
          metadata: {
            ...savedMetadata,
            salePrice: currentDeal.sale_price,
            savings: currentDeal.discount_percent,
            saleEnded: false,
          },
        }
      } else {
        // Sale ended - show original price
        return {
          id: b.id,
          entity_id: b.entity_id,
          created_at: b.created_at,
          metadata: {
            ...savedMetadata,
            salePrice: savedMetadata.normalPrice, // Revert to normal price
            savings: 0,
            saleEnded: true,
          },
        }
      }
    })
}

export type BookmarkedRecommendation = {
  id: string
  entity_id: string
  created_at: string
  metadata: RecommendationMetadata
}

export async function getBookmarkedRecommendations(): Promise<BookmarkedRecommendation[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('id, entity_id, created_at, metadata')
    .eq('user_id', user.id)
    .eq('entity_type', 'recommendation')
    .order('created_at', { ascending: false })

  if (error || !bookmarks) {
    if (error) console.error('Error fetching recommendation bookmarks:', error)
    return []
  }

  return bookmarks
    .filter(b => b.metadata)
    .map(b => ({
      id: b.id,
      entity_id: b.entity_id,
      created_at: b.created_at,
      metadata: b.metadata as RecommendationMetadata,
    }))
}

export type BookmarkedVideo = {
  id: string
  entity_id: string
  created_at: string
  metadata: VideoMetadata
}

export async function getBookmarkedVideos(): Promise<BookmarkedVideo[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('id, entity_id, created_at, metadata')
    .eq('user_id', user.id)
    .eq('entity_type', 'video')
    .order('created_at', { ascending: false })

  if (error || !bookmarks) {
    if (error) console.error('Error fetching video bookmarks:', error)
    return []
  }

  return bookmarks
    .filter(b => b.metadata)
    .map(b => ({
      id: b.id,
      entity_id: b.entity_id,
      created_at: b.created_at,
      metadata: b.metadata as VideoMetadata,
    }))
}
