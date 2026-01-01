import { generateJSON } from './client'
import { createClient } from '@/lib/supabase/server'

type PlayContext = {
  availableTime?: number  // minutes
  mood?: 'chill' | 'challenge' | 'story' | 'social' | 'any'
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
  recent_patch: {
    title: string
    published_at: string
    is_major: boolean
  } | null
  days_since_played: number | null
  progress: number
}

type RecommendationResult = {
  recommendations: GameRecommendation[]
  message: string
}

const SYSTEM_PROMPT = `You are a gaming advisor helping players decide what to play from their backlog.

Given the user's gaming context and backlog, recommend which game(s) they should play.

Consider:
- Time available (quick session vs long play)
- Current mood/preference
- Progress in each game
- Recent patches or updates to games
- How long since they last played each game
- Game completion status

For each recommendation:
1. "reason" - WHY this game in a personal, conversational way (1-2 sentences)
2. "why_now" - A timely hook explaining why NOW is good (e.g., "Just got a major patch fixing bugs", "You haven't touched this in 45 days - perfect time to return", "You're 75% through - one more session to finish!")
3. "match_score" - How well this matches the user's mood/time (0-100)

Recommendation types:
- return: Resume a paused game
- start: Begin a game they haven't started
- finish: Push through to complete a game they're close on
- discover: Try something new from their backlog

Be encouraging and understand gaming guilt (big backlog anxiety). Keep why_now short and punchy.`

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
}

/**
 * Generate personalized play recommendations
 */
export async function generatePlayRecommendations(
  backlogGames: BacklogGame[],
  context: PlayContext = {}
): Promise<RecommendationResult> {
  if (backlogGames.length === 0) {
    return {
      recommendations: [],
      message: "Your backlog is empty! Time to discover some new games.",
    }
  }

  const now = new Date()
  const userPrompt = `User Context:
- Available time: ${context.availableTime ? `${context.availableTime} minutes` : 'Not specified'}
- Mood: ${context.mood || 'Not specified'}
- Today: ${now.toLocaleDateString()}

User's Backlog (${backlogGames.length} games):
${backlogGames.map(g => {
  const lastPlayed = g.last_played_at ? new Date(g.last_played_at) : null
  const daysSincePlayed = lastPlayed ? Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)) : null
  return `
- ${g.game_name}
  Status: ${g.status}
  Progress: ${g.progress}%
  Hours played: ${g.hours_played || 0}
  Last played: ${lastPlayed ? `${lastPlayed.toLocaleDateString()} (${daysSincePlayed} days ago)` : 'Never started'}
  ${g.recent_patch ? `Recent patch (${new Date(g.recent_patch.published_at).toLocaleDateString()}): "${g.recent_patch.title}"${g.recent_patch.is_major ? ' [MAJOR UPDATE]' : ''}` : 'No recent patches'}`
}).join('')}

Recommend 1-3 games to play, prioritizing based on context and game states.
Return JSON:
{
  "recommendations": [
    {
      "game_name": "string",
      "reason": "personal explanation why this game",
      "why_now": "timely hook for NOW being the right moment",
      "match_score": 0-100,
      "recommendation_type": "return|start|finish|discover",
      "factors": ["factor1", "factor2"]
    }
  ],
  "message": "brief encouraging message"
}`

  const result = await generateJSON<RecommendationResult>(SYSTEM_PROMPT, userPrompt, {
    
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
  const { data: backlog, error } = await supabase
    .from('backlog_items')
    .select(`
      game_id,
      status,
      progress,
      last_played_at,
      games!inner(
        name,
        slug,
        cover_url
      )
    `)
    .eq('user_id', userId)
    .in('status', ['playing', 'paused', 'backlog'])
    .order('last_played_at', { ascending: false, nullsFirst: false })
    .limit(20)

  if (error || !backlog || backlog.length === 0) {
    return {
      recommendations: [],
      message: "Add some games to your backlog to get personalized recommendations!",
    }
  }

  // Get recent patches for these games (last 30 days)
  const gameIds = backlog.map(b => b.game_id)
  const { data: patches } = await supabase
    .from('patch_notes')
    .select('game_id, title, published_at, impact_level')
    .in('game_id', gameIds)
    .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
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

  // Format for AI
  type GameInfo = { name: string; slug: string; cover_url?: string }
  const backlogGames: BacklogGame[] = backlog.map(b => {
    const game = b.games as unknown as GameInfo
    return {
      game_id: b.game_id,
      game_name: game.name,
      slug: game.slug,
      status: b.status,
      progress: b.progress || 0,
      last_played_at: b.last_played_at,
      hours_played: 0, // Could be enriched if we track this
      cover_url: game.cover_url || null,
      recent_patch: recentPatches.get(b.game_id) || null,
    }
  })

  const result = await generatePlayRecommendations(backlogGames, context)

  // Enrich recommendations with full game data
  const now = new Date()
  result.recommendations = result.recommendations.map(rec => {
    const game = backlogGames.find(g =>
      g.game_name.toLowerCase() === rec.game_name.toLowerCase()
    )

    const lastPlayed = game?.last_played_at ? new Date(game.last_played_at) : null
    const daysSincePlayed = lastPlayed
      ? Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      ...rec,
      game_id: game?.game_id || rec.game_id,
      slug: game?.slug || '',
      cover_url: game?.cover_url || null,
      recent_patch: game?.recent_patch || null,
      days_since_played: daysSincePlayed,
      progress: game?.progress || 0,
      why_now: rec.why_now || null,
    }
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
