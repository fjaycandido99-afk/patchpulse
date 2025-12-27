'use server'

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchSteamAppId, getSteamImageUrls } from '@/lib/fetchers/steam-images'

// ============================================================================
// TYPES
// ============================================================================

export type GameDiscoveryResult = {
  success: boolean
  game?: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
  confidence: number
  error?: string
  needsReview?: boolean
}

type AIGameData = {
  name: string
  slug: string
  cover_url: string | null
  logo_url: string | null
  brand_color: string | null
  platforms: string[]
  release_date: string | null
  developer: string | null
  publisher: string | null
  genre: string | null
  is_live_service: boolean
  description: string | null
  confidence: number
}

// ============================================================================
// PROMPTS
// ============================================================================

const GAME_DISCOVERY_SYSTEM = `You are a gaming database assistant that finds accurate information about video games.

Rules:
- Only return factual, verifiable information about games.
- Use official sources: Steam, Epic Games Store, PlayStation Store, Xbox Store, Nintendo eShop, official game websites.
- For cover art, prefer high-quality vertical cover images (Steam capsule format preferred).
- Brand color should be the dominant accent color from the game's marketing/logo.
- If information is uncertain, indicate lower confidence.
- Never make up or guess information - if you can't find it, leave it null.`

function getGameDiscoveryPrompt(searchQuery: string): string {
  return `TASK: Find accurate information about this video game.

SEARCH QUERY: "${searchQuery}"

Search for this game and return its information. Look for:
1. Official game name (exact spelling and capitalization)
2. Cover art URL (prefer Steam vertical capsule images from cdn.akamai.steamstatic.com or similar CDN)
3. Logo URL if available
4. Platforms (PC, PlayStation, Xbox, Nintendo Switch, Mobile)
5. Release date
6. Developer and Publisher
7. Genre
8. Whether it's a live service game (ongoing updates/seasons)

Return JSON with this schema:
{
  "name": "string (official game name)",
  "slug": "string (lowercase, hyphens only, e.g., 'elden-ring')",
  "cover_url": "string or null (direct image URL, prefer HTTPS)",
  "logo_url": "string or null",
  "brand_color": "string or null (hex color like '#FF5500')",
  "platforms": ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
  "release_date": "string or null (YYYY-MM-DD format)",
  "developer": "string or null",
  "publisher": "string or null",
  "genre": "string or null (primary genre)",
  "is_live_service": "boolean",
  "description": "string or null (1-2 sentence description)",
  "confidence": "float 0-1 (how confident you are this is the right game and data is accurate)"
}

Important:
- If you find multiple games matching the query, pick the most popular/relevant one.
- If you cannot find the game at all, return {"confidence": 0} with other fields null.
- Confidence thresholds:
  - 0.9-1.0: Exact match, all data verified
  - 0.7-0.9: Good match, most data verified
  - 0.5-0.7: Partial match, some uncertainty
  - <0.5: Low confidence, may need review

Output ONLY valid JSON, no markdown or explanation.`
}

// ============================================================================
// AI PROVIDERS
// ============================================================================

// OpenAI (primary - no web search but reliable)
let _openai: OpenAI | null = null
function getOpenAIClient() {
  if (!_openai) _openai = new OpenAI()
  return _openai
}

// Anthropic (fallback with web search when credits available)
let _anthropic: Anthropic | null = null
function getAnthropicClient() {
  if (!_anthropic) _anthropic = new Anthropic()
  return _anthropic
}

const OPENAI_MODEL = 'gpt-4o'
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'

function parseJSON<T>(text: string): T {
  let cleaned = text.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  return JSON.parse(cleaned.trim()) as T
}

// ============================================================================
// AI DISCOVERY FUNCTIONS
// ============================================================================

// Try Anthropic with web search first, fall back to OpenAI
async function discoverWithAI(searchQuery: string): Promise<AIGameData> {
  // Try Anthropic with web search if API key is available
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await getAnthropicClient().messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: GAME_DISCOVERY_SYSTEM,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5,
          },
        ],
        messages: [{ role: 'user', content: getGameDiscoveryPrompt(searchQuery) }],
      })

      const textBlock = response.content.find((c) => c.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        return parseJSON<AIGameData>(textBlock.text)
      }
    } catch (error) {
      // Check if it's a credit balance error
      const errorMessage = error instanceof Error ? error.message : ''
      if (errorMessage.includes('credit balance') || errorMessage.includes('402')) {
        console.log('Anthropic credits low, falling back to OpenAI')
      } else {
        console.error('Anthropic error, falling back to OpenAI:', error)
      }
    }
  }

  // Fallback to OpenAI (no web search, uses training data)
  const response = await getOpenAIClient().chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: GAME_DISCOVERY_SYSTEM },
      { role: 'user', content: getGameDiscoveryPrompt(searchQuery) },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  return parseJSON<AIGameData>(content)
}

// ============================================================================
// MAIN DISCOVERY FUNCTION
// ============================================================================

