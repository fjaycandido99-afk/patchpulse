import { createClient } from '@/lib/supabase/server'

export type ReleaseGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  hero_url: string | null
  release_date: string
  days_since: number
  genre: string | null
  is_live_service: boolean
  platforms: string[]
}

export type ReleasesData = {
  featured: ReleaseGame[]
  all: ReleaseGame[]
  totalCount: number
}

export async function getNewReleases(options: {
  days?: 7 | 14 | 30
  platform?: string
  limit?: number
} = {}): Promise<ReleasesData> {
  const { days = 30, platform, limit = 50 } = options
  const supabase = await createClient()

  const today = new Date()
  const cutoffDate = new Date(today)
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const todayStr = today.toISOString().split('T')[0]
  const cutoffStr = cutoffDate.toISOString().split('T')[0]

  // Build query
  let query = supabase
    .from('games')
    .select('id, name, slug, cover_url, hero_url, release_date, genre, is_live_service, platforms')
    .gte('release_date', cutoffStr)
    .lte('release_date', todayStr)
    .order('release_date', { ascending: false })

  // Platform filter - check if platform is in the platforms array
  if (platform && platform !== 'all') {
    // platforms is a text[] array, filter by contains
    query = query.contains('platforms', [platform])
  }

  const { data, count } = await query.limit(limit)

  const games: ReleaseGame[] = (data || []).map(game => {
    const releaseDate = new Date(game.release_date)
    const daysSince = Math.floor((today.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24))
    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover_url: game.cover_url,
      hero_url: game.hero_url,
      release_date: game.release_date,
      days_since: daysSince,
      genre: game.genre,
      is_live_service: game.is_live_service || false,
      platforms: game.platforms || [],
    }
  })

  // Featured = first 5 games (most recent releases)
  const featured = games.slice(0, 5)

  return {
    featured,
    all: games,
    totalCount: count || games.length,
  }
}

// Get count of games per time period for filter badges
export async function getReleaseCounts(): Promise<{
  last7: number
  last14: number
  last30: number
}> {
  const supabase = await createClient()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const get7 = new Date(today)
  get7.setDate(get7.getDate() - 7)
  const get14 = new Date(today)
  get14.setDate(get14.getDate() - 14)
  const get30 = new Date(today)
  get30.setDate(get30.getDate() - 30)

  const [{ count: count7 }, { count: count14 }, { count: count30 }] = await Promise.all([
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .gte('release_date', get7.toISOString().split('T')[0])
      .lte('release_date', todayStr),
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .gte('release_date', get14.toISOString().split('T')[0])
      .lte('release_date', todayStr),
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .gte('release_date', get30.toISOString().split('T')[0])
      .lte('release_date', todayStr),
  ])

  return {
    last7: count7 || 0,
    last14: count14 || 0,
    last30: count30 || 0,
  }
}
