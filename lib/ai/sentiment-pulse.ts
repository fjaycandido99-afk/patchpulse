import { generateJSON } from './client'
import { createAdminClient } from '@/lib/supabase/admin'

type SentimentLevel = 'very_positive' | 'positive' | 'mixed' | 'negative' | 'very_negative'
type TrendDirection = 'up' | 'down' | 'stable'

type GameSentiment = {
  overall_sentiment: SentimentLevel
  sentiment_score: number  // -1 to 1
  trending: TrendDirection
  positive_factors: string[]
  negative_factors: string[]
  summary: string
}

type SentimentInput = {
  game_name: string
  recent_patches: Array<{ version: string; sentiment?: string; summary?: string }>
  recent_news: Array<{ title: string; sentiment?: string }>
  player_feedback?: string[]
}

const SYSTEM_PROMPT = `You are a gaming community sentiment analyst. Analyze recent updates and news to determine the overall community sentiment around a game.

Consider:
- Recent patch reception (fixes, nerfs, buffs)
- News coverage tone
- Major announcements
- Known community pain points
- Developer responsiveness

Sentiment levels:
- very_positive: Community is thrilled (major content drop, beloved changes)
- positive: Generally happy, minor complaints
- mixed: Split opinions, controversy
- negative: Frustration, complaints
- very_negative: Community outrage, major issues

Be honest and analytical. Don't sugarcoat issues.`

/**
 * Analyze sentiment for a game based on recent activity
 */
export async function analyzeGameSentiment(input: SentimentInput): Promise<GameSentiment> {
  const userPrompt = `Analyze the current community sentiment for: ${input.game_name}

Recent Patches (${input.recent_patches.length}):
${input.recent_patches.map(p => `
- ${p.version}
  ${p.summary || 'No summary'}
  ${p.sentiment ? `Previous sentiment: ${p.sentiment}` : ''}
`).join('')}

Recent News (${input.recent_news.length}):
${input.recent_news.map(n => `- ${n.title}`).join('\n')}

${input.player_feedback?.length ? `
Player Feedback Samples:
${input.player_feedback.slice(0, 5).map(f => `- "${f}"`).join('\n')}
` : ''}

Provide:
1. overall_sentiment: The current sentiment level
2. sentiment_score: Numeric score from -1 (very negative) to 1 (very positive)
3. trending: Is sentiment going up, down, or stable?
4. positive_factors: What's making players happy (2-4 items)
5. negative_factors: What's frustrating players (2-4 items)
6. summary: One sentence summary of the vibe`

  const result = await generateJSON<GameSentiment>(SYSTEM_PROMPT, userPrompt, {
    
    maxTokens: 800,
    temperature: 0.4,
  })

  return result
}

/**
 * Get or update sentiment for a game
 */
export async function getGameSentiment(gameId: string): Promise<GameSentiment | null> {
  const supabase = createAdminClient()

  // Check cache (sentiment valid for 24 hours)
  const { data: cached } = await supabase
    .from('game_sentiment')
    .select('*')
    .eq('game_id', gameId)
    .single()

  if (cached) {
    const lastAnalyzed = new Date(cached.last_analyzed_at)
    const hoursSince = (Date.now() - lastAnalyzed.getTime()) / (1000 * 60 * 60)

    if (hoursSince < 24) {
      return {
        overall_sentiment: cached.overall_sentiment as SentimentLevel,
        sentiment_score: parseFloat(cached.sentiment_score),
        trending: cached.trending as TrendDirection,
        positive_factors: cached.positive_factors as string[],
        negative_factors: cached.negative_factors as string[],
        summary: '', // Not stored, would need to regenerate
      }
    }
  }

  // Get game info
  const { data: game } = await supabase
    .from('games')
    .select('name')
    .eq('id', gameId)
    .single()

  if (!game) return null

  // Get recent patches
  const { data: patches } = await supabase
    .from('patch_notes')
    .select(`
      title,
      patch_summaries(sentiment, tldr)
    `)
    .eq('game_id', gameId)
    .order('published_at', { ascending: false })
    .limit(5)

  // Get recent news
  const { data: news } = await supabase
    .from('news_items')
    .select('title')
    .eq('game_id', gameId)
    .order('published_at', { ascending: false })
    .limit(10)

  const input: SentimentInput = {
    game_name: game.name,
    recent_patches: (patches || []).map(p => ({
      version: p.title || 'Update',
      sentiment: (p.patch_summaries as unknown as { sentiment?: string }[])?.[0]?.sentiment,
      summary: (p.patch_summaries as unknown as { tldr?: string }[])?.[0]?.tldr,
    })),
    recent_news: (news || []).map(n => ({ title: n.title })),
  }

  try {
    const sentiment = await analyzeGameSentiment(input)

    // Cache the result
    await supabase.from('game_sentiment').upsert({
      game_id: gameId,
      overall_sentiment: sentiment.overall_sentiment,
      sentiment_score: sentiment.sentiment_score,
      trending: sentiment.trending,
      positive_factors: sentiment.positive_factors,
      negative_factors: sentiment.negative_factors,
      last_analyzed_at: new Date().toISOString(),
      analysis_count: (cached?.analysis_count || 0) + 1,
    }, { onConflict: 'game_id' })

    return sentiment
  } catch (error) {
    console.error('Sentiment analysis failed:', error)
    return null
  }
}

/**
 * Get sentiment for multiple games (batch)
 */
export async function getMultiGameSentiment(
  gameIds: string[]
): Promise<Map<string, GameSentiment>> {
  const results = new Map<string, GameSentiment>()

  // Get cached sentiments
  const supabase = createAdminClient()
  const { data: cached } = await supabase
    .from('game_sentiment')
    .select('*')
    .in('game_id', gameIds)

  for (const item of cached || []) {
    const hoursSince = (Date.now() - new Date(item.last_analyzed_at).getTime()) / (1000 * 60 * 60)

    if (hoursSince < 24) {
      results.set(item.game_id, {
        overall_sentiment: item.overall_sentiment as SentimentLevel,
        sentiment_score: parseFloat(item.sentiment_score),
        trending: item.trending as TrendDirection,
        positive_factors: item.positive_factors as string[],
        negative_factors: item.negative_factors as string[],
        summary: '',
      })
    }
  }

  // Fetch missing ones (limit concurrent requests)
  const missing = gameIds.filter(id => !results.has(id))
  for (const gameId of missing.slice(0, 5)) {
    const sentiment = await getGameSentiment(gameId)
    if (sentiment) {
      results.set(gameId, sentiment)
    }
  }

  return results
}

/**
 * Get sentiment badge color/style based on sentiment
 */
export function getSentimentStyle(sentiment: SentimentLevel): {
  color: string
  bgColor: string
  label: string
} {
  switch (sentiment) {
    case 'very_positive':
      return { color: 'text-green-400', bgColor: 'bg-green-500/10', label: 'Thriving' }
    case 'positive':
      return { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Positive' }
    case 'mixed':
      return { color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Mixed' }
    case 'negative':
      return { color: 'text-orange-400', bgColor: 'bg-orange-500/10', label: 'Struggling' }
    case 'very_negative':
      return { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'In Crisis' }
    default:
      return { color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', label: 'Unknown' }
  }
}
