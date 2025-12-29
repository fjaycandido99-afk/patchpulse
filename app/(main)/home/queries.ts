import { createClient } from '@/lib/supabase/server'
import { batchGetSeasonalImages, type SeasonalImage } from '@/lib/images/seasonal'

type FollowedGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  platforms: string[]
}

export type Platform = {
  id: string
  name: string
  icon_url: string | null
  color: string | null
  sort_order: number
}

type GameInfo = {
  name: string
  slug: string
  cover_url: string | null
  logo_url?: string | null
  brand_color?: string | null
}

type PatchNote = {
  id: string
  game_id: string
  title: string
  published_at: string
  source_url: string | null
  summary_tldr: string | null
  key_changes: any
  tags: string[]
  impact_score: number
  games: GameInfo | null
}

type NewsItem = {
  id: string
  game_id: string | null
  title: string
  published_at: string
  source_name: string | null
  source_url: string | null
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  games: GameInfo | null
}

type BacklogItem = {
  id: string
  game_id: string
  status: string
  progress: number
  last_played_at: string | null
  games: {
    name: string
    slug: string
    cover_url: string | null
  } | null
}

type WishlistItem = {
  id: string
  game_id: string
  games: {
    name: string
    slug: string
    cover_url: string | null
    release_date: string
  } | null
}

export type UpcomingReleaseItem = {
  id: string
  title: string
  release_date: string | null
  release_type: string
  game: { name: string; slug: string; cover_url: string | null }
}

export type UpcomingGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  hero_url: string | null
  release_date: string | null
  days_until: number | null
  platforms: string[]
  genre: string | null
  is_live_service: boolean
}

export type NewReleaseGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  hero_url: string | null
  release_date: string
  days_since: number
  platforms: string[]
  genre: string | null
  is_live_service: boolean
}

export type HomeFeed = {
  followedGames: FollowedGame[]
  topPatches: PatchNote[]
  latestNews: NewsItem[]
  backlogNudge: BacklogItem | null
  upcomingReleases: UpcomingReleaseItem[]
  upcomingGames: UpcomingGame[]
  newReleases: NewReleaseGame[]
  gamePlatforms: Map<string, Platform[]>
  seasonalImages: Map<string, SeasonalImage>
}

export type NewsItemSimple = {
  id: string
  game_id: string | null
  title: string
  published_at: string
  source_name: string | null
  source_url: string | null
  summary: string | null
  is_rumor: boolean
  games: {
    name: string
    slug: string
  } | null
}

