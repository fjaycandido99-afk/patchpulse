import { generateJSON } from './client'
import { createClient } from '@/lib/supabase/server'

type PlayContext = {
  availableTime?: number  // minutes
  mood?: 'chill' | 'challenge' | 'story' | 'social' | 'any'
  includeDiscovery?: boolean  // Include games not in backlog
  discoveryOnly?: boolean  // Only show discovery games, exclude backlog
}

type GameRecommendation = {
  game_id: string
  game_name: string
  slug: string
  cover_url: string | null
  reason: string
  match_score: number
  recommendation_type: 'return' | 'start' | 'finish' | 'discover'
  factors: string[]
  why_now: string | null
  what_youd_miss: string | null
  momentum: 'rising' | 'stable' | 'cooling'
  recent_patch: {
    title: string
    published_at: string
    is_major: boolean
  } | null
  days_since_played: number | null
  progress: number
  is_discovery: boolean  // True if game is not in user's backlog
  follower_count?: number  // How many users follow this game
}

type RecommendationResult = {
  recommendations: GameRecommendation[]
  message: string
}

const SYSTEM_PROMPT_MIXED = `You are a Pro gaming intelligence advisor helping players make STRATEGIC decisions about what to play.

Your job is to help users gain an ADVANTAGE by playing the right game at the right time.

Given the user's gaming context, backlog, AND popular discovery games, recommend which game(s) they should play NOW.

Consider:
- Time available (quick session vs long play)
- Current mood/preference
- Progress in each game (for backlog games)
- Recent patches or updates to games (MAJOR patches = good re-entry point)
- How long since they last played each game
- Game momentum (is this game "hot" right now?)
- For DISCOVERY games: popularity (follower count), active development, and fit with user's mood

For each recommendation provide:
1. "reason" - WHY this game in a personal, conversational way (1-2 sentences)
2. "why_now" - A timely, punchy hook explaining why NOW is the optimal moment (e.g., "Patch dropped 3 days ago - perfect re-entry", "Community sentiment just turned positive", "You're 80% through - one session to finish", "Trending with 50K+ players")
3. "what_youd_miss" - What they'd lose by skipping (e.g., "Limited-time event ends in 5 days", "Meta shift happening now", "Bug fixes make this playable again"). NULL if nothing urgent.
4. "momentum" - Game's current activity level:
   - "rising" = Recent patch, active updates, good time to jump in
   - "stable" = Steady, no major changes
   - "cooling" = No recent updates, quieting down
5. "match_score" - How well this matches the user's mood/time (0-100)
6. "is_discovery" - true if this is a NEW game not in user's backlog, false if from backlog

Recommendation types:
- return: Resume a paused game (use when they have progress)
- start: Begin a game they haven't started
- finish: Push through to complete (when progress > 70%)
- discover: Try something NEW that's not in their backlog (use for discovery games)

IMPORTANT: Include at least 1 discovery game if available, showing users games they might love but haven't tried yet.

Be direct and strategic. Users pay for ADVANTAGE, not just suggestions.`

const SYSTEM_PROMPT_DISCOVERY = `You are a Pro gaming discovery advisor helping players find NEW games they'll love.

Your job is to help users DISCOVER games outside their current library that match their mood and preferences.

These are ALL games the user does NOT currently have in their backlog - your goal is to recommend the best NEW games for them to try based on:
- Their mood and time available
- Game popularity (follower count shows community interest)
- Recent patches or updates (shows active development)
- Game momentum and trending status

For each recommendation provide:
1. "reason" - WHY this game would be great for them (1-2 sentences, focus on what makes it special)
2. "why_now" - A timely, punchy hook explaining why NOW is a great time to try it (e.g., "Major update just dropped", "Community is buzzing", "Perfect match for your mood")
3. "what_youd_miss" - What makes this game unique or why they should try it soon. NULL if nothing urgent.
4. "momentum" - Game's current activity level:
   - "rising" = Recent patch, active updates, hot right now
   - "stable" = Steady, solid choice
   - "cooling" = Less active but still good
5. "match_score" - How well this matches the user's mood/time (0-100)
6. "is_discovery" - ALWAYS true (these are all discovery games)

Recommendation type is ALWAYS "discover" for discovery games.

Be enthusiastic but strategic. Help users find hidden gems and trending games they haven't tried yet.`

