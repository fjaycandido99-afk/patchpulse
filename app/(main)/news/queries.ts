import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  logo_url?: string | null
  brand_color?: string | null
  hero_url?: string | null
}

type NewsListItem = {
  id: string
  title: string
  published_at: string
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  source_name: string | null
  source_url: string | null
  image_url: string | null
  game: Game | null
}

type NewsDetail = {
  id: string
  title: string
  published_at: string
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  source_name: string | null
  source_url: string | null
  created_at: string
  game: Game | null
}

type NewsFiltersData = {
  followedGames: Game[]
  availableTopics: string[]
}

type NewsListParams = {
  gameId?: string
  topic?: string
  includeRumors?: boolean
  page?: number
}

type NewsListResult = {
  items: NewsListItem[]
  page: number
  pageSize: number
  hasMore: boolean
}

const PAGE_SIZE = 12

// Upcoming release types (AI-discovered)
export type UpcomingRelease = {
  id: string
  game_id: string
  title: string
  release_type: 'game' | 'dlc' | 'expansion' | 'update' | 'season'
  release_date: string | null
  release_window: string | null
  is_confirmed: boolean
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
  days_until: number | null
}

// Get upcoming releases for followed games (AI-discovered)
export async function getUpcomingReleases(): Promise<UpcomingRelease[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  try {
    // Get followed game IDs
    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', user.id)

    const followedGameIds = userGames?.map((ug) => ug.game_id) || []
    if (followedGameIds.length === 0) return []

    // Get upcoming releases for those games
    const { data, error } = await supabase
      .from('upcoming_releases')
      .select(`
        id,
        game_id,
        title,
        release_type,
        release_date,
        release_window,
        is_confirmed,
        games!inner(id, name, slug, cover_url)
      `)
      .in('game_id', followedGameIds)
      .or(`release_date.gte.${new Date().toISOString().split('T')[0]},release_date.is.null`)
      .order('release_date', { ascending: true, nullsFirst: false })
      .limit(10)

    if (error) {
      // Table might not exist yet
      return []
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (data || []).map((item) => {
      const releaseDate = item.release_date ? new Date(item.release_date) : null
      const daysUntil = releaseDate
        ? Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        id: item.id,
        game_id: item.game_id,
        title: item.title,
        release_type: item.release_type as UpcomingRelease['release_type'],
        release_date: item.release_date,
        release_window: item.release_window,
        is_confirmed: item.is_confirmed,
        game: item.games as unknown as UpcomingRelease['game'],
        days_until: daysUntil,
      }
    })
  } catch {
    // Table doesn't exist yet
    return []
  }
}

// Grouped news types
export type GroupedNewsItem = {
  id: string
  title: string
  published_at: string
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  source_name: string | null
  source_url: string | null
  is_new: boolean
}

export type GameNewsGroup = {
  game: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    cover_url: string | null
    brand_color: string | null
  }
  unreadCount: number
  items: GroupedNewsItem[]
}

export type GroupedNewsResult = {
  groups: GameNewsGroup[]
  lastVisit: string | null
  newItemsCount: number
}

// Get news grouped by game with unread tracking
export async function getNewsGroupedByGame(params: {
  includeRumors?: boolean
  limit?: number
} = {}): Promise<GroupedNewsResult> {
  const supabase = await createClient()
  const { includeRumors = true, limit = 50 } = params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { groups: [], lastVisit: null, newItemsCount: 0 }
  }

  // Get user's last visit time and followed games
  const [profileResult, userGamesResult] = await Promise.all([
    supabase.from('profiles').select('last_news_visit_at').eq('id', user.id).single(),
    supabase.from('user_games').select('game_id').eq('user_id', user.id),
  ])

  const lastVisit = profileResult.data?.last_news_visit_at || null
  const followedGameIds = userGamesResult.data?.map((ug) => ug.game_id) || []

  if (followedGameIds.length === 0) {
    return { groups: [], lastVisit, newItemsCount: 0 }
  }

  // Fetch news with game info
  let query = supabase
    .from('news_items')
    .select(`
      id,
      title,
      published_at,
      summary,
      why_it_matters,
      topics,
      is_rumor,
      source_name,
      source_url,
      game_id,
      games!inner(id, name, slug, logo_url, cover_url, brand_color)
    `)
    .in('game_id', followedGameIds)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!includeRumors) {
    query = query.eq('is_rumor', false)
  }

  const { data: newsItems, error } = await query

  if (error || !newsItems) {
    console.error('Error fetching grouped news:', error)
    return { groups: [], lastVisit, newItemsCount: 0 }
  }

  // Group by game
  const gameMap = new Map<string, GameNewsGroup>()
  let newItemsCount = 0

  for (const item of newsItems) {
    const gameData = item.games as unknown as {
      id: string
      name: string
      slug: string
      logo_url: string | null
      cover_url: string | null
      brand_color: string | null
    }

    const isNew = lastVisit ? new Date(item.published_at) > new Date(lastVisit) : true

    if (isNew) newItemsCount++

    const newsItem: GroupedNewsItem = {
      id: item.id,
      title: item.title,
      published_at: item.published_at,
      summary: item.summary,
      why_it_matters: item.why_it_matters,
      topics: item.topics || [],
      is_rumor: item.is_rumor,
      source_name: item.source_name,
      source_url: item.source_url,
      is_new: isNew,
    }

    if (!gameMap.has(gameData.id)) {
      gameMap.set(gameData.id, {
        game: gameData,
        unreadCount: 0,
        items: [],
      })
    }

    const group = gameMap.get(gameData.id)!
    group.items.push(newsItem)
    if (isNew) group.unreadCount++
  }

  // Sort groups by most recent news
  const groups = Array.from(gameMap.values()).sort((a, b) => {
    const aDate = new Date(a.items[0]?.published_at || 0)
    const bDate = new Date(b.items[0]?.published_at || 0)
    return bDate.getTime() - aDate.getTime()
  })

  return { groups, lastVisit, newItemsCount }
}