export async function getLatestNews(limit = 5): Promise<NewsItemSimple[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: userGames } = await supabase
    .from('user_games')
    .select('game_id')
    .eq('user_id', user.id)

  const followedGameIds = userGames?.map((ug) => ug.game_id) || []

  if (followedGameIds.length === 0) return []

  const { data: news } = await supabase
    .from('news_items')
    .select('id, game_id, title, published_at, source_name, source_url, summary, is_rumor, games(name, slug)')
    .in('game_id', followedGameIds)
    .order('published_at', { ascending: false })
    .limit(limit)

  return (news || []).map((item) => {
    const gameData = item.games as unknown
    return {
      ...item,
      games: Array.isArray(gameData) ? (gameData[0] as { name: string; slug: string } | null) : (gameData as { name: string; slug: string } | null),
    }
  }) as NewsItemSimple[]
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const supabase = await createClient()
  const emptyPlatforms = new Map<string, Platform[]>()
  const emptySeasonalImages = new Map<string, SeasonalImage>()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      followedGames: [],
      topPatches: [],
      latestNews: [],
      backlogNudge: null,
      upcomingReleases: [],
      upcomingGames: [],
      newReleases: [],
      gamePlatforms: emptyPlatforms,
      seasonalImages: emptySeasonalImages,
    }
  }

  const { data: userGames } = await supabase
    .from('user_games')
    .select('game_id, games!inner(id, name, slug, cover_url, platforms)')
    .eq('user_id', user.id)

  const followedGames: FollowedGame[] =
    userGames
      ?.map((ug: any) => ug.games as FollowedGame)
      .filter((g): g is FollowedGame => g !== null) || []

  const followedGameIds = followedGames.map((g) => g.id)

  // Fetch upcoming games (releasing within 1 year) and new releases (last 30 days)
  // These are global, not filtered by followed games
  const today = new Date()
  const oneYearFromNow = new Date(today)
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const todayStr = today.toISOString().split('T')[0]
  const oneYearStr = oneYearFromNow.toISOString().split('T')[0]
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  // Fetch upcoming games (future releases within 1 year)
  const { data: upcomingGamesData } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, hero_url, release_date, platforms, genre, is_live_service')
    .gt('release_date', todayStr)
    .lte('release_date', oneYearStr)
    .order('release_date', { ascending: true })
    .limit(15)

  const upcomingGames: UpcomingGame[] = (upcomingGamesData || []).map(game => {
    const releaseDate = game.release_date ? new Date(game.release_date) : null
    const daysUntil = releaseDate ? Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover_url: game.cover_url,
      hero_url: game.hero_url,
      release_date: game.release_date,
      days_until: daysUntil,
      platforms: game.platforms || [],
      genre: game.genre,
      is_live_service: game.is_live_service || false,
    }
  })

  // Fetch new releases (released in last 30 days)
  const { data: newReleasesData } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, hero_url, release_date, platforms, genre, is_live_service')
    .gte('release_date', thirtyDaysAgoStr)
    .lte('release_date', todayStr)
    .order('release_date', { ascending: false })
    .limit(15)

  const newReleases: NewReleaseGame[] = (newReleasesData || []).map(game => {
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
      platforms: game.platforms || [],
      genre: game.genre,
      is_live_service: game.is_live_service || false,
    }
  })

  // Fetch patches with game info including logo (only if user follows games)
  let patches: any[] = []
  if (followedGameIds.length > 0) {
    const { data: patchData } = await supabase
      .from('patch_notes')
      .select('*, games(name, slug, cover_url, logo_url, brand_color)')
      .in('game_id', followedGameIds)
      .order('impact_score', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(6)
    patches = patchData || []
  }

  // Fetch more news and shuffle for variety on dashboard
  // Include both followed games AND general gaming news (game_id is null)
  let newsQuery = supabase
    .from('news_items')
    .select('*, games(name, slug, cover_url, logo_url, brand_color)')

  if (followedGameIds.length > 0) {
    newsQuery = newsQuery.or(`game_id.in.(${followedGameIds.join(',')}),game_id.is.null`)
  } else {
    // If no followed games, just show general gaming news
    newsQuery = newsQuery.is('game_id', null)
  }

  const { data: newsRaw } = await newsQuery
    .order('published_at', { ascending: false })
    .limit(30) // Fetch more to pick from

  // Shuffle and pick diverse news items (different games, different topics)
  let news: typeof newsRaw = []
  if (newsRaw && newsRaw.length > 0) {
    // Separate by game to ensure variety
    const byGame = new Map<string, typeof newsRaw>()
    for (const item of newsRaw) {
      const gameId = item.game_id || 'general'
      if (!byGame.has(gameId)) byGame.set(gameId, [])
      byGame.get(gameId)!.push(item)
    }

    // Pick 1-2 items from each game, prioritizing non-rumors and recent
    const selected: typeof newsRaw = []
    const shuffledGames = Array.from(byGame.keys()).sort(() => Math.random() - 0.5)

    for (const gameId of shuffledGames) {
      const gameNews = byGame.get(gameId)!
      // Sort: non-rumors first, then by date
      gameNews.sort((a, b) => {
        if (a.is_rumor !== b.is_rumor) return a.is_rumor ? 1 : -1
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      })
      // Take up to 2 items per game
      selected.push(...gameNews.slice(0, 2))
      if (selected.length >= 10) break
    }

    // Final shuffle and limit
    news = selected.sort(() => Math.random() - 0.5).slice(0, 8)
    // Re-sort by date for display order
    news.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  }

  // Fetch platforms for followed games (gracefully handle if table doesn't exist)
  let gamePlatforms = new Map<string, Platform[]>()
  if (followedGameIds.length > 0) {
    try {
      const { data: platformData } = await supabase
        .from('game_platforms')
        .select(`
          game_id,
          platforms (
            id,
            name,
            icon_url,
            color,
            sort_order
          )
        `)
        .in('game_id', followedGameIds)

      if (platformData) {
        for (const item of platformData as any[]) {
          const gameId = item.game_id as string
          if (!gamePlatforms.has(gameId)) {
            gamePlatforms.set(gameId, [])
          }
          if (item.platforms) {
            gamePlatforms.get(gameId)!.push(item.platforms as Platform)
          }
        }
        // Sort platforms
        for (const [, platforms] of gamePlatforms) {
          platforms.sort((a, b) => a.sort_order - b.sort_order)
        }
      }
    } catch {
      // Table doesn't exist yet, use empty map
    }
  }

  const { data: backlogData } = await (supabase as any)
    .from('backlog_items')
    .select('*, games(name, slug, cover_url)')
    .eq('user_id', user.id)
    .in('status', ['playing', 'paused'])
    .order('last_played_at', { ascending: true, nullsFirst: false })
    .order('progress', { ascending: false })
    .limit(1)
    .single()

  // Get upcoming releases for followed games
  let upcomingReleases: Array<{
    id: string
    title: string
    release_date: string | null
    release_type: string
    game: { name: string; slug: string; cover_url: string | null }
  }> = []
  if (followedGameIds.length > 0) {
    try {
      const { data: releasesData } = await supabase
        .from('upcoming_releases')
        .select('id, title, release_date, release_type, games!inner(name, slug, cover_url)')
        .in('game_id', followedGameIds)
        .or(`release_date.gte.${new Date().toISOString().split('T')[0]},release_date.is.null`)
        .order('release_date', { ascending: true, nullsFirst: false })
        .limit(5)

      upcomingReleases = (releasesData || []).map((r) => ({
        id: r.id,
        title: r.title,
        release_date: r.release_date,
        release_type: r.release_type,
        game: r.games as unknown as { name: string; slug: string; cover_url: string | null },
      }))
    } catch {
      // Table doesn't exist yet
    }
  }

  // Fetch seasonal images for all followed games
  let seasonalImages = new Map<string, SeasonalImage>()
  if (followedGameIds.length > 0) {
    try {
      seasonalImages = await batchGetSeasonalImages(followedGameIds)
    } catch {
      // Table might not exist yet, use empty map
    }
  }

  return {
    followedGames,
    topPatches: patches || [],
    latestNews: (news || []) as NewsItem[],
    backlogNudge: backlogData || null,
    upcomingReleases,
    upcomingGames,
    newReleases,
    gamePlatforms,
    seasonalImages,
  }
}
