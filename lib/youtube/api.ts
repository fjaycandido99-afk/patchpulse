'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Read API key at runtime (not module load time) so dotenv can configure it first
function getYouTubeApiKey(): string | undefined {
  return process.env.YOUTUBE_API_KEY
}
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

// Search keywords for each video type - all gaming specific
const TYPE_KEYWORDS: Record<VideoType, string[]> = {
  trailer: ['official trailer', 'reveal trailer', 'announcement trailer', 'launch trailer', 'gameplay trailer'],
  clips: ['gaming shorts', 'game clips shorts', 'gaming funny shorts', 'streamer shorts', 'gaming moments shorts', 'viral gaming shorts'],
  gameplay: ['gaming top 10', 'best gaming plays', 'game highlights compilation', 'gaming montage', 'video game compilation'],
  esports: ['esports tournament highlights', 'gaming grand finals', 'esports championship', 'pro gaming', 'competitive gaming'],
  review: ['game review', 'video game review', 'gaming review', 'is it worth buying'],
  other: [],
}

// Duration constraints for each video type (in seconds)
const TYPE_DURATION: Record<VideoType, { min: number; max: number; youtubeFilter: 'short' | 'medium' | 'long' | 'any' }> = {
  trailer: { min: 60, max: 300, youtubeFilter: 'medium' },       // 1-5 min, proper trailers (no Shorts)
  clips: { min: 15, max: 300, youtubeFilter: 'any' },            // 15 sec - 5 min (Shorts + longer clips mix)
  gameplay: { min: 300, max: 1200, youtubeFilter: 'medium' },    // 5-20 min (top 10s, compilations)
  esports: { min: 300, max: 1800, youtubeFilter: 'medium' },     // 5-30 min (tournament highlights)
  review: { min: 300, max: 1800, youtubeFilter: 'medium' },      // 5-30 min
  other: { min: 0, max: 3600, youtubeFilter: 'any' },
}

