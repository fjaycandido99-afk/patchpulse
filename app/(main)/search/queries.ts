import { createClient } from '@/lib/supabase/server'

export type SearchCategory = 'all' | 'games' | 'patches' | 'news'

export type GameResult = {
  id: string
  name: string
  slug: string
  cover_url: string | null
}

export type PatchResult = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  impact_score: number
  game: {
    id: string
    name: string
    cover_url: string | null
  }
}

export type NewsResult = {
  id: string
  title: string
  published_at: string
  summary: string | null
  source_name: string | null
  is_rumor: boolean
  game: {
    id: string
    name: string
    cover_url: string | null
  } | null
}

export type SearchResults = {
  games: GameResult[]
  patches: PatchResult[]
  news: NewsResult[]
  query: string
  category: SearchCategory
}

const RESULTS_LIMIT = 20

export async function search(
  query: string,
  category: SearchCategory = 'all'
): Promise<SearchResults> {
  const supabase = await createClient()
  const searchTerm = `%${query}%`

  const results: SearchResults = {
    games: [],
    patches: [],
    news: [],
    query,
    category,
  }

  if (!query.trim()) {
    return results
  }

  // Search games
  if (category === 'all' || category === 'games') {
    const { data: games } = await supabase
      .from('games')
      .select('id, name, slug, cover_url')
      .ilike('name', searchTerm)
      .order('name')
      .limit(category === 'games' ? RESULTS_LIMIT : 5)

    results.games = games || []
  }

  // Search patches
  if (category === 'all' || category === 'patches') {
    const { data: patches } = await supabase
      .from('patch_notes')
      .select(`
        id,
        title,
        published_at,
        summary_tldr,
        impact_score,
        games!inner(id, name, cover_url)
      `)
      .ilike('title', searchTerm)
      .order('published_at', { ascending: false })
      .limit(category === 'patches' ? RESULTS_LIMIT : 5)

    results.patches = (patches || []).map((patch) => ({
      id: patch.id,
      title: patch.title,
      published_at: patch.published_at,
      summary_tldr: patch.summary_tldr,
      impact_score: patch.impact_score,
      game: patch.games as unknown as { id: string; name: string; cover_url: string | null },
    }))
  }

  // Search news
  if (category === 'all' || category === 'news') {
    const { data: news } = await supabase
      .from('news')
      .select(`
        id,
        title,
        published_at,
        summary,
        source_name,
        is_rumor,
        games(id, name, cover_url)
      `)
      .ilike('title', searchTerm)
      .order('published_at', { ascending: false })
      .limit(category === 'news' ? RESULTS_LIMIT : 5)

    results.news = (news || []).map((item) => ({
      id: item.id,
      title: item.title,
      published_at: item.published_at,
      summary: item.summary,
      source_name: item.source_name,
      is_rumor: item.is_rumor,
      game: item.games as unknown as { id: string; name: string; cover_url: string | null } | null,
    }))
  }

  return results
}
