import { generateJSON } from './client'
import { createClient } from '@/lib/supabase/server'

type PlayContext = {
  availableTime?: number  // minutes
  mood?: 'chill' | 'challenge' | 'story' | 'social' | 'any'
}

type GameRecommendation = {
  game_id: string
  game_name: string
  reason: string
  match_score: number
  recommendation_type: 'return' | 'start' | 'finish' | 'discover'
  factors: string[]
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

For each recommendation, explain WHY in a personal, conversational way.

Recommendation types:
- return: Resume a paused game
- start: Begin a game they haven't started
- finish: Push through to complete a game they're close on
- discover: Try something new from their backlog

Be encouraging and understand gaming guilt (big backlog anxiety).`

type BacklogGame = {
  game_id: string
  game_name: string
  status: string
  progress: number
  last_played_at: string | null
  hours_played: number
  recent_patch?: string | null
  cover_url?: string
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

  const userPrompt = `User Context:
- Available time: ${context.availableTime ? `${context.availableTime} minutes` : 'Not specified'}
- Mood: ${context.mood || 'Not specified'}

User's Backlog (${backlogGames.length} games):
${backlogGames.map(g => `
- ${g.game_name}
  Status: ${g.status}
  Progress: ${g.progress}%
  Hours played: ${g.hours_played || 0}
  Last played: ${g.last_played_at ? new Date(g.last_played_at).toLocaleDateString() : 'Never'}
  ${g.recent_patch ? `Recent patch: ${g.recent_patch}` : ''}
`).join('')}

Recommend 1-3 games to play, prioritizing based on context and game states.
Return JSON with format: { recommendations: [...], message: "brief encouraging message" }`

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

  // Get recent patches for these games
  const gameIds = backlog.map(b => b.game_id)
  const { data: patches } = await supabase
    .from('patch_notes')
    .select('game_id, title, published_at')
    .in('game_id', gameIds)
    .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('published_at', { ascending: false })

  const recentPatches = new Map<string, string>()
  patches?.forEach(p => {
    if (!recentPatches.has(p.game_id)) {
      recentPatches.set(p.game_id, p.title || 'Update available')
    }
  })

  // Format for AI
  const backlogGames: BacklogGame[] = backlog.map(b => ({
    game_id: b.game_id,
    game_name: (b.games as unknown as { name: string }).name,
    status: b.status,
    progress: b.progress || 0,
    last_played_at: b.last_played_at,
    hours_played: 0, // Could be enriched if we track this
    recent_patch: recentPatches.get(b.game_id) || null,
    cover_url: (b.games as unknown as { cover_url?: string }).cover_url,
  }))

  const result = await generatePlayRecommendations(backlogGames, context)

  // Enrich recommendations with game_id mapping
  result.recommendations = result.recommendations.map(rec => {
    const game = backlogGames.find(g =>
      g.game_name.toLowerCase() === rec.game_name.toLowerCase()
    )
    return {
      ...rec,
      game_id: game?.game_id || rec.game_id,
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
