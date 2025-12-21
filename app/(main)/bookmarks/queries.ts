import { createClient } from '@/lib/supabase/server'

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

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      entity_id,
      created_at,
      patch:patch_notes!entity_id(
        id,
        title,
        summary_tldr,
        published_at,
        impact_score,
        game:games(id, name, cover_url)
      )
    `)
    .eq('user_id', user.id)
    .eq('entity_type', 'patch')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarked patches:', error)
    return []
  }

  const results: BookmarkedPatch[] = []

  for (const item of data || []) {
    const patchData = Array.isArray(item.patch) ? item.patch[0] : item.patch
    if (!patchData) continue

    const gameData = Array.isArray(patchData.game) ? patchData.game[0] : patchData.game

    results.push({
      id: item.id,
      entity_id: item.entity_id,
      created_at: item.created_at,
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

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      entity_id,
      created_at,
      news:news_items!entity_id(
        id,
        title,
        summary,
        published_at,
        is_rumor,
        game:games(id, name, cover_url)
      )
    `)
    .eq('user_id', user.id)
    .eq('entity_type', 'news')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarked news:', error)
    return []
  }

  const results: BookmarkedNews[] = []

  for (const item of data || []) {
    const newsData = Array.isArray(item.news) ? item.news[0] : item.news
    if (!newsData) continue

    const gameData = Array.isArray(newsData.game) ? newsData.game[0] : newsData.game

    results.push({
      id: item.id,
      entity_id: item.entity_id,
      created_at: item.created_at,
      news: {
        id: newsData.id,
        title: newsData.title,
        summary: newsData.summary,
        published_at: newsData.published_at,
        is_rumor: newsData.is_rumor,
        game: gameData || null
      }
    })
  }

  return results
}
