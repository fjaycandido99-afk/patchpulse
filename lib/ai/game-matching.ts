import { generateJSON, generateEmbedding } from './client'
import { createAdminClient } from '@/lib/supabase/admin'

type GameProfile = {
  id: string
  name: string
  genres: string[]
  tags: string[]
  description: string
  playtime?: number
}

type MatchResult = {
  game_id: string
  game_name: string
  match_score: number
  reasons: string[]
  shared_elements: {
    genres: string[]
    tags: string[]
    vibes: string[]
  }
}

type UserPreferences = {
  liked_games: GameProfile[]
  hours_played: Record<string, number>
  completed_games: string[]
  favorite_genres: string[]
}

const SYSTEM_PROMPT = `You are a gaming recommendation expert who understands what makes games similar beyond surface-level genres.

Analyze why a user might like certain games based on:
- Gameplay mechanics and feel
- Pacing and game length
- Story focus vs gameplay focus
- Difficulty and skill requirements
- Social/multiplayer aspects
- Atmosphere and tone
- Art style and presentation

Provide specific, thoughtful reasons - not generic "you like RPGs, here's another RPG."`

/**
 * Calculate game similarity score based on AI analysis
 */
export async function calculateGameMatch(
  userPrefs: UserPreferences,
  candidateGame: GameProfile
): Promise<MatchResult> {
  const userPrompt = `Based on the user's gaming history, how well would they enjoy "${candidateGame.name}"?

User's Favorite Games (ranked by playtime):
${userPrefs.liked_games.map(g => `
- ${g.name}
  Genres: ${g.genres.join(', ')}
  Tags: ${g.tags.join(', ')}
  Hours played: ${userPrefs.hours_played[g.id] || 'Unknown'}
  ${userPrefs.completed_games.includes(g.id) ? 'COMPLETED' : ''}
`).join('')}

Candidate Game to Evaluate:
- ${candidateGame.name}
  Genres: ${candidateGame.genres.join(', ')}
  Tags: ${candidateGame.tags.join(', ')}
  Description: ${candidateGame.description?.slice(0, 500)}

Rate match from 1-100 and explain why. Focus on gameplay feel, not just genre overlap.`

  const result = await generateJSON<{
    match_score: number
    reasons: string[]
    shared_genres: string[]
    shared_tags: string[]
    vibes: string[]
  }>(SYSTEM_PROMPT, userPrompt, {
    
    maxTokens: 800,
    temperature: 0.4,
  })

  return {
    game_id: candidateGame.id,
    game_name: candidateGame.name,
    match_score: result.match_score,
    reasons: result.reasons,
    shared_elements: {
      genres: result.shared_genres,
      tags: result.shared_tags,
      vibes: result.vibes,
    },
  }
}

/**
 * Get game recommendations for a user
 */
export async function getGameRecommendations(
  userId: string,
  limit: number = 5
): Promise<MatchResult[]> {
  const supabase = createAdminClient()

  // Get user's liked/played games
  const { data: userGames } = await supabase
    .from('backlog_items')
    .select(`
      game_id,
      progress,
      status,
      games!inner(
        id,
        name,
        description
      )
    `)
    .eq('user_id', userId)
    .in('status', ['playing', 'finished', 'paused'])
    .order('progress', { ascending: false })
    .limit(10)

  if (!userGames || userGames.length < 2) {
    return []
  }

  // Get game tags/genres for user's games
  const userGameIds = userGames.map(g => g.game_id)

  const { data: userGameDetails } = await supabase
    .from('games')
    .select('id, name, description')
    .in('id', userGameIds)

  const likedGames: GameProfile[] = (userGameDetails || []).map(g => ({
    id: g.id,
    name: g.name,
    genres: [], // Would need a game_genres table
    tags: [],   // Would need a game_tags table
    description: g.description || '',
  }))

  // Get candidate games (not in user's library)
  const { data: candidates } = await supabase
    .from('games')
    .select('id, name, description')
    .not('id', 'in', `(${userGameIds.join(',')})`)
    .limit(20)

  if (!candidates || candidates.length === 0) {
    return []
  }

  const userPrefs: UserPreferences = {
    liked_games: likedGames,
    hours_played: {},
    completed_games: userGames
      .filter(g => g.status === 'finished')
      .map(g => g.game_id),
    favorite_genres: [],
  }

  // Score a sample of candidates
  const candidatesToScore = candidates.slice(0, 5)
  const results: MatchResult[] = []

  for (const candidate of candidatesToScore) {
    try {
      const match = await calculateGameMatch(userPrefs, {
        id: candidate.id,
        name: candidate.name,
        genres: [],
        tags: [],
        description: candidate.description || '',
      })
      results.push(match)
    } catch (error) {
      console.error(`Failed to score ${candidate.name}:`, error)
    }
  }

  // Sort by match score and return top results
  return results
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit)
}

/**
 * Find similar games to a specific game
 */
export async function findSimilarGames(
  gameId: string,
  limit: number = 5
): Promise<MatchResult[]> {
  const supabase = createAdminClient()

  // Check cache first
  const { data: cached } = await supabase
    .from('game_similarities')
    .select(`
      similar_game_id,
      similarity_score,
      similarity_reasons,
      games!game_similarities_similar_game_id_fkey(name)
    `)
    .eq('game_id', gameId)
    .order('similarity_score', { ascending: false })
    .limit(limit)

  if (cached && cached.length > 0) {
    return cached.map(c => ({
      game_id: c.similar_game_id,
      game_name: (c.games as unknown as { name: string })?.name || 'Unknown',
      match_score: Math.round((c.similarity_score || 0) * 100),
      reasons: (c.similarity_reasons as string[]) || [],
      shared_elements: { genres: [], tags: [], vibes: [] },
    }))
  }

  // Generate new similarities
  const { data: sourceGame } = await supabase
    .from('games')
    .select('id, name, description')
    .eq('id', gameId)
    .single()

  if (!sourceGame) {
    return []
  }

  const { data: candidates } = await supabase
    .from('games')
    .select('id, name, description')
    .neq('id', gameId)
    .limit(20)

  if (!candidates) {
    return []
  }

  const prompt = `Find the 5 most similar games to "${sourceGame.name}" from this list.

Source Game: ${sourceGame.name}
${sourceGame.description?.slice(0, 500)}

Candidate Games:
${candidates.map(c => `- ${c.name}: ${c.description?.slice(0, 200) || 'No description'}`).join('\n')}

Return JSON array with game_name, similarity_score (0-1), and reasons array.`

  const result = await generateJSON<{ similar: Array<{
    game_name: string
    similarity_score: number
    reasons: string[]
  }> }>(
    'You are a gaming expert finding similar games. Focus on gameplay feel, not just genres.',
    prompt,
    { maxTokens: 1000, temperature: 0.3 }
  )

  // Map back to game IDs and save to cache
  const matches: MatchResult[] = []

  for (const sim of result.similar || []) {
    const candidate = candidates.find(c =>
      c.name.toLowerCase() === sim.game_name.toLowerCase()
    )
    if (candidate) {
      matches.push({
        game_id: candidate.id,
        game_name: candidate.name,
        match_score: Math.round(sim.similarity_score * 100),
        reasons: sim.reasons,
        shared_elements: { genres: [], tags: [], vibes: [] },
      })

      // Cache the similarity
      await supabase.from('game_similarities').upsert({
        game_id: gameId,
        similar_game_id: candidate.id,
        similarity_score: sim.similarity_score,
        similarity_reasons: sim.reasons,
      }, { onConflict: 'game_id,similar_game_id' })
    }
  }

  return matches.slice(0, limit)
}
