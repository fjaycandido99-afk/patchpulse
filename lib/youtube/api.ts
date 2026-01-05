'use server'

import { createAdminClient } from '@/lib/supabase/admin'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

type VideoType = 'trailer' | 'clips' | 'gameplay' | 'esports' | 'review' | 'other'

type YouTubeSearchItem = {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelTitle: string
    channelId: string
    publishedAt: string
    thumbnails: {
      high?: { url: string }
      medium?: { url: string }
      default?: { url: string }
    }
  }
}

type YouTubeVideoDetails = {
  id: string
  contentDetails: {
    duration: string // ISO 8601 format like "PT4M13S"
  }
  statistics: {
    viewCount: string
  }
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 3600 + minutes * 60 + seconds
}

// Search keywords for each video type
const TYPE_KEYWORDS: Record<VideoType, string[]> = {
  trailer: ['official trailer', 'trailer', 'cinematic trailer', 'reveal trailer', 'announcement'],
  clips: ['funny moments', 'best clips', 'highlights', 'streamer', 'twitch clips', 'epic moments', 'fails'],
  gameplay: ['gameplay', 'walkthrough', 'let\'s play', 'first look', 'hands on'],
  esports: ['esports', 'tournament', 'championship', 'pro play', 'competitive', 'grand finals'],
  review: ['review', 'analysis', 'is it worth it', 'honest review'],
  other: [],
}

// Official channel IDs for major game publishers (for prioritizing official content)
const OFFICIAL_CHANNELS: Record<string, string[]> = {
  'valorant': ['UCbL5oH1WwKW4K8yw7FpxeBw'], // Valorant
  'league-of-legends': ['UC2t5bjwHdUX4vM2g8TRDq5g'], // League of Legends
  'overwatch': ['UClOf1XXinvZsy4wKPAkro2A'], // PlayOverwatch
  'fortnite': ['UClG8odDC8TS6Zpqk9CGVQiQ'], // Fortnite
  'apex-legends': ['UC0ZV6M2THA81QT9hrVWJG3A'], // Apex Legends
  'call-of-duty': ['UC4vDoW9SuPKpRV66aV-xyNQ'], // Call of Duty
  'destiny-2': ['UCiDJtJKMICpb9B1qf7qjEOA'], // Bungie
  'counter-strike-2': ['UCq1Dy9CKoFxh7f1sJ9VPk-Q'], // CS2
  'dota-2': ['UCq1Dy9CKoFxh7f1sJ9VPk-Q'], // Dota 2
  'genshin-impact': ['UCiS882YPwZt1NfaM0gR0D9Q'], // Genshin Impact
  'minecraft': ['UC1sELGmy5jp5fQUugmuYlXQ'], // Minecraft
  'rocket-league': ['UCYzPXprvl5Y-Sf0g4vX-m6g'], // Rocket League Esports
  'rainbow-six-siege': ['UCWKHac5bjhsUtSnMDFCT-7A'], // Rainbow Six Esports
}

// Search YouTube for videos related to a game
export async function searchGameVideos(
  gameName: string,
  gameSlug: string,
  videoType: VideoType,
  maxResults: number = 5
): Promise<YouTubeSearchItem[]> {
  if (!YOUTUBE_API_KEY) {
    console.error('[YouTube] YOUTUBE_API_KEY not configured')
    return []
  }

  console.log(`[YouTube] Searching for ${gameName} - ${videoType}`)

  // Build search query
  const keywords = TYPE_KEYWORDS[videoType]
  const searchTerms = keywords.length > 0
    ? `${gameName} ${keywords[0]}`
    : gameName

  // Check if we have official channels for this game
  const officialChannels = OFFICIAL_CHANNELS[gameSlug]

  try {
    // Only fetch videos from the last 2 years for relevance
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const params = new URLSearchParams({
      part: 'snippet',
      q: searchTerms,
      type: 'video',
      maxResults: maxResults.toString(),
      order: 'relevance',
      videoDuration: videoType === 'trailer' ? 'short' : 'medium',
      publishedAfter: twoYearsAgo.toISOString(),
      key: YOUTUBE_API_KEY,
    })

    // If we have official channels, prioritize them
    if (officialChannels && officialChannels.length > 0) {
      params.set('channelId', officialChannels[0])
    }

    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`)

    if (!response.ok) {
      console.error('YouTube API error:', response.status, await response.text())
      return []
    }

    const data = await response.json()
    console.log(`[YouTube] Found ${data.items?.length || 0} videos for ${gameName}`)
    return data.items || []
  } catch (error) {
    console.error('[YouTube] Failed to search:', error)
    return []
  }
}

// Get video details (duration, view count)
export async function getVideoDetails(videoIds: string[]): Promise<Map<string, YouTubeVideoDetails>> {
  if (!YOUTUBE_API_KEY || videoIds.length === 0) {
    return new Map()
  }

  try {
    const params = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: videoIds.join(','),
      key: YOUTUBE_API_KEY,
    })

    const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`)

    if (!response.ok) {
      return new Map()
    }

    const data = await response.json()
    const detailsMap = new Map<string, YouTubeVideoDetails>()

    for (const item of data.items || []) {
      detailsMap.set(item.id, item)
    }

    return detailsMap
  } catch (error) {
    console.error('Failed to get video details:', error)
    return new Map()
  }
}

