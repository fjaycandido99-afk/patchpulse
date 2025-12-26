import Anthropic from '@anthropic-ai/sdk'

// ============================================================================
// TYPES
// ============================================================================

export type SeasonalDiscoveryResult = {
  found: boolean
  events: SeasonalEventDiscovery[]
  confidence: number
  searchSummary: string
}

export type SeasonalEventDiscovery = {
  eventName: string
  eventType: 'winter' | 'halloween' | 'summer' | 'spring' | 'anniversary' | 'sale' | 'collaboration' | 'update' | 'launch' | 'esports' | 'custom'
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  coverUrl: string | null
  logoUrl: string | null
  heroUrl: string | null
  brandColor: string | null
  sourceUrl: string | null
  confidence: number // 0-1
  reasoning: string
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const SEASONAL_DISCOVERY_SYSTEM = `You are an expert gaming events researcher. Your job is to discover and identify active promotional events, seasonal content, and special artwork for video games.

You have deep knowledge of:
- Annual gaming events (Christmas/Winter events, Halloween, Summer events, Anniversaries)
- Major game sales and promotions (Steam Sales, Epic Sales, etc.)
- Game-specific events and seasons (Battle passes, Seasonal content, Limited-time modes)
- Esports events and tournaments
- Major game updates and launches
- Collaborations and crossover events

When analyzing a game, consider:
1. The current date and what seasonal events are typically active
2. The game's history of events and when they usually occur
3. Known annual patterns for this game
4. Any recent news or announcements

Return your findings as structured JSON. Be conservative with confidence scores - only high confidence (>0.8) should be auto-approved.`

const SEASONAL_SEARCH_SYSTEM = `You are a gaming research assistant that searches for promotional artwork and event imagery.

When given search results about a game's events, extract:
1. Direct image URLs (prefer high-resolution official art)
2. Event names and types
3. Event date ranges
4. Source URLs for verification

Prioritize:
- Official sources (Steam, Epic, Publisher sites, Official Twitter)
- High-resolution promotional art
- Key art and hero images over screenshots

Return structured JSON with your findings.`

// ============================================================================
// PROVIDER
// ============================================================================

const anthropic = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(
  system: string,
  userPrompt: string,
  maxTokens: number = 2048
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((c) => c.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI')
  }

  return textBlock.text
}

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
// DISCOVERY FUNCTIONS
// ============================================================================

// Get the current season context
function getCurrentSeasonContext(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const year = now.getFullYear()

  const seasons: string[] = []

  // Holiday seasons
  if (month === 12 || (month === 1 && day <= 7)) {
    seasons.push('Winter/Holiday season (Christmas, New Year)')
  }
  if (month === 10 && day >= 15) {
    seasons.push('Halloween season')
  }
  if (month === 11 && day >= 20 && day <= 30) {
    seasons.push('Black Friday / Thanksgiving')
  }
  if ((month === 6 && day >= 20) || month === 7 || (month === 8 && day <= 15)) {
    seasons.push('Summer season')
  }
  if ((month === 3 && day >= 20) || month === 4) {
    seasons.push('Spring season (Easter possible)')
  }

  // Sale seasons
  if (month === 6 && day >= 20 && day <= 30) {
    seasons.push('Steam Summer Sale period')
  }
  if (month === 12 && day >= 18) {
    seasons.push('Steam Winter Sale period')
  }
  if (month === 11 && day >= 20 && day <= 30) {
    seasons.push('Steam Autumn Sale period')
  }

  return `Current date: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}
Active seasons: ${seasons.length > 0 ? seasons.join(', ') : 'None specifically'}`
}

// Discover seasonal events for a game using AI reasoning
export async function discoverSeasonalArtwork(input: {
  gameName: string
  gameId: string
  gameGenre?: string
  isLiveService?: boolean
}): Promise<SeasonalDiscoveryResult> {
  const seasonContext = getCurrentSeasonContext()

  const prompt = `Analyze the following game for current or upcoming promotional events and seasonal content:

Game: ${input.gameName}
Genre: ${input.gameGenre || 'Unknown'}
Live Service Game: ${input.isLiveService ? 'Yes' : 'Unknown'}

${seasonContext}

Based on your knowledge of this game and the current time period:

1. What seasonal or promotional events might currently be active for this game?
2. What is the typical event schedule for this game throughout the year?
3. Are there any major updates, anniversaries, or collaborations happening?

For each potential event, provide:
- Event name (official if known, descriptive if estimated)
- Event type (winter, halloween, summer, spring, anniversary, sale, collaboration, update, launch, esports, custom)
- Estimated start and end dates (YYYY-MM-DD format)
- Confidence level (0-1, be conservative - only >0.8 for confirmed events)
- Where to find official promotional artwork (Steam store page, official site, etc.)
- Reasoning for this prediction

Return JSON in this format:
{
  "found": boolean,
  "events": [
    {
      "eventName": "string",
      "eventType": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "coverUrl": null,
      "logoUrl": null,
      "heroUrl": null,
      "brandColor": null,
      "sourceUrl": "suggested URL to check",
      "confidence": 0.0-1.0,
      "reasoning": "why you believe this event is active"
    }
  ],
  "confidence": 0.0-1.0,
  "searchSummary": "brief summary of findings"
}

Be conservative with confidence scores:
- 0.9-1.0: Known annual event at its confirmed time
- 0.7-0.8: Likely event based on strong patterns
- 0.5-0.6: Possible event, needs verification
- <0.5: Speculative

If you're not confident about any current events, return found: false with an empty events array.`

  try {
    const raw = await callClaude(SEASONAL_DISCOVERY_SYSTEM, prompt)
    const result = parseJSON<SeasonalDiscoveryResult>(raw)

    // Validate and sanitize results
    return {
      found: result.found && result.events.length > 0,
      events: result.events.map((e) => ({
        ...e,
        confidence: Math.max(0, Math.min(1, e.confidence)),
        eventType: validateEventType(e.eventType),
      })),
      confidence: Math.max(0, Math.min(1, result.confidence)),
      searchSummary: result.searchSummary || '',
    }
  } catch (error) {
    console.error('Seasonal discovery failed:', error)
    return {
      found: false,
      events: [],
      confidence: 0,
      searchSummary: 'Discovery failed due to an error',
    }
  }
}

// Validate event type
function validateEventType(type: string): SeasonalEventDiscovery['eventType'] {
  const validTypes = [
    'winter', 'halloween', 'summer', 'spring',
    'anniversary', 'sale', 'collaboration',
    'update', 'launch', 'esports', 'custom'
  ]
  return validTypes.includes(type) ? type as SeasonalEventDiscovery['eventType'] : 'custom'
}

// Extract artwork URLs from a webpage (to be used with WebFetch)
export async function extractArtworkFromPage(
  gameName: string,
  eventName: string,
  pageContent: string,
  sourceUrl: string
): Promise<{
  coverUrl: string | null
  logoUrl: string | null
  heroUrl: string | null
  brandColor: string | null
  confidence: number
}> {
  const prompt = `Analyze this webpage content to extract promotional artwork for:
Game: ${gameName}
Event: ${eventName}
Source: ${sourceUrl}

Page Content:
${pageContent.slice(0, 8000)}

Find and return:
1. Cover/key art image URL (high-res promotional image)
2. Logo URL (game or event logo)
3. Hero/banner image URL (wide promotional banner)
4. Dominant brand color (hex format)

Return JSON:
{
  "coverUrl": "full image URL or null",
  "logoUrl": "full image URL or null",
  "heroUrl": "full image URL or null",
  "brandColor": "#hexcode or null",
  "confidence": 0.0-1.0
}

Only return URLs that are:
- Direct image links (ending in .jpg, .png, .webp, etc.)
- High resolution (prefer 1920x1080 or larger)
- Official promotional art (not screenshots or user content)`

  try {
    const raw = await callClaude(SEASONAL_SEARCH_SYSTEM, prompt, 1024)
    return parseJSON(raw)
  } catch {
    return {
      coverUrl: null,
      logoUrl: null,
      heroUrl: null,
      brandColor: null,
      confidence: 0,
    }
  }
}

// Generate Steam store URL for a game
export function getSteamStoreUrl(gameName: string): string {
  const searchQuery = encodeURIComponent(gameName)
  return `https://store.steampowered.com/search/?term=${searchQuery}`
}

// Generate search queries for finding seasonal artwork
export function generateSearchQueries(
  gameName: string,
  eventName?: string
): string[] {
  const queries: string[] = []
  const year = new Date().getFullYear()

  if (eventName) {
    queries.push(`${gameName} ${eventName} ${year} promotional art`)
    queries.push(`${gameName} ${eventName} official artwork`)
  }

  // Generic seasonal queries
  queries.push(`${gameName} ${year} event artwork`)
  queries.push(`${gameName} seasonal event ${year}`)
  queries.push(`${gameName} promotional art official`)

  return queries
}

// Batch discovery for multiple games
export async function batchDiscoverSeasonalArtwork(
  games: Array<{ id: string; name: string; genre?: string; isLiveService?: boolean }>
): Promise<Map<string, SeasonalDiscoveryResult>> {
  const results = new Map<string, SeasonalDiscoveryResult>()

  // Process in parallel with a concurrency limit
  const batchSize = 3
  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize)
    const promises = batch.map((game) =>
      discoverSeasonalArtwork({
        gameName: game.name,
        gameId: game.id,
        gameGenre: game.genre,
        isLiveService: game.isLiveService,
      }).then((result) => ({ gameId: game.id, result }))
    )

    const batchResults = await Promise.all(promises)
    for (const { gameId, result } of batchResults) {
      results.set(gameId, result)
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < games.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return results
}
