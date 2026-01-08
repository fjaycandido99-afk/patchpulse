'use server'

import { createClient } from '@/lib/supabase/server'

type VideoType = 'trailer' | 'clips' | 'gameplay' | 'esports' | 'review' | 'other'

export type VideoWithGame = {
  id: string
  youtube_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  channel_name: string | null
  video_type: VideoType
  published_at: string | null
  view_count: number
  duration_seconds: number
  is_featured: boolean
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
    logo_url: string | null
  } | null
}

export async function getVideos({
  videoType,
  gameId,
  limit = 50,
  offset = 0,
}: {
  videoType?: VideoType
  gameId?: string
  limit?: number
  offset?: number
} = {}): Promise<VideoWithGame[]> {
  const supabase = await createClient()

  let query = supabase
    .from('game_videos')
    .select(`
      id,
      youtube_id,
      title,
      description,
      thumbnail_url,
      channel_name,
      video_type,
      published_at,
      view_count,
      duration_seconds,
      is_featured,
      created_at,
      game:games!game_id (
        id,
        name,
        slug,
        cover_url,
        logo_url
      )
    `)
    .order('created_at', { ascending: false }) // Newly fetched videos first
    .range(offset, offset + limit - 1)

  if (videoType) {
    query = query.eq('video_type', videoType)
  }

  if (gameId) {
    query = query.eq('game_id', gameId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch videos:', error)
    return []
  }

  // Transform the data to match our type (Supabase returns game as array for joins)
  return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getFeaturedVideos(limit = 6): Promise<VideoWithGame[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('game_videos')
    .select(`
      id,
      youtube_id,
      title,
      description,
      thumbnail_url,
      channel_name,
      video_type,
      published_at,
      view_count,
      duration_seconds,
      is_featured,
      game:games!game_id (
        id,
        name,
        slug,
        cover_url,
        logo_url
      )
    `)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch featured videos:', error)
    return []
  }

  return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getTrendingVideos(limit = 10): Promise<VideoWithGame[]> {
  const supabase = await createClient()

  // Get top videos by view count from last 6 months for relevance
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data, error } = await supabase
    .from('game_videos')
    .select(`
      id,
      youtube_id,
      title,
      description,
      thumbnail_url,
      channel_name,
      video_type,
      published_at,
      view_count,
      duration_seconds,
      is_featured,
      game:games!game_id (
        id,
        name,
        slug,
        cover_url,
        logo_url
      )
    `)
    .gte('published_at', sixMonthsAgo.toISOString())
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch trending videos:', error)
    return []
  }

  return (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

export async function getVideoTypes(): Promise<{ type: VideoType; count: number }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('game_videos')
    .select('video_type')

  if (error || !data) {
    return []
  }

  // Count by type
  const counts = data.reduce((acc, item) => {
    const type = item.video_type as VideoType
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<VideoType, number>)

  return Object.entries(counts)
    .map(([type, count]) => ({ type: type as VideoType, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getGamesWithVideos(): Promise<{ id: string; name: string; videoCount: number }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('game_videos')
    .select(`
      game_id,
      game:games!game_id (
        id,
        name
      )
    `)

  if (error || !data) {
    return []
  }

  // Count videos per game
  const gameMap = new Map<string, { name: string; count: number }>()

  for (const item of data) {
    if (item.game && item.game_id) {
      // Handle array from Supabase join
      const gameData = Array.isArray(item.game) ? item.game[0] : item.game
      if (!gameData) continue

      const game = gameData as { id: string; name: string }
      const existing = gameMap.get(game.id)
      if (existing) {
        existing.count++
      } else {
        gameMap.set(game.id, { name: game.name, count: 1 })
      }
    }
  }

  return Array.from(gameMap.entries())
    .map(([id, { name, count }]) => ({ id, name, videoCount: count }))
    .sort((a, b) => b.videoCount - a.videoCount)
    .slice(0, 20) // Top 20 games
}

// Get random videos for home page (shuffled on each request)
export async function getRandomVideos(limit = 6): Promise<VideoWithGame[]> {
  const supabase = await createClient()

  // Fetch most recent videos, then shuffle
  const { data, error } = await supabase
    .from('game_videos')
    .select(`
      id,
      youtube_id,
      title,
      description,
      thumbnail_url,
      channel_name,
      video_type,
      published_at,
      view_count,
      duration_seconds,
      is_featured,
      created_at,
      game:games!game_id (
        id,
        name,
        slug,
        cover_url,
        logo_url
      )
    `)
    .order('created_at', { ascending: false }) // Get newest fetched videos
    .limit(50) // Fetch 50, then shuffle and take 'limit'

  if (error || !data) {
    console.error('Failed to fetch random videos:', error)
    return []
  }

  // Shuffle array using Fisher-Yates algorithm
  const shuffled = [...data]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, limit).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]
}

// Get personalized "For You" videos based on user's backlog and followed games
export async function getForYouVideos(limit = 50): Promise<VideoWithGame[]> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Fallback to trending for non-authenticated users
    return getTrendingVideos(limit)
  }

  // Get user's backlog game IDs
  const { data: backlogItems } = await supabase
    .from('backlog_items')
    .select('game_id')
    .eq('user_id', user.id)

  // Get user's followed game IDs
  const { data: followedGames } = await supabase
    .from('user_games')
    .select('game_id')
    .eq('user_id', user.id)

  // Combine and deduplicate game IDs
  const gameIds = new Set<string>()
  backlogItems?.forEach(item => item.game_id && gameIds.add(item.game_id))
  followedGames?.forEach(item => item.game_id && gameIds.add(item.game_id))

  if (gameIds.size === 0) {
    // User has no games, fallback to trending
    return getTrendingVideos(limit)
  }

  // Fetch videos for user's games
  const { data, error } = await supabase
    .from('game_videos')
    .select(`
      id,
      youtube_id,
      title,
      description,
      thumbnail_url,
      channel_name,
      video_type,
      published_at,
      view_count,
      duration_seconds,
      is_featured,
      created_at,
      game:games!game_id (
        id,
        name,
        slug,
        cover_url,
        logo_url
      )
    `)
    .in('game_id', Array.from(gameIds))
    .order('created_at', { ascending: false }) // Newly fetched videos first
    .limit(limit)

  if (error) {
    console.error('Failed to fetch For You videos:', error)
    return getTrendingVideos(limit)
  }

  const personalizedVideos = (data || []).map((item) => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game,
  })) as VideoWithGame[]

  // If user has few/no personalized videos, supplement with trending
  if (personalizedVideos.length < 10) {
    const trending = await getTrendingVideos(limit - personalizedVideos.length)
    // Merge, avoiding duplicates
    const seenIds = new Set(personalizedVideos.map(v => v.id))
    const additionalVideos = trending.filter(v => !seenIds.has(v.id))
    return [...personalizedVideos, ...additionalVideos].slice(0, limit)
  }

  return personalizedVideos
}