// How far back to search for each video type (days)
// Shorter = fresher content, since we clean up after 3 days
const TYPE_RECENCY: Record<VideoType, number> = {
  trailer: 14,      // 14 days - latest trailers only
  clips: 14,        // 14 days - very fresh viral clips
  gameplay: 30,     // 30 days - recent compilations
  esports: 7,       // 7 days - this week's tournaments only
  review: 60,       // 60 days - recent reviews
  other: 30,
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

// Major gaming media channels that post official trailers
const TRAILER_CHANNELS = [
  'UCKy1dAqELo0zrOtPkf0eTMw', // IGN
  'UCbu2SsF-Or3Rsn3NxqODImw', // GameSpot
  'UC0fDG3byEcMtbOqPMymDNbw', // GameTrailers
  'UC-2Y8dQb0S6DtpxNgAKoJKA', // PlayStation
  'UCXGgrKt94gR6lmN4aN3mYTg', // Xbox
  'UCVg9nCmmfIyP4QcGOnZZ9Qg', // Nintendo of America
  'UCJx5KP-pCvnhk6Owrg-M5uA', // PC Gamer
  'UCi8e0iOVk1fEOogdfu4YgfA', // GameInformer
]

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
  const apiKey = getYouTubeApiKey()
  if (!apiKey) {
    console.error('[YouTube] YOUTUBE_API_KEY not configured')
    return []
  }

  console.log(`[YouTube] Searching for ${gameName} - ${videoType}`)

  // Build search query - rotate through keywords for variety
  const keywords = TYPE_KEYWORDS[videoType]
  const keywordIndex = Math.floor(Math.random() * keywords.length)
  const searchTerms = keywords.length > 0
    ? `${gameName} ${keywords[keywordIndex]}`
    : gameName

  // Check if we have official channels for this game (prioritize for trailers)
  const officialChannels = OFFICIAL_CHANNELS[gameSlug]

  // Get duration and recency settings for this type
  const durationConfig = TYPE_DURATION[videoType]
  const recencyDays = TYPE_RECENCY[videoType]

  try {
    // Use type-specific recency unless overridden
    let publishedAfter = options?.publishedAfter
    if (!publishedAfter) {
      publishedAfter = new Date()
      publishedAfter.setDate(publishedAfter.getDate() - recencyDays)
    }

    // Order: trailers by date (newest), clips by views (viral), others by relevance
    const orderBy = videoType === 'trailer' ? 'date' : videoType === 'clips' ? 'viewCount' : 'relevance'

    const params = new URLSearchParams({
      part: 'snippet',
      q: searchTerms,
      type: 'video',
      maxResults: maxResults.toString(),
      order: orderBy,
      publishedAfter: publishedAfter.toISOString(),
      videoCategoryId: '20', // Gaming category
      key: apiKey,
    })

    // Apply duration filter
    if (durationConfig.youtubeFilter !== 'any') {
      params.set('videoDuration', durationConfig.youtubeFilter)
    }

    // Note: We no longer restrict to official channels - let YouTube find the best results
    // Official channels are still listed for reference but we search broadly

    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`)

    if (!response.ok) {
      console.error('YouTube API error:', response.status, await response.text())
      return []
    }

    const data = await response.json()
    console.log(`[YouTube] Found ${data.items?.length || 0} videos for ${gameName} (${videoType})`)
    return data.items || []
  } catch (error) {
    console.error('[YouTube] Failed to search:', error)
    return []
  }
}

// Get video details (duration, view count)
export async function getVideoDetails(videoIds: string[]): Promise<Map<string, YouTubeVideoDetails>> {
  const apiKey = getYouTubeApiKey()
  if (!apiKey || videoIds.length === 0) {
    return new Map()
  }

  try {
    const params = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: videoIds.join(','),
      key: apiKey,
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
      // Search for videos (recency is now handled by TYPE_RECENCY)
      const searchResults = await searchGameVideos(gameName, gameSlug, videoType, 8) // Fetch more to filter

      if (searchResults.length === 0) continue

      // Get video IDs for details
      const videoIds = searchResults.map(v => v.id.videoId)
      const details = await getVideoDetails(videoIds)

      // Get duration constraints for this type
      const durationConfig = TYPE_DURATION[videoType]

      // Insert videos
      for (const video of searchResults) {
        const videoId = video.id.videoId
        const videoDetails = details.get(videoId)

        // Filter by actual duration (YouTube's filter is coarse)
        if (videoDetails) {
          const duration = parseDuration(videoDetails.contentDetails.duration)
          if (duration < durationConfig.min || duration > durationConfig.max) {
            console.log(`[YouTube] Skipping ${videoId} - duration ${duration}s outside ${durationConfig.min}-${durationConfig.max}s`)
            continue
          }
        }

        // Never allow Shorts format in trailers, gameplay, or esports
        if (['trailer', 'gameplay', 'esports'].includes(videoType)) {
          const title = video.snippet.title.toLowerCase()
          const description = video.snippet.description?.toLowerCase() || ''
          if (title.includes('#shorts') || title.includes('#short') ||
              description.includes('#shorts') || description.includes('#short')) {
            console.log(`[YouTube] Skipping ${videoId} - Shorts format not allowed for ${videoType}`)
            continue
          }
        }

        // Minimum view threshold - lower for trailers (new releases), higher for clips
        if (videoDetails) {
          const viewCount = parseInt(videoDetails.statistics.viewCount) || 0
          const minViews = videoType === 'trailer' ? 1000 : 5000
          if (viewCount < minViews) {
            console.log(`[YouTube] Skipping ${videoId} - only ${viewCount} views (min ${minViews} required)`)
            continue
          }
        }

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

// Search terms for viral/general gaming content (not game-specific) - Shorts format
const VIRAL_SEARCH_TERMS = [
  'gaming shorts viral',
  'funny gaming shorts',
  'streamer shorts clips',
  'twitch shorts',
  'gaming fails shorts',
  'epic gaming moments shorts',
  'streamer rage shorts',
  'viral gaming moments 2025',
  'best twitch clips this week',
  'streamer funny moments',
  'viral streamer clips gaming',
  'twitch highlights best moments',
  'streamer rage quit moments',
  'funniest gaming streamer clips',
  'best gaming clips this week',
  'twitch gaming highlights',
  'gaming funny fails',
  'insane video game plays',
  'streamer gaming rage moments',
  'gaming world record',
]

// Fetch viral/general gaming videos (not tied to specific games)
export async function fetchViralGamingVideos(): Promise<{ success: boolean; addedCount: number }> {
  const apiKey = getYouTubeApiKey()
  if (!apiKey) {
    return { success: false, addedCount: 0 }
  }

  const supabase = createAdminClient()
  let addedCount = 0

  // Pick 3 random search terms for viral content
  const shuffled = [...VIRAL_SEARCH_TERMS].sort(() => Math.random() - 0.5)
  const selectedTerms = shuffled.slice(0, 3)

  for (const searchTerm of selectedTerms) {
    try {
      // Only fetch videos from the last month for viral content
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const params = new URLSearchParams({
        part: 'snippet',
        q: searchTerm,
        type: 'video',
        maxResults: '10', // Fetch more to filter by duration
        order: 'viewCount', // Sort by views for viral content
        videoDuration: 'short', // Short videos for clips
        publishedAfter: oneMonthAgo.toISOString(),
        videoCategoryId: '20', // Gaming category
        key: apiKey,
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

        // Filter to 15 sec - 5 min clips (Shorts + longer clips mix)
        if (videoDetails) {
          const duration = parseDuration(videoDetails.contentDetails.duration)
          if (duration < 15 || duration > 300) {
            continue // Skip videos outside 15 sec - 5 min range
          }

          // Minimum 5k views for quality content
          const viewCount = parseInt(videoDetails.statistics.viewCount) || 0
          if (viewCount < 5000) {
            continue // Skip low view count videos
          }
        }

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

// Fetch official trailers from major gaming media channels (IGN, GameSpot, PlayStation, etc.)
export async function fetchOfficialTrailers(): Promise<{ success: boolean; addedCount: number }> {
  const apiKey = getYouTubeApiKey()
  if (!apiKey) {
    return { success: false, addedCount: 0 }
  }

  const supabase = createAdminClient()
  let addedCount = 0

  // Pick 2 random channels to search this run (to spread quota)
  const shuffled = [...TRAILER_CHANNELS].sort(() => Math.random() - 0.5)
  const selectedChannels = shuffled.slice(0, 2)

  for (const channelId of selectedChannels) {
    try {
      // Search for recent trailers on this channel
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const params = new URLSearchParams({
        part: 'snippet',
        channelId: channelId,
        q: 'trailer',
        type: 'video',
        maxResults: '10',
        order: 'date',
        publishedAfter: twoWeeksAgo.toISOString(),
        videoCategoryId: '20', // Gaming category
        videoDuration: 'medium', // 4-20 min
        key: apiKey,
      })

      const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`)
      if (!response.ok) continue

      const data = await response.json()
      const videos = data.items || []

      if (videos.length === 0) continue

      // Get video details
      const videoIds = videos.map((v: YouTubeSearchItem) => v.id.videoId)
      const details = await getVideoDetails(videoIds)

      // Try to match videos to games in our database
      for (const video of videos as YouTubeSearchItem[]) {
        const videoId = video.id.videoId
        const videoDetails = details.get(videoId)
        const title = video.snippet.title

        // Filter trailers by duration (1-5 min)
        if (videoDetails) {
          const duration = parseDuration(videoDetails.contentDetails.duration)
          if (duration < 60 || duration > 300) continue

          // Minimum 1k views for trailers
          const viewCount = parseInt(videoDetails.statistics.viewCount) || 0
          if (viewCount < 1000) continue
        }

        // Skip if not actually a trailer
        const lowerTitle = title.toLowerCase()
        if (!lowerTitle.includes('trailer') && !lowerTitle.includes('reveal') && !lowerTitle.includes('announce')) {
          continue
        }

        // Check if already exists
        const { data: existing } = await supabase
          .from('game_videos')
          .select('id')
          .eq('youtube_id', videoId)
          .single()

        if (existing) continue

        // Try to find a matching game in our database
        const { data: matchingGames } = await supabase
          .from('games')
          .select('id, name')
          .limit(50)

        let gameId: string | null = null
        if (matchingGames) {
          for (const game of matchingGames) {
            if (lowerTitle.includes(game.name.toLowerCase())) {
              gameId = game.id
              break
            }
          }
        }

        const thumbnail = video.snippet.thumbnails.high?.url ||
                          video.snippet.thumbnails.medium?.url ||
                          video.snippet.thumbnails.default?.url

        const { error } = await supabase
          .from('game_videos')
          .insert({
            game_id: gameId, // May be null if no match
            youtube_id: videoId,
            title: video.snippet.title,
            description: video.snippet.description?.slice(0, 500),
            thumbnail_url: thumbnail,
            channel_name: video.snippet.channelTitle,
            channel_id: video.snippet.channelId,
            video_type: 'trailer',
            published_at: video.snippet.publishedAt,
            view_count: videoDetails ? parseInt(videoDetails.statistics.viewCount) : 0,
            duration_seconds: videoDetails ? parseDuration(videoDetails.contentDetails.duration) : 0,
          })

        if (!error) {
          addedCount++
          console.log(`[YouTube] Added official trailer: ${title}`)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`[YouTube] Failed to fetch from channel ${channelId}:`, error)
    }
  }

  console.log(`[YouTube] Added ${addedCount} official trailers from gaming channels`)
  return { success: true, addedCount }
}

