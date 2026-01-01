import { generateJSON } from './client'
import { createClient } from '@/lib/supabase/server'

type NewsItem = {
  id: string
  title: string
  summary: string
  game_name: string
  game_slug: string
  game_cover_url: string | null
  published_at: string
  source?: string
}

type DigestHighlight = {
  news_id: string
  title: string
  game_name: string
  game_slug: string
  game_cover_url: string | null
  tldr: string
  why_it_matters: string | null
  is_early_signal: boolean
  importance: 'high' | 'medium' | 'low'
  category: 'update' | 'dlc' | 'esports' | 'review' | 'announcement' | 'other'
}

type GameUpdate = {
  game_name: string
  game_slug: string
  game_cover_url: string | null
  update_count: number
  summary: string
  highlights: string[]
}

type DigestResult = {
  summary: string
  highlights: DigestHighlight[]
  game_updates: Record<string, GameUpdate>
  total_news: number
}

const SYSTEM_PROMPT = `You are a Pro gaming intelligence analyst creating STRATEGIC news digests.

Your job is to help Pro users gain an ADVANTAGE by surfacing what matters BEFORE it's obvious to everyone.

For each digest:
1. Summarize news into actionable intelligence (not just summaries)
2. Rank highlights by IMPACT on gameplay, not recency
3. Explain WHY each story matters to actual gameplay

For each highlight provide:
- "tldr": 1-sentence summary
- "why_it_matters": How this affects gameplay decisions (e.g., "Fixes progression blockers causing negative reviews", "Meta shift incoming - current builds may become obsolete")
- "is_early_signal": true if this news isn't widely known yet or represents emerging info
- "importance": "high" = affects gameplay significantly, "medium" = notable change, "low" = informational only

Prioritize:
- Patches that fix major issues or change meta
- Content that has time-limited availability
- Announcements that change how to play
- Skip: marketing fluff, minor cosmetic updates, esports results (unless strategy-relevant)

Be direct and strategic. Users pay for ADVANTAGE, not just news summaries.`

/**
 * Generate a news digest from a collection of news items
 */
export async function generateNewsDigest(
  newsItems: NewsItem[],
  digestType: 'daily' | 'weekly' = 'daily'
): Promise<DigestResult> {
  if (newsItems.length === 0) {
    return {
      summary: "No news today for your followed games. Check back later!",
      highlights: [],
      game_updates: {},
      total_news: 0,
    }
  }

  // Group by game for context
  const byGame = newsItems.reduce((acc, item) => {
    if (!acc[item.game_name]) acc[item.game_name] = []
    acc[item.game_name].push(item)
    return acc
  }, {} as Record<string, NewsItem[]>)

  const userPrompt = `Create a ${digestType} digest for ${newsItems.length} news items across ${Object.keys(byGame).length} games.

News Items:
${newsItems.map(n => `
[${n.game_name}] ${n.title}
${n.summary?.slice(0, 200) || 'No summary'}
Published: ${new Date(n.published_at).toLocaleDateString()}
ID: ${n.id}
`).join('\n---\n')}

Return JSON with:
- summary: 2-3 sentence strategic overview (what Pro users need to know)
- highlights: Top 3-5 stories ranked by gameplay IMPACT (not recency), each with:
  - news_id, title, game_name, tldr
  - why_it_matters: how this affects gameplay decisions
  - is_early_signal: true if not widely known yet
  - importance: high/medium/low
  - category: update/dlc/announcement/other
- game_updates: Object with game names as keys, each having update_count, summary, and highlights array`

  const result = await generateJSON<DigestResult>(SYSTEM_PROMPT, userPrompt, {

    maxTokens: 2000,
    temperature: 0.5,
  })

  // Enrich highlights with game cover URLs and ensure new fields have defaults
  result.highlights = result.highlights.map(h => {
    const newsItem = newsItems.find(n => n.id === h.news_id)
    return {
      ...h,
      game_slug: newsItem?.game_slug || '',
      game_cover_url: newsItem?.game_cover_url || null,
      why_it_matters: h.why_it_matters || null,
      is_early_signal: h.is_early_signal || false,
    }
  })

  // Enrich game_updates with cover URLs
  const enrichedGameUpdates: Record<string, GameUpdate> = {}
  for (const [gameKey, update] of Object.entries(result.game_updates)) {
    const newsItem = newsItems.find(n => n.game_name === update.game_name)
    enrichedGameUpdates[gameKey] = {
      ...update,
      game_slug: newsItem?.game_slug || '',
      game_cover_url: newsItem?.game_cover_url || null,
    }
  }
  result.game_updates = enrichedGameUpdates

  result.total_news = newsItems.length
  return result
}