type BacklogGame = {
  game_id: string
  game_name: string
  slug: string
  status: string
  progress: number
  last_played_at: string | null
  hours_played: number
  cover_url: string | null
  recent_patch: {
    title: string
    published_at: string
    is_major: boolean
  } | null
  is_discovery?: boolean
  follower_count?: number
}

/**
 * Generate personalized play recommendations
 */
export async function generatePlayRecommendations(
  backlogGames: BacklogGame[],
  discoveryGames: BacklogGame[],
  context: PlayContext = {}
): Promise<RecommendationResult> {
  const discoveryOnly = context.discoveryOnly || false

  // In discovery-only mode, we only need discovery games
  if (discoveryOnly) {
    if (discoveryGames.length === 0) {
      return {
        recommendations: [],
        message: "No new games to discover at the moment. Check back later!",
      }
    }
  } else {
    if (backlogGames.length === 0 && discoveryGames.length === 0) {
      return {
        recommendations: [],
        message: "No games available for recommendations.",
      }
    }
  }

  const now = new Date()

  // Format backlog games (only if not discovery-only mode)
  const backlogSection = !discoveryOnly && backlogGames.length > 0 ? `
User's Backlog (${backlogGames.length} games):
${backlogGames.map(g => {
  const lastPlayed = g.last_played_at ? new Date(g.last_played_at) : null
  const daysSincePlayed = lastPlayed ? Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)) : null
  return `
- ${g.game_name} [BACKLOG]
  Status: ${g.status}
  Progress: ${g.progress}%
  Hours played: ${g.hours_played || 0}
  Last played: ${lastPlayed ? `${lastPlayed.toLocaleDateString()} (${daysSincePlayed} days ago)` : 'Never started'}
  ${g.recent_patch ? `Recent patch (${new Date(g.recent_patch.published_at).toLocaleDateString()}): "${g.recent_patch.title}"${g.recent_patch.is_major ? ' [MAJOR UPDATE]' : ''}` : 'No recent patches'}`
}).join('')}` : ''

  // Format discovery games
  const discoverySection = discoveryGames.length > 0 ? `
${discoveryOnly ? 'Games to Discover' : 'Trending Games to Discover'} (${discoveryGames.length} games - NOT in user's library):
${discoveryGames.map(g => `
- ${g.game_name} [DISCOVERY - NEW TO USER]
  Followers: ${g.follower_count || 0} users
  ${g.recent_patch ? `Recent patch (${new Date(g.recent_patch.published_at).toLocaleDateString()}): "${g.recent_patch.title}"${g.recent_patch.is_major ? ' [MAJOR UPDATE]' : ''}` : 'Actively developed'}
  Momentum: ${g.recent_patch ? 'rising' : 'stable'}`
).join('')}` : ''

  const userPrompt = discoveryOnly
    ? `User Context:
- Available time: ${context.availableTime ? `${context.availableTime} minutes` : 'Not specified'}
- Mood: ${context.mood || 'Not specified'}
- Today: ${now.toLocaleDateString()}
${discoverySection}

Recommend 2-4 NEW games for the user to try. Focus on games that match their mood and have good momentum.
Return JSON:
{
  "recommendations": [
    {
      "game_name": "string",
      "reason": "why this game would be great for them",
      "why_now": "timely hook for why NOW is great to try it",
      "what_youd_miss": "what makes this unique (or null)",
      "momentum": "rising|stable|cooling",
      "match_score": 0-100,
      "recommendation_type": "discover",
      "factors": ["factor1", "factor2"],
      "is_discovery": true
    }
  ],
  "message": "brief discovery-focused message"
}`
    : `User Context:
- Available time: ${context.availableTime ? `${context.availableTime} minutes` : 'Not specified'}
- Mood: ${context.mood || 'Not specified'}
- Today: ${now.toLocaleDateString()}
${backlogSection}${discoverySection}

Recommend 2-4 games to play. Include at least 1 discovery game if available to help user find new favorites.
Return JSON:
{
  "recommendations": [
    {
      "game_name": "string",
      "reason": "personal explanation why this game",
      "why_now": "timely hook for NOW being the optimal moment",
      "what_youd_miss": "what they lose by skipping (or null if nothing urgent)",
      "momentum": "rising|stable|cooling",
      "match_score": 0-100,
      "recommendation_type": "return|start|finish|discover",
      "factors": ["factor1", "factor2"],
      "is_discovery": true/false
    }
  ],
  "message": "brief strategic message"
}`

  const systemPrompt = discoveryOnly ? SYSTEM_PROMPT_DISCOVERY : SYSTEM_PROMPT_MIXED

  const result = await generateJSON<RecommendationResult>(systemPrompt, userPrompt, {
    maxTokens: 1500,
    temperature: 0.7,
  })

  return result
}

