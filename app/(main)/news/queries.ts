import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
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
      games(id, name, slug, cover_url)
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