/**
 * Get or create a digest for a user
 */
export async function getUserNewsDigest(
  userId: string,
  digestType: 'daily' | 'weekly' = 'daily',
  forceRefresh: boolean = false
): Promise<DigestResult> {
  const supabase = await createClient()

  // Calculate date range
  const now = new Date()
  const startDate = new Date(now)
  if (digestType === 'weekly') {
    startDate.setDate(startDate.getDate() - 7)
  } else {
    startDate.setDate(startDate.getDate() - 1)
  }

  const digestDate = now.toISOString().split('T')[0]

  // Check for cached digest (skip if force refresh)
  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from('user_news_digest')
      .select('summary, highlights, game_updates, news_count')
      .eq('user_id', userId)
      .eq('digest_date', digestDate)
      .eq('digest_type', digestType)
      .single()

    if (cached) {
    // Ensure old cached data has the new fields with defaults
    const rawHighlights = cached.highlights as DigestHighlight[] | null
    const highlights = (rawHighlights || []).map(h => ({
      news_id: h.news_id || '',
      title: h.title || '',
      game_name: h.game_name || '',
      game_slug: h.game_slug || '',
      game_cover_url: h.game_cover_url || null,
      tldr: h.tldr || '',
      why_it_matters: h.why_it_matters || null,
      is_early_signal: h.is_early_signal || false,
      importance: h.importance || 'low',
      category: h.category || 'other',
    }))

    const rawGameUpdates = cached.game_updates as Record<string, GameUpdate> | null
    const gameUpdates: Record<string, GameUpdate> = {}
    if (rawGameUpdates) {
      for (const [key, update] of Object.entries(rawGameUpdates)) {
        if (update) {
          gameUpdates[key] = {
            game_name: update.game_name || '',
            game_slug: update.game_slug || '',
            game_cover_url: update.game_cover_url || null,
            update_count: update.update_count || 0,
            summary: update.summary || '',
            highlights: update.highlights || [],
          }
        }
      }
    }

    return {
      summary: cached.summary || '',
      highlights,
      game_updates: gameUpdates,
      total_news: cached.news_count || 0,
    }
    }
  }

  // Get user's followed games
  const { data: followedGames } = await supabase
    .from('user_games')
    .select('game_id')
    .eq('user_id', userId)

  if (!followedGames || followedGames.length === 0) {
    return {
      summary: "Follow some games to get personalized news digests!",
      highlights: [],
      game_updates: {},
      total_news: 0,
    }
  }

  const gameIds = followedGames.map(g => g.game_id)

  // Get news for followed games
  const { data: news } = await supabase
    .from('news_items')
    .select(`
      id,
      title,
      summary,
      published_at,
      source_name,
      games!inner(name, slug, cover_url)
    `)
    .in('game_id', gameIds)
    .gte('published_at', startDate.toISOString())
    .order('published_at', { ascending: false })
    .limit(50)

  if (!news || news.length === 0) {
    return {
      summary: `No news in the past ${digestType === 'weekly' ? 'week' : 'day'} for your games. All quiet on the gaming front!`,
      highlights: [],
      game_updates: {},
      total_news: 0,
    }
  }

  type GameInfo = { name: string; slug: string; cover_url: string | null }
  const newsItems: NewsItem[] = news.map(n => {
    const game = n.games as unknown as GameInfo
    return {
      id: n.id,
      title: n.title,
      summary: n.summary || '',
      game_name: game.name,
      game_slug: game.slug,
      game_cover_url: game.cover_url,
      published_at: n.published_at,
      source: n.source_name || undefined,
    }
  })

  const digest = await generateNewsDigest(newsItems, digestType)

  // Cache the digest (non-blocking)
  try {
    await supabase.from('user_news_digest').insert({
      user_id: userId,
      digest_date: digestDate,
      digest_type: digestType,
      summary: digest.summary,
      highlights: digest.highlights,
      game_updates: digest.game_updates,
      news_count: digest.total_news,
    })
  } catch {
    // Silently fail - caching is optional
  }

  return digest
}

/**
 * Summarize a single news article
 */
export async function summarizeNewsArticle(
  title: string,
  content: string,
  gameName: string
): Promise<{ tldr: string; category: string; importance: string }> {
  const result = await generateJSON<{ tldr: string; category: string; importance: string }>(
    `Summarize this gaming news article in one sentence. Categorize it and rate importance.`,
    `Game: ${gameName}\nTitle: ${title}\n\n${content.slice(0, 3000)}`,
    { maxTokens: 200, temperature: 0.3 }
  )

  return result
}
