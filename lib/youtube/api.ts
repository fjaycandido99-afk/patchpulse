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

// Games that have significant esports scenes - only fetch esports content for these
const ESPORTS_GAMES = new Set([
  'valorant', 'league-of-legends', 'counter-strike-2', 'dota-2',
  'overwatch', 'apex-legends', 'rocket-league', 'rainbow-six-siege',
  'fortnite', 'call-of-duty', 'street-fighter-6', 'tekken-8',
  'super-smash-bros-ultimate', 'starcraft-2'
])

// Live service games that always have high player counts (reduce their score weight)
const LIVE_SERVICE_SLUGS = new Set([
  'fortnite', 'league-of-legends', 'valorant', 'counter-strike-2',
  'dota-2', 'apex-legends', 'overwatch', 'destiny-2', 'warframe',
  'genshin-impact', 'call-of-duty-warzone', 'pubg', 'roblox'
])

// Search YouTube for videos related to a game
export async function searchGameVideos(
  gameName: string,
  gameSlug: string,
  videoType: VideoType,
  maxResults: number = 5,
  options?: { publishedAfter?: Date }
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
    // Default: 2 years for general content, custom for specific types
    let publishedAfter = options?.publishedAfter
    if (!publishedAfter) {
      publishedAfter = new Date()
      publishedAfter.setFullYear(publishedAfter.getFullYear() - 2)
    }

    const params = new URLSearchParams({
      part: 'snippet',
      q: searchTerms,
      type: 'video',
      maxResults: maxResults.toString(),
      order: 'relevance',
      videoDuration: videoType === 'trailer' ? 'short' : 'medium',
      publishedAfter: publishedAfter.toISOString(),
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
    // Skip esports for games without significant esports scenes
    if (videoType === 'esports' && !ESPORTS_GAMES.has(gameSlug)) {
      console.log(`[YouTube] Skipping esports for ${gameName} - not an esports game`)
      continue
    }

    try {
      // Trailers should be from last 2 months to keep them fresh
      let searchOptions: { publishedAfter?: Date } | undefined
      if (videoType === 'trailer') {
        const twoMonthsAgo = new Date()
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
        searchOptions = { publishedAfter: twoMonthsAgo }
      }

      // Search for videos
      const searchResults = await searchGameVideos(gameName, gameSlug, videoType, 5, searchOptions)

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

// Search terms for viral/general gaming content (not game-specific)
const VIRAL_SEARCH_TERMS = [
  'gaming funny moments viral',
  'streamer gaming highlights',
  'game news this week',
  'gaming viral clips',
  'best gaming moments',
]

// Fetch viral/general gaming videos (not tied to specific games)
export async function fetchViralGamingVideos(): Promise<{ success: boolean; addedCount: number }> {
  if (!YOUTUBE_API_KEY) {
    return { success: false, addedCount: 0 }
  }

  const supabase = createAdminClient()
  let addedCount = 0

  // Pick 2 random search terms to stay within quota
  const shuffled = [...VIRAL_SEARCH_TERMS].sort(() => Math.random() - 0.5)
  const selectedTerms = shuffled.slice(0, 2)

  for (const searchTerm of selectedTerms) {
    try {
      // Only fetch videos from the last month for viral content
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const params = new URLSearchParams({
        part: 'snippet',
        q: searchTerm,
        type: 'video',
        maxResults: '5',
        order: 'viewCount', // Sort by views for viral content
        videoDuration: 'medium',
        publishedAfter: oneMonthAgo.toISOString(),
        key: YOUTUBE_API_KEY,
      })

      const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`)
      if (!response.ok) continue

      const data = await response.json()
      const videos = data.items || []

      if (videos.length === 0) continue

      // Get video details
      const videoIds = videos.map((v: YouTubeSearchItem) => v.id.videoId)
      const details = await getVideoDetails(videoIds)

      // Insert videos (without game_id - these are general gaming content)
      for (const video of videos as YouTubeSearchItem[]) {
        const videoId = video.id.videoId
        const videoDetails = details.get(videoId)

        // Check if already exists
        const { data: existing } = await supabase
          .from('game_videos')
          .select('id')
          .eq('youtube_id', videoId)
          .single()

        if (existing) continue

        const thumbnail = video.snippet.thumbnails.high?.url ||
                          video.snippet.thumbnails.medium?.url ||
                          video.snippet.thumbnails.default?.url

        const { error } = await supabase
          .from('game_videos')
          .insert({
            game_id: null, // No specific game - general content
            youtube_id: videoId,
            title: video.snippet.title,
            description: video.snippet.description?.slice(0, 500),
            thumbnail_url: thumbnail,
            channel_name: video.snippet.channelTitle,
            channel_id: video.snippet.channelId,
            video_type: 'clips', // Categorize as clips
            published_at: video.snippet.publishedAt,
            view_count: videoDetails ? parseInt(videoDetails.statistics.viewCount) : 0,
            duration_seconds: videoDetails ? parseDuration(videoDetails.contentDetails.duration) : 0,
          })

        if (!error) {
          addedCount++
        }
      }

      // Small delay between searches
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`[YouTube] Failed to fetch viral content for "${searchTerm}":`, error)
    }
  }

  console.log(`[YouTube] Added ${addedCount} viral/general gaming videos`)
  return { success: true, addedCount }
}

// Fetch videos for all popular games (for cron job)
export async function fetchAllGameVideos() {
  const supabase = createAdminClient()

  // Get games that are popular - combining user engagement + Steam player counts
  // Quota breakdown per run:
  // - 4 games × ~300 units (3 types avg - esports skipped for most) = 1,200 units
  // - 2 viral searches × 100 units = 200 units
  // Total: ~1,400 units per run × 4 runs/day = 5,600 units/day (well under 10k limit)

  // Get all games with Steam App IDs for player count check
  const { data: steamGames } = await supabase
    .from('games')
    .select('id, name, slug, steam_app_id')
    .not('steam_app_id', 'is', null)
    .limit(100)

  // Get user engagement data
  const { data: backlogItems } = await supabase
    .from('backlog_items')
    .select('game_id')

  const { data: followedGames } = await supabase
    .from('user_games')
    .select('game_id')

  // Build popularity score combining multiple signals
  const gameScores = new Map<string, { score: number; game: { id: string; name: string; slug: string; steam_app_id: number | null; is_live_service?: boolean } }>()

  // Add Steam games to map
  steamGames?.forEach(game => {
    if (game.steam_app_id) {
      const isLiveService = LIVE_SERVICE_SLUGS.has(game.slug)
      gameScores.set(game.id, {
        score: 0,
        game: { id: game.id, name: game.name, slug: game.slug, steam_app_id: game.steam_app_id, is_live_service: isLiveService }
      })
    }
  })

  // Add user engagement scores (equal weight for backlog and followed)
  backlogItems?.forEach(item => {
    if (item.game_id && gameScores.has(item.game_id)) {
      const entry = gameScores.get(item.game_id)!
      entry.score += 5 // Backlog = 5 points
    }
  })

  followedGames?.forEach(item => {
    if (item.game_id && gameScores.has(item.game_id)) {
      const entry = gameScores.get(item.game_id)!
      entry.score += 5 // Following = 5 points
    }
  })

  // Fetch Steam player counts for top candidates (limit API calls)
  const topCandidates = Array.from(gameScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 30) // Check top 30 by engagement

  // Fetch player counts in parallel
  const playerCountPromises = topCandidates
    .filter(c => c.game.steam_app_id)
    .map(async (candidate) => {
      try {
        const response = await fetch(
          `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${candidate.game.steam_app_id}`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.response?.player_count) {
            // Live service games get reduced weight since they always have high counts
            // Non-live service games get full weight to surface trending games
            const playerCount = data.response.player_count
            if (candidate.game.is_live_service) {
              // Live service: 1 point per 10,000 players (reduced 10x)
              candidate.score += Math.floor(playerCount / 10000)
            } else {
              // Regular games: 1 point per 1,000 players (full weight)
              candidate.score += Math.floor(playerCount / 1000)
            }
          }
        }
      } catch {
        // Ignore errors, keep existing score
      }
    })

  await Promise.all(playerCountPromises)

  // Sort by final score and pick top 4 (reduced from 5 to make room for viral content)
  const sortedGames = Array.from(gameScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) // Top 20 most popular

  // Rotate through top games based on hour to cover variety
  const hoursOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 3600000)
  const offset = (hoursOfYear * 4) % Math.max(sortedGames.length, 1)

  let selectedGames = sortedGames.slice(offset, offset + 4).map(g => g.game)

  // Wrap around if needed
  if (selectedGames.length < 4 && sortedGames.length > 0) {
    const remaining = 4 - selectedGames.length
    selectedGames.push(...sortedGames.slice(0, remaining).map(g => g.game))
  }

  // Fallback to live service games if no data
  if (selectedGames.length === 0) {
    const { data, error } = await supabase
      .from('games')
      .select('id, name, slug')
      .eq('is_live_service', true)
      .limit(4)

    if (error) {
      return { success: false, error: error.message, totalAdded: 0 }
    }
    // Map to include required properties for type compatibility
    selectedGames = (data || []).map(g => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      steam_app_id: null
    }))
  }

  const games = selectedGames

  if (games.length === 0) {
    return { success: false, error: 'No games found', totalAdded: 0 }
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

  // Also fetch viral/general gaming content
  const viralResult = await fetchViralGamingVideos()
  totalAdded += viralResult.addedCount

  return {
    success: true,
    totalAdded,
    gamesChecked: games.length,
    viralVideosAdded: viralResult.addedCount,
    errors: errors.length > 0 ? errors : undefined
  }
}