export async function discoverGame(searchQuery: string): Promise<GameDiscoveryResult> {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return { success: false, confidence: 0, error: 'Search query too short' }
  }

  const supabase = createAdminClient()

  // First check if game already exists (fuzzy match)
  const { data: existingGames } = await supabase
    .from('games')
    .select('id, name, slug, cover_url')
    .ilike('name', `%${searchQuery.trim()}%`)
    .limit(5)

  // Exact match check
  const exactMatch = existingGames?.find(
    g => g.name.toLowerCase() === searchQuery.trim().toLowerCase()
  )

  if (exactMatch) {
    return {
      success: true,
      game: exactMatch,
      confidence: 1,
    }
  }

  // Close match check (to prevent duplicates)
  const closeMatch = existingGames?.find(g => {
    const similarity = calculateSimilarity(g.name.toLowerCase(), searchQuery.toLowerCase())
    return similarity > 0.85
  })

  if (closeMatch) {
    return {
      success: true,
      game: closeMatch,
      confidence: 0.95,
    }
  }

  // Use AI to discover game data
  try {
    const aiData = await discoverWithAI(searchQuery)

    // Low confidence - return for review
    if (aiData.confidence < 0.5 || !aiData.name) {
      return {
        success: false,
        confidence: aiData.confidence,
        error: 'Game not found or low confidence',
        needsReview: true,
      }
    }

    // Check again for duplicates with the official name
    const { data: duplicateCheck } = await supabase
      .from('games')
      .select('id, name, slug, cover_url')
      .or(`name.ilike.%${aiData.name}%,slug.eq.${aiData.slug}`)
      .limit(1)

    if (duplicateCheck && duplicateCheck.length > 0) {
      return {
        success: true,
        game: duplicateCheck[0],
        confidence: 0.95,
      }
    }

    // Confidence threshold for auto-add vs queue
    const autoApprove = aiData.confidence >= 0.85

    if (!autoApprove) {
      // Queue for admin review
      await supabase.from('game_discovery_queue').insert({
        search_query: searchQuery,
        discovered_data: aiData,
        confidence: aiData.confidence,
        status: 'pending_review',
      })

      return {
        success: false,
        confidence: aiData.confidence,
        needsReview: true,
        error: 'Game queued for admin review',
      }
    }

    // Try to find Steam App ID and get reliable images
    let steamAppId: number | null = null
    let steamImages: { cover_url: string; hero_url: string; logo_url: string } | null = null

    try {
      steamAppId = await searchSteamAppId(aiData.name)
      if (steamAppId) {
        const urls = getSteamImageUrls(steamAppId)
        steamImages = {
          cover_url: urls.cover_url,
          hero_url: urls.hero_url,
          logo_url: urls.logo_url,
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Steam images:', e)
    }

    // Auto-add the game (prefer Steam images over AI-provided URLs)
    const { data: newGame, error: insertError } = await supabase
      .from('games')
      .insert({
        name: aiData.name,
        slug: aiData.slug,
        cover_url: steamImages?.cover_url || aiData.cover_url,
        logo_url: steamImages?.logo_url || aiData.logo_url,
        hero_url: steamImages?.hero_url || null,
        brand_color: aiData.brand_color,
        platforms: aiData.platforms,
        release_date: aiData.release_date,
        genre: aiData.genre,
        is_live_service: aiData.is_live_service,
        steam_app_id: steamAppId,
        support_tier: 'partial', // New AI-discovered games start as partial support
        mvp_eligible: false,
      })
      .select('id, name, slug, cover_url')
      .single()

    if (insertError) {
      // Handle unique constraint violation (slug already exists)
      if (insertError.code === '23505') {
        const { data: existing } = await supabase
          .from('games')
          .select('id, name, slug, cover_url')
          .eq('slug', aiData.slug)
          .single()

        if (existing) {
          return {
            success: true,
            game: existing,
            confidence: 0.9,
          }
        }
      }

      return { success: false, confidence: 0, error: 'Failed to add game' }
    }

    return {
      success: true,
      game: newGame,
      confidence: aiData.confidence,
    }
  } catch (error) {
    console.error('Game discovery error:', error)
    return {
      success: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Discovery failed',
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '')
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (s1 === s2) return 1

  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1

  // Levenshtein distance
  const costs: number[] = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return (longer.length - costs[s2.length]) / longer.length
}

// ============================================================================
// BATCH DISCOVERY (for admin use)
// ============================================================================

export async function discoverMultipleGames(queries: string[]): Promise<{
  results: Array<{ query: string; result: GameDiscoveryResult }>
  successCount: number
  failedCount: number
}> {
  const results: Array<{ query: string; result: GameDiscoveryResult }> = []
  let successCount = 0
  let failedCount = 0

  // Process sequentially to avoid rate limits
  for (const query of queries) {
    const result = await discoverGame(query)
    results.push({ query, result })

    if (result.success) {
      successCount++
    } else {
      failedCount++
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return { results, successCount, failedCount }
}
