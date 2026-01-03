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
  hero_url?: string | null
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
  image_url: string | null
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

export type Deal = {
  id: string
  title: string
  salePrice: number
  normalPrice: number
  savings: number
  store: string
  thumb: string
  dealUrl: string
  expiresIn: string | null
}

export type HomeFeed = {
  followedGames: FollowedGame[]
  topPatches: PatchNote[]
  userNews: NewsItem[]  // News from followed/backlog games (for hero carousel)
  latestNews: NewsItem[]  // All news (for Latest Headlines grid)
  backlogNudge: BacklogItem | null
  upcomingReleases: UpcomingReleaseItem[]
  upcomingGames: UpcomingGame[]
  newReleases: NewReleaseGame[]
  deals: Deal[]  // Games on sale
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

  // Fetch upcoming games and new releases (global, not user-specific)
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

  // Fetch ALL news (for Latest Headlines grid - not filtered by user's games)
  const { data: allNewsRaw } = await supabase
    .from('news_items')
    .select('*, games(name, slug, cover_url, hero_url, logo_url, brand_color)')
    .order('published_at', { ascending: false })
    .limit(50)

  // Sort all news by date (most recent first), non-rumors prioritized
  let allNews: typeof allNewsRaw = []
  if (allNewsRaw && allNewsRaw.length > 0) {
    allNews = [...allNewsRaw].sort((a, b) => {
      // Non-rumors first
      if (a.is_rumor !== b.is_rumor) return a.is_rumor ? 1 : -1
      // Then by date
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })
  }

  // Fetch deals from database (populated by cron job)
  let deals: Deal[] = []
  try {
    const { data: dealsData } = await supabase
      .from('deals')
      .select('id, title, sale_price, normal_price, discount_percent, header_url, thumb_url, deal_url, store, expires_at')
      .gte('discount_percent', 30)
      .order('discount_percent', { ascending: false })
      .limit(20)

    if (dealsData && dealsData.length > 0) {
      deals = dealsData.map(deal => {
        // Calculate expiration
        let expiresIn: string | null = null
        if (deal.expires_at) {
          const expirationDate = new Date(deal.expires_at)
          const now = new Date()
          const hoursLeft = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60))
          if (hoursLeft > 0) {
            if (hoursLeft < 24) {
              expiresIn = `${hoursLeft}h left`
            } else {
              const daysLeft = Math.floor(hoursLeft / 24)
              expiresIn = `${daysLeft}d left`
            }
          }
        }

        return {
          id: deal.id,
          title: deal.title,
          salePrice: deal.sale_price,
          normalPrice: deal.normal_price,
          savings: deal.discount_percent,
          store: deal.store || 'Steam',
          thumb: deal.header_url || deal.thumb_url || '',
          dealUrl: deal.deal_url,
          expiresIn,
        }
      })
    }
  } catch {
    // Deals table might not exist
  }

  // For guests (no user), return global content only
  if (!user) {
    return {
      followedGames: [],
      topPatches: [],
      userNews: [],
      latestNews: (allNews || []) as NewsItem[],
      backlogNudge: null,
      upcomingReleases: [],
      upcomingGames,
      newReleases,
      deals,
      gamePlatforms: emptyPlatforms,
      seasonalImages: emptySeasonalImages,
    }
  }

  // Get followed games (user_games)
  const { data: userGames } = await supabase
    .from('user_games')
    .select('game_id, games!inner(id, name, slug, cover_url, platforms)')
    .eq('user_id', user.id)

  const followedGames: FollowedGame[] =
    userGames
      ?.map((ug: any) => ug.games as FollowedGame)
      .filter((g): g is FollowedGame => g !== null) || []

  const followedGameIds = followedGames.map((g) => g.id)

  // Get backlog games
  const { data: backlogGames } = await supabase
    .from('backlog_items')
    .select('game_id')
    .eq('user_id', user.id)

  const backlogGameIds = backlogGames?.map((bg) => bg.game_id) || []

  // Combine followed + backlog game IDs (deduplicated)
  const allUserGameIds = [...new Set([...followedGameIds, ...backlogGameIds])]

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

  // Fetch news from followed and backlog games (for hero carousel)
  let userNewsRaw: any[] | null = null
  if (allUserGameIds.length > 0) {
    const { data } = await supabase
      .from('news_items')
      .select('*, games(name, slug, cover_url, hero_url, logo_url, brand_color)')
      .in('game_id', allUserGameIds)
      .order('published_at', { ascending: false })
      .limit(20)
    userNewsRaw = data
  }

  // Sort user news by date (most recent first), non-rumors prioritized
  let userNews: typeof userNewsRaw = []
  if (userNewsRaw && userNewsRaw.length > 0) {
    userNews = [...userNewsRaw].sort((a, b) => {
      // Non-rumors first
      if (a.is_rumor !== b.is_rumor) return a.is_rumor ? 1 : -1
      // Then by date
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })
  }

  // Fetch platforms for user games (gracefully handle if table doesn't exist)
  let gamePlatforms = new Map<string, Platform[]>()
  if (allUserGameIds.length > 0) {
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
        .in('game_id', allUserGameIds)

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

  // Fetch seasonal images for all user games (followed + backlog)
  let seasonalImages = new Map<string, SeasonalImage>()
  if (allUserGameIds.length > 0) {
    try {
      seasonalImages = await batchGetSeasonalImages(allUserGameIds)
    } catch {
      // Table might not exist yet, use empty map
    }
  }

  return {
    followedGames,
    topPatches: patches || [],
    userNews: (userNews || []) as NewsItem[],  // For hero carousel (user's games)
    latestNews: (allNews || []) as NewsItem[],  // For Latest Headlines (all news)
    backlogNudge: backlogData || null,
    upcomingReleases,
    upcomingGames,
    newReleases,
    deals,
    gamePlatforms,
    seasonalImages,
  }
}
