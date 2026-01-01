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
  image_url: string | null
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

// Top story type for hero section
export type TopStory = {
  id: string
  title: string
  published_at: string
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  source_name: string | null
  image_url: string | null
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
    hero_url: string | null
    logo_url: string | null
    brand_color: string | null
  } | null
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
  image_url: string | null
  game_cover_url: string | null
  game_hero_url: string | null
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
  topStories: TopStory[]
}

// Get top stories for hero section (most recent important news WITH game images)
export async function getTopStories(limit = 2): Promise<TopStory[]> {
  const supabase = await createClient()

  // Get recent important news that have a game (so they'll have images)
  const { data, error } = await supabase
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
      image_url,
      game_id,
      games!inner(id, name, slug, cover_url, hero_url, logo_url, brand_color)
    `)
    .eq('is_rumor', false)
    .not('game_id', 'is', null) // Only news with a game (so we have images)
    .order('published_at', { ascending: false })
    .limit(limit * 3) // Fetch more to filter

  if (error || !data) {
    return []
  }

  // Prioritize news with major topics and games that have hero images
  const majorTopics = ['Launch', 'DLC', 'Beta', 'Season', 'Update', 'Esports']
  const sorted = [...data].sort((a, b) => {
    // First prioritize items with hero images
    const aHasHero = (a.games as any)?.hero_url ? 2 : 0
    const bHasHero = (b.games as any)?.hero_url ? 2 : 0
    if (aHasHero !== bHasHero) return bHasHero - aHasHero

    // Then prioritize major topics
    const aHasMajor = a.topics?.some((t: string) => majorTopics.includes(t)) ? 1 : 0
    const bHasMajor = b.topics?.some((t: string) => majorTopics.includes(t)) ? 1 : 0
    return bHasMajor - aHasMajor
  })

  return sorted.slice(0, limit).map((item) => ({
    id: item.id,
    title: item.title,
    published_at: item.published_at,
    summary: item.summary,
    why_it_matters: item.why_it_matters,
    topics: item.topics || [],
    is_rumor: item.is_rumor,
    source_name: item.source_name,
    image_url: item.image_url,
    game: item.games as unknown as TopStory['game'],
  }))
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

  // Get user's last visit time (optional)
  let lastVisit: string | null = null
  if (user) {
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('updated_at')
      .eq('id', user.id)
      .single()
    lastVisit = profileData?.updated_at || null
  }

  // Fetch ALL news with game info (not just followed games)
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
      image_url,
      game_id,
      games(id, name, slug, logo_url, cover_url, hero_url, brand_color)
    `)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!includeRumors) {
    query = query.eq('is_rumor', false)
  }

  const { data: newsItems, error } = await query

  if (error || !newsItems) {
    console.error('Error fetching grouped news:', error)
    return { groups: [], lastVisit, newItemsCount: 0, topStories: [] }
  }

  // Fetch top stories in parallel
  const topStories = await getTopStories(2)

  // Group by game (use "general" for news without a game)
  const gameMap = new Map<string, GameNewsGroup>()
  let newItemsCount = 0

  // Default "General News" group for items without a game
  const generalGame = {
    id: 'general',
    name: 'General Gaming',
    slug: 'general',
    logo_url: null,
    cover_url: null,
    brand_color: '#6366f1',
  }

  for (const item of newsItems) {
    const gameData = item.games as unknown as {
      id: string
      name: string
      slug: string
      logo_url: string | null
      cover_url: string | null
      hero_url: string | null
      brand_color: string | null
    } | null

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
      image_url: item.image_url,
      game_cover_url: gameData?.cover_url || null,
      game_hero_url: gameData?.hero_url || null,
    }

    const groupKey = gameData?.id || 'general'
    const groupGame = gameData || generalGame

    if (!gameMap.has(groupKey)) {
      gameMap.set(groupKey, {
        game: groupGame,
        unreadCount: 0,
        items: [],
      })
    }

    const group = gameMap.get(groupKey)!
    group.items.push(newsItem)
    if (isNew) group.unreadCount++
  }

  // Sort groups by most recent news
  const groups = Array.from(gameMap.values()).sort((a, b) => {
    const aDate = new Date(a.items[0]?.published_at || 0)
    const bDate = new Date(b.items[0]?.published_at || 0)
    return bDate.getTime() - aDate.getTime()
  })

  return { groups, lastVisit, newItemsCount, topStories }
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

// Get available news sources for filter
export async function getNewsSources(): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('news_items')
    .select('source_name')
    .not('source_name', 'is', null)
    .order('source_name')

  if (!data) return []

  // Get unique sources
  const sources = [...new Set(data.map(item => item.source_name).filter(Boolean))] as string[]
  return sources.sort()
}

// Get flat news list (no grouping, for simplified news page)
export async function getFlatNewsList(params: {
  includeRumors?: boolean
  source?: string
  limit?: number
} = {}): Promise<{
  id: string
  title: string
  published_at: string
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  source_name: string | null
  image_url: string | null
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
    hero_url: string | null
    logo_url: string | null
  } | null
}[]> {
  const supabase = await createClient()
  const { includeRumors = true, source, limit = 50 } = params

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
      image_url,
      game_id,
      games(id, name, slug, cover_url, hero_url, logo_url)
    `)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!includeRumors) {
    query = query.eq('is_rumor', false)
  }

  if (source) {
    query = query.eq('source_name', source)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching flat news:', error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    published_at: item.published_at,
    summary: item.summary,
    why_it_matters: item.why_it_matters,
    topics: item.topics || [],
    is_rumor: item.is_rumor,
    source_name: item.source_name,
    image_url: item.image_url,
    game: item.games as unknown as {
      id: string
      name: string
      slug: string
      cover_url: string | null
      hero_url: string | null
      logo_url: string | null
    } | null,
  }))
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

  // Filter by specific game if provided
  if (gameId) {
    query = query.eq('game_id', gameId)
  }
  // Otherwise show ALL news (not filtered by followed games)

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
      image_url,
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
    image_url: data.image_url,
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