// Quota allocation per category (total ~2,250 units/run, 4 runs/day = ~9,000/day)
// YouTube API: Search = 100 units, Video details = 1 unit
const QUOTA_CONFIG = {
  trailers: { percentage: 35, gamesPerRun: 8 },    // 800 units - official trailers
  clips: { percentage: 35, gamesPerRun: 5, viralSearches: 3 }, // 800 units - viral clips + game clips
  gameplay: { percentage: 15, gamesPerRun: 3 },   // 300 units - top 10s, compilations
  esports: { percentage: 15, gamesPerRun: 3 },    // 300 units - tournament highlights
}

// Get popular games ranked by user engagement + player counts
async function getPopularGames(limit: number) {
  const supabase = createAdminClient()

  // Get all games with Steam App IDs
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

  // Build popularity score
  const gameScores = new Map<string, { score: number; game: { id: string; name: string; slug: string; steam_app_id: number | null } }>()

  steamGames?.forEach(game => {
    if (game.steam_app_id) {
      const isLiveService = LIVE_SERVICE_SLUGS.has(game.slug)
      gameScores.set(game.id, {
        score: isLiveService ? 1 : 0, // Slight boost for live service
        game: { id: game.id, name: game.name, slug: game.slug, steam_app_id: game.steam_app_id }
      })
    }
  })

  // Add engagement scores
  backlogItems?.forEach(item => {
    if (item.game_id && gameScores.has(item.game_id)) {
      gameScores.get(item.game_id)!.score += 5
    }
  })

  followedGames?.forEach(item => {
    if (item.game_id && gameScores.has(item.game_id)) {
      gameScores.get(item.game_id)!.score += 5
    }
  })

  // Sort and rotate for variety
  const sorted = Array.from(gameScores.values()).sort((a, b) => b.score - a.score).slice(0, 30)
  const hoursOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 3600000)
  const offset = (hoursOfYear * limit) % Math.max(sorted.length, 1)

  let selected = sorted.slice(offset, offset + limit).map(g => g.game)
  if (selected.length < limit && sorted.length > 0) {
    selected.push(...sorted.slice(0, limit - selected.length).map(g => g.game))
  }

  return selected
}