// Fetch and store videos for a game
export async function fetchGameVideos(
  gameId: string,
  gameName: string,
  gameSlug: string,
  videoTypes: VideoType[] = ['trailer', 'clips', 'gameplay', 'esports']
): Promise<{ success: boolean; addedCount: number; error?: string }> {
  const supabase = createAdminClient()
  let addedCount = 0

  for (const videoType of videoTypes) {
    try {
      // Search for videos
      const searchResults = await searchGameVideos(gameName, gameSlug, videoType, 5)

      if (searchResults.length === 0) continue

      // Get video IDs for details
      const videoIds = searchResults.map(v => v.id.videoId)
      const details = await getVideoDetails(videoIds)

      // Insert videos
      for (const video of searchResults) {
        const videoId = video.id.videoId
        const videoDetails = details.get(videoId)

        // Check if already exists
        const { data: existing } = await supabase
          .from('game_videos')
          .select('id')
          .eq('game_id', gameId)
          .eq('youtube_id', videoId)
          .single()

        if (existing) continue

        // Get best thumbnail
        const thumbnail = video.snippet.thumbnails.high?.url ||
                          video.snippet.thumbnails.medium?.url ||
                          video.snippet.thumbnails.default?.url

        const { error } = await supabase
          .from('game_videos')
          .insert({
            game_id: gameId,
            youtube_id: videoId,
            title: video.snippet.title,
            description: video.snippet.description?.slice(0, 500),
            thumbnail_url: thumbnail,
            channel_name: video.snippet.channelTitle,
            channel_id: video.snippet.channelId,
            video_type: videoType,
            published_at: video.snippet.publishedAt,
            view_count: videoDetails ? parseInt(videoDetails.statistics.viewCount) : 0,
            duration_seconds: videoDetails ? parseDuration(videoDetails.contentDetails.duration) : 0,
          })

        if (error) {
          console.error(`[YouTube] Insert error for ${videoId}:`, error.message)
        } else {
          addedCount++
        }
      }

      // Small delay between types to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Failed to fetch ${videoType} videos for ${gameName}:`, error)
    }
  }

  return { success: true, addedCount }
}

// Get cached videos for a game from database
export async function getGameVideos(
  gameId: string,
  videoType?: VideoType,
  limit: number = 10
) {
  const supabase = createAdminClient()

  let query = supabase
    .from('game_videos')
    .select('*')
    .eq('game_id', gameId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (videoType) {
    query = query.eq('video_type', videoType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to get game videos:', error)
    return []
  }

  return data || []
}

// Fetch videos for all popular games (for cron job)
export async function fetchAllGameVideos() {
  const supabase = createAdminClient()

  // Get popular games (with steam_app_id or marked as live service)
  // Limit to 10 games per day to stay within YouTube API quota (10k units/day)
  // Each game uses ~400 units (4 video types × 100 units per search)
  // Rotate through games based on day of year so we cover all games over time
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const offset = (dayOfYear * 10) % 200 // Rotate through ~200 games

  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, slug')
    .or('steam_app_id.not.is.null,is_live_service.eq.true')
    .order('name')
    .range(offset, offset + 9)

  if (error || !games) {
    return { success: false, error: error?.message || 'No games found', totalAdded: 0 }
  }

  let totalAdded = 0
  const errors: string[] = []

  for (const game of games) {
    const result = await fetchGameVideos(game.id, game.name, game.slug)

    if (result.success) {
      totalAdded += result.addedCount
    } else if (result.error) {
      errors.push(`${game.name}: ${result.error}`)
    }

    // Delay between games to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return {
    success: true,
    totalAdded,
    gamesChecked: games.length,
    errors: errors.length > 0 ? errors : undefined
  }
}