/**
 * Get personalized recommendations for a user
 */
export async function getPlayRecommendations(
  userId: string,
  context: PlayContext = {}
): Promise<RecommendationResult> {
  const supabase = await createClient()

  // Get user's backlog with game details
  const { data: backlog } = await supabase
    .from('backlog_items')
    .select(`
      game_id,
      status,
      progress,
      last_played_at,
      games!inner(
        name,
        slug,
        cover_url,
        platforms,
        steam_app_id
      )
    `)
    .eq('user_id', userId)
    .in('status', ['playing', 'paused', 'backlog'])
    .order('last_played_at', { ascending: false, nullsFirst: false })
    .limit(20)

  const userGameIds = (backlog || []).map(b => b.game_id)

  // Get recent patches for backlog games (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: patches } = await supabase
    .from('patch_notes')
    .select('game_id, title, published_at, impact_level')
    .in('game_id', userGameIds.length > 0 ? userGameIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('published_at', thirtyDaysAgo)
    .order('published_at', { ascending: false })

  const recentPatches = new Map<string, { title: string; published_at: string; is_major: boolean }>()
  patches?.forEach(p => {
    if (!recentPatches.has(p.game_id)) {
      recentPatches.set(p.game_id, {
        title: p.title || 'Update available',
        published_at: p.published_at,
        is_major: p.impact_level === 'major' || p.impact_level === 'critical',
      })
    }
  })

  // Helper to check if game is on Steam or Xbox
  // Note: "PC" is too broad (includes Riot, Epic, etc.) - only check for Steam/Xbox specifically
  const isSteamOrXbox = (platforms: string[] | null, steamAppId: string | null): boolean => {
    if (steamAppId) return true // Has Steam ID = Steam game
    if (!platforms) return false
    return platforms.some(p => {
      const lower = p.toLowerCase()
      return lower.includes('steam') || lower.includes('xbox')
    })
  }

  // Format backlog for AI - filter to Steam/Xbox only
  type GameInfo = { name: string; slug: string; cover_url?: string; platforms?: string[]; steam_app_id?: string }
  const backlogGames: BacklogGame[] = (backlog || [])
    .filter(b => {
      const game = b.games as unknown as GameInfo
      return isSteamOrXbox(game.platforms || null, game.steam_app_id || null)
    })
    .map(b => {
      const game = b.games as unknown as GameInfo
      return {
        game_id: b.game_id,
        game_name: game.name,
        slug: game.slug,
        status: b.status,
        progress: b.progress || 0,
        last_played_at: b.last_played_at,
        hours_played: 0,
        cover_url: game.cover_url || null,
        recent_patch: recentPatches.get(b.game_id) || null,
        is_discovery: false,
      }
    })

  // Fetch discovery games: popular games with recent patches that user doesn't own
  // Filter to Steam/Xbox games only
  const { data: discoveryData } = await supabase
    .from('games')
    .select(`
      id,
      name,
      slug,
      cover_url,
      platforms,
      steam_app_id
    `)
    .not('id', 'in', userGameIds.length > 0 ? `(${userGameIds.join(',')})` : '(00000000-0000-0000-0000-000000000000)')
    .limit(100) // Fetch more to filter

  // Get follower counts for discovery games
  const discoveryIds = (discoveryData || []).map(g => g.id)
  const { data: followerCounts } = await supabase
    .from('backlog_items')
    .select('game_id')
    .in('game_id', discoveryIds.length > 0 ? discoveryIds : ['00000000-0000-0000-0000-000000000000'])

  const followerMap = new Map<string, number>()
  followerCounts?.forEach(f => {
    followerMap.set(f.game_id, (followerMap.get(f.game_id) || 0) + 1)
  })

  // Get recent patches for discovery games
  const { data: discoveryPatches } = await supabase
    .from('patch_notes')
    .select('game_id, title, published_at, impact_level')
    .in('game_id', discoveryIds.length > 0 ? discoveryIds : ['00000000-0000-0000-0000-000000000000'])
    .gte('published_at', thirtyDaysAgo)
    .order('published_at', { ascending: false })

  const discoveryPatchMap = new Map<string, { title: string; published_at: string; is_major: boolean }>()
  discoveryPatches?.forEach(p => {
    if (!discoveryPatchMap.has(p.game_id)) {
      discoveryPatchMap.set(p.game_id, {
        title: p.title || 'Update available',
        published_at: p.published_at,
        is_major: p.impact_level === 'major' || p.impact_level === 'critical',
      })
    }
  })

  // Format discovery games - prioritize by follower count and recent patches
  // Filter to Steam/Xbox games only
  const discoveryGames: BacklogGame[] = (discoveryData || [])
    .filter(g => isSteamOrXbox(g.platforms || null, g.steam_app_id || null))
    .map(g => ({
      game_id: g.id,
      game_name: g.name,
      slug: g.slug,
      status: 'discovery',
      progress: 0,
      last_played_at: null,
      hours_played: 0,
      cover_url: g.cover_url,
      recent_patch: discoveryPatchMap.get(g.id) || null,
      is_discovery: true,
      follower_count: followerMap.get(g.id) || 0,
    }))
    .filter(g => g.follower_count > 0 || g.recent_patch) // Only include games with followers or recent activity
    .sort((a, b) => {
      // Prioritize games with recent patches and more followers
      const aScore = (a.recent_patch ? 100 : 0) + (a.follower_count || 0)
      const bScore = (b.recent_patch ? 100 : 0) + (b.follower_count || 0)
      return bScore - aScore
    })
    .slice(0, 10) // Top 10 discovery games

  const result = await generatePlayRecommendations(backlogGames, discoveryGames, context)

  // Combine all games for lookup
  const allGames = [...backlogGames, ...discoveryGames]

  // Enrich recommendations with full game data
  // Only include recommendations where we can find the game in our database
  const now = new Date()
  result.recommendations = result.recommendations
    .map(rec => {
      // Look in both backlog and discovery games - try exact match first, then partial
      let game = allGames.find(g =>
        g.game_name.toLowerCase() === rec.game_name.toLowerCase()
      )

      // If no exact match, try partial match
      if (!game) {
        const recNameLower = rec.game_name.toLowerCase()
        game = allGames.find(g =>
          g.game_name.toLowerCase().includes(recNameLower) ||
          recNameLower.includes(g.game_name.toLowerCase())
        )
      }

      // Skip recommendations where we can't find the game in our database
      if (!game) {
        console.log(`[Recommendations] Skipping "${rec.game_name}" - not found in database`)
        return null
      }

      const lastPlayed = game.last_played_at ? new Date(game.last_played_at) : null
      const daysSincePlayed = lastPlayed
        ? Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))
        : null

      const isDiscovery = game.is_discovery || rec.is_discovery || false

      return {
        ...rec,
        game_id: game.game_id,
        game_name: game.game_name, // Use the actual name from DB
        slug: game.slug || game.game_id,
        cover_url: game.cover_url || null,
        recent_patch: game.recent_patch || null,
        days_since_played: daysSincePlayed,
        progress: game.progress || 0,
        why_now: rec.why_now || null,
        what_youd_miss: rec.what_youd_miss || null,
        momentum: rec.momentum || 'stable',
        is_discovery: isDiscovery,
        follower_count: game.follower_count,
      }
    })
    .filter((rec): rec is NonNullable<typeof rec> => rec !== null)

  // Deduplicate by game_id (keep first occurrence which has highest score)
  const seen = new Set<string>()
  result.recommendations = result.recommendations.filter(rec => {
    if (seen.has(rec.game_id)) return false
    seen.add(rec.game_id)
    return true
  })

  // Optionally save recommendations (non-blocking)
  if (result.recommendations.length > 0) {
    try {
      const toInsert = result.recommendations.map(rec => ({
        user_id: userId,
        game_id: rec.game_id,
        reason: rec.reason,
        match_score: rec.match_score,
        recommendation_type: rec.recommendation_type,
        context,
        factors: rec.factors,
      }))

      await supabase.from('play_recommendations').insert(toInsert)
    } catch {
      // Silently fail - saving history is optional
    }
  }

  return result
}