// Update last visit timestamp
export async function markNewsVisited(): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('profiles')
    .update({ last_news_visit_at: new Date().toISOString() })
    .eq('id', user.id)
}

export async function getNewsFiltersData(): Promise<NewsFiltersData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let followedGames: Game[] = []

  if (user) {
    const { data: userGames } = await supabase
      .from('user_games')
      .select('games(id, name, slug)')
      .eq('user_id', user.id)

    if (userGames && userGames.length > 0) {
      followedGames = userGames
        .map((ug) => ug.games as unknown as Game)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  let topicsQuery = supabase.from('news_items').select('topics')

  if (followedGames.length > 0) {
    const gameIds = followedGames.map((g) => g.id)
    topicsQuery = topicsQuery.or(
      `game_id.in.(${gameIds.join(',')}),game_id.is.null`
    )
  }

  const { data: newsWithTopics } = await topicsQuery

  const topicSet = new Set<string>()
  if (newsWithTopics) {
    for (const news of newsWithTopics) {
      if (Array.isArray(news.topics)) {
        for (const topic of news.topics) {
          topicSet.add(topic)
        }
      }
    }
  }

  const availableTopics = Array.from(topicSet).sort()

  return {
    followedGames,
    availableTopics,
  }
}

export async function getNewsList(
  params: NewsListParams = {}
): Promise<NewsListResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { gameId, topic, includeRumors = false, page = 1 } = params
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('news_items')
    .select(
      `
      id,
      title,
      published_at,
      summary,
      why_it_matters,
      topics,
      is_rumor,
      source_name,
      source_url,
      game_id,
      games(id, name, slug, cover_url)
    `,
      { count: 'exact' }
    )

  if (gameId) {
    query = query.eq('game_id', gameId)
  } else if (user) {
    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', user.id)

    if (userGames && userGames.length > 0) {
      const followedGameIds = userGames.map((ug) => ug.game_id)
      query = query.or(
        `game_id.in.(${followedGameIds.join(',')}),game_id.is.null`
      )
    }
  }

  if (topic) {
    query = query.contains('topics', [topic])
  }

  if (!includeRumors) {
    query = query.eq('is_rumor', false)
  }

  query = query
    .order('is_rumor', { ascending: true })
    .order('published_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching news:', error)
    return {
      items: [],
      page,
      pageSize: PAGE_SIZE,
      hasMore: false,
    }
  }

  const items: NewsListItem[] = (data || []).map((news) => ({
    id: news.id,
    title: news.title,
    published_at: news.published_at,
    summary: news.summary,
    why_it_matters: news.why_it_matters,
    topics: news.topics,
    is_rumor: news.is_rumor,
    source_name: news.source_name,
    source_url: news.source_url,
    image_url: null,
    game: news.games as unknown as Game | null,
  }))

  const totalCount = count || 0
  const hasMore = offset + items.length < totalCount

  return {
    items,
    page,
    pageSize: PAGE_SIZE,
    hasMore,
  }
}

export async function getNewsById(newsId: string): Promise<NewsDetail> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('news_items')
    .select(
      `
      id,
      title,
      published_at,
      summary,
      why_it_matters,
      topics,
      is_rumor,
      source_name,
      source_url,
      created_at,
      games(id, name, slug, cover_url, logo_url, brand_color, hero_url)
    `
    )
    .eq('id', newsId)
    .single()

  if (error || !data) {
    notFound()
  }

  return {
    id: data.id,
    title: data.title,
    published_at: data.published_at,
    summary: data.summary,
    why_it_matters: data.why_it_matters,
    topics: data.topics,
    is_rumor: data.is_rumor,
    source_name: data.source_name,
    source_url: data.source_url,
    created_at: data.created_at,
    game: data.games as unknown as Game | null,
  }
}

export type RelatedNewsItem = {
  id: string
  title: string
  published_at: string
  is_rumor: boolean
  game_name: string | null
}

export async function getRelatedNews(
  newsId: string,
  gameId: string | null,
  topics: string[],
  limit = 4
): Promise<RelatedNewsItem[]> {
  const supabase = await createClient()

  // First try to get news from the same game
  let query = supabase
    .from('news_items')
    .select('id, title, published_at, is_rumor, games(name)')
    .neq('id', newsId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (gameId) {
    query = query.eq('game_id', gameId)
  }

  const { data } = await query

  // If we don't have enough, get more by topics
  if (!data || data.length < limit) {
    const remaining = limit - (data?.length || 0)
    const existingIds = data?.map((n) => n.id) || []
    existingIds.push(newsId)

    const { data: topicNews } = await supabase
      .from('news_items')
      .select('id, title, published_at, is_rumor, games(name)')
      .not('id', 'in', `(${existingIds.join(',')})`)
      .overlaps('topics', topics)
      .order('published_at', { ascending: false })
      .limit(remaining)

    if (topicNews) {
      data?.push(...topicNews)
    }
  }

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    published_at: item.published_at,
    is_rumor: item.is_rumor,
    game_name: (item.games as unknown as { name: string } | null)?.name || null,
  }))
}