// Process a batch of games in parallel for a specific video type
async function processVideoBatch(
  games: { id: string; name: string; slug: string }[],
  videoType: VideoType
): Promise<{ added: number; gameNames: string[] }> {
  const results = await Promise.allSettled(
    games.map(game =>
      Promise.race([
        fetchGameVideos(game.id, game.name, game.slug, [videoType]),
        // Per-game timeout of 20 seconds (YouTube API can be slow)
        new Promise<{ success: false; addedCount: 0 }>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 20000)
        )
      ])
    )
  )

  let added = 0
  const gameNames: string[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.success) {
      added += result.value.addedCount
      if (result.value.addedCount > 0) {
        gameNames.push(games[i].name)
      }
    }
  })

  return { added, gameNames }
}

// Fetch videos for all popular games (for cron job)
// Quota split: Trailers 35%, Clips 35%, Gameplay 15%, Esports 15%
export async function fetchAllGameVideos() {
  const startTime = Date.now()
  const MAX_RUNTIME = 240000 // 4 minutes max (leaving 1 min buffer for 5 min limit)

  const supabase = createAdminClient()

  let totalAdded = 0
  const results: Record<string, { added: number; games: string[] }> = {
    trailers: { added: 0, games: [] },
    clips: { added: 0, games: [] },
    gameplay: { added: 0, games: [] },
    esports: { added: 0, games: [] },
  }
  const errors: string[] = []

  // 1. TRAILERS (35% quota) - Mix of upcoming releases + popular followed games
  console.log('[YouTube] Fetching TRAILERS...')

  // Get upcoming/recent releases (last 90 days to next 180 days)
  const { data: upcomingGames } = await supabase
    .from('games')
    .select('id, name, slug')
    .gte('release_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .lte('release_date', new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('release_date', { ascending: true })
    .limit(4)

  // Also get popular games that users follow (for DLC/update trailers)
  const popularGamesForTrailers = await getPopularGames(4)

  // Combine and dedupe
  const trailerGames = [...(upcomingGames || [])]
  const existingIds = new Set(trailerGames.map(g => g.id))
  for (const game of popularGamesForTrailers) {
    if (!existingIds.has(game.id)) {
      trailerGames.push(game)
      if (trailerGames.length >= QUOTA_CONFIG.trailers.gamesPerRun) break
    }
  }

  // 1a. Fetch trailers for specific games
  if (trailerGames.length > 0) {
    console.log(`[YouTube] Searching trailers for: ${trailerGames.map(g => g.name).join(', ')}`)
    const trailerResult = await processVideoBatch(trailerGames, 'trailer')
    results.trailers.added = trailerResult.added
    results.trailers.games = trailerResult.gameNames
    totalAdded += trailerResult.added
  }

  // 1b. Also fetch official trailers from major gaming channels (IGN, GameSpot, etc.)
  console.log('[YouTube] Fetching official trailers from gaming channels...')
  try {
    const officialResult = await fetchOfficialTrailers()
    if (officialResult.success) {
      results.trailers.added += officialResult.addedCount
      totalAdded += officialResult.addedCount
    }
  } catch (error) {
    console.error('[YouTube] Failed to fetch official trailers:', error)
  }

  // Check time
  if (Date.now() - startTime > MAX_RUNTIME) {
    console.log('[YouTube] Stopping early - time limit reached after trailers')
    return { success: true, totalAdded, breakdown: results, errors }
  }

  // 2. CLIPS (35% quota) - Viral content + game-specific clips
  console.log('[YouTube] Fetching CLIPS...')

  // 2a. Viral gaming clips (no specific game) - with timeout
  const viralPromise = Promise.race([
    fetchViralGamingVideos(),
    new Promise<{ success: false; addedCount: 0 }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 30000)
    )
  ])

  try {
    const viralResult = await viralPromise
    if (viralResult.success) {
      results.clips.added += viralResult.addedCount
      totalAdded += viralResult.addedCount
    }
  } catch {
    console.log('[YouTube] Viral fetch timed out')
  }

  // 2b. Game-specific clips from popular games
  const clipsGames = await getPopularGames(QUOTA_CONFIG.clips.gamesPerRun)
  if (clipsGames.length > 0) {
    const clipsResult = await processVideoBatch(clipsGames, 'clips')
    results.clips.added += clipsResult.added
    results.clips.games = clipsResult.gameNames
    totalAdded += clipsResult.added
  }

  // Check time
  if (Date.now() - startTime > MAX_RUNTIME) {
    console.log('[YouTube] Stopping early - time limit reached after clips')
    return { success: true, totalAdded, breakdown: results, errors }
  }

  // 3. GAMEPLAY (15% quota) - Top 10s, compilations
  console.log('[YouTube] Fetching GAMEPLAY...')
  const gameplayGames = await getPopularGames(QUOTA_CONFIG.gameplay.gamesPerRun)
  if (gameplayGames.length > 0) {
    const gameplayResult = await processVideoBatch(gameplayGames, 'gameplay')
    results.gameplay.added = gameplayResult.added
    results.gameplay.games = gameplayResult.gameNames
    totalAdded += gameplayResult.added
  }

  // Check time
  if (Date.now() - startTime > MAX_RUNTIME) {
    console.log('[YouTube] Stopping early - time limit reached after gameplay')
    return { success: true, totalAdded, breakdown: results, errors }
  }

  // 4. ESPORTS (15% quota) - Tournament highlights for esports games only
  console.log('[YouTube] Fetching ESPORTS...')
  const { data: esportsGamesData } = await supabase
    .from('games')
    .select('id, name, slug')
    .in('slug', Array.from(ESPORTS_GAMES))
    .limit(QUOTA_CONFIG.esports.gamesPerRun)

  if (esportsGamesData && esportsGamesData.length > 0) {
    const esportsResult = await processVideoBatch(esportsGamesData, 'esports')
    results.esports.added = esportsResult.added
    results.esports.games = esportsResult.gameNames
    totalAdded += esportsResult.added
  }

  console.log('[YouTube] Fetch complete:', results)

  return {
    success: true,
    totalAdded,
    breakdown: results,
    errors: errors.length > 0 ? errors : undefined
  }
}
