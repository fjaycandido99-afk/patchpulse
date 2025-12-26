'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic()

type DiscoveredRelease = {
  title: string
  releaseType: 'game' | 'dlc' | 'expansion' | 'update' | 'season'
  releaseDate: string | null // YYYY-MM-DD format
  releaseWindow: string | null // "Q1 2025", "Holiday 2025"
  platforms: string[]
  description: string
  sourceUrl: string | null
  isConfirmed: boolean
  confidence: number
}

type ReleaseDiscoveryResult = {
  success: boolean
  releases: DiscoveredRelease[]
  error?: string
}

export async function discoverUpcomingReleases(input: {
  gameName: string
  gameId: string
}): Promise<ReleaseDiscoveryResult> {
  const { gameName, gameId } = input

  try {
    const currentDate = new Date().toISOString().split('T')[0]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Search for upcoming releases, DLC, expansions, major updates, or new seasons for the game "${gameName}".

Current date: ${currentDate}

Find any official announcements for:
1. New game releases (sequels, remakes, remasters)
2. DLC or expansion packs
3. Major content updates
4. New seasons or chapters
5. Definitive/enhanced editions

For each upcoming release found, provide:
- Title (exact name of the release)
- Type: game, dlc, expansion, update, or season
- Release date (YYYY-MM-DD format if known, null if unknown)
- Release window (e.g., "Q1 2025", "Holiday 2025", "2025" if no exact date)
- Platforms (array like ["PS5", "Xbox Series X", "PC", "Nintendo Switch"])
- Brief description (1-2 sentences)
- Source URL (official announcement or reliable news source)
- Whether it's officially confirmed or just rumored
- Confidence score (0.0-1.0)

Only include releases that:
- Are upcoming (not yet released)
- Have been officially announced or strongly rumored
- Are for this specific game/franchise

Respond in JSON format:
{
  "releases": [
    {
      "title": "Game Name: Expansion Title",
      "releaseType": "dlc",
      "releaseDate": "2025-03-15",
      "releaseWindow": "Q1 2025",
      "platforms": ["PS5", "Xbox Series X", "PC"],
      "description": "Brief description of what this release includes.",
      "sourceUrl": "https://...",
      "isConfirmed": true,
      "confidence": 0.95
    }
  ]
}

If no upcoming releases are found, return: { "releases": [] }`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return { success: false, releases: [], error: 'Unexpected response type' }
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, releases: [], error: 'No JSON found in response' }
    }

    const parsed = JSON.parse(jsonMatch[0])
    const releases: DiscoveredRelease[] = (parsed.releases || []).map((r: any) => ({
      title: r.title || '',
      releaseType: r.releaseType || 'game',
      releaseDate: r.releaseDate || null,
      releaseWindow: r.releaseWindow || null,
      platforms: r.platforms || [],
      description: r.description || '',
      sourceUrl: r.sourceUrl || null,
      isConfirmed: r.isConfirmed ?? false,
      confidence: r.confidence ?? 0.8,
    }))

    // Save to database
    const supabase = createAdminClient()

    for (const release of releases) {
      await supabase
        .from('upcoming_releases')
        .upsert(
          {
            game_id: gameId,
            title: release.title,
            release_type: release.releaseType,
            release_date: release.releaseDate,
            release_window: release.releaseWindow,
            platforms: release.platforms,
            description: release.description,
            source_url: release.sourceUrl,
            is_confirmed: release.isConfirmed,
            confidence_score: release.confidence,
            last_updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'game_id,title',
          }
        )
    }

    // Update discovery queue
    await supabase
      .from('release_discovery_queue')
      .upsert(
        {
          game_id: gameId,
          status: 'completed',
          last_checked_at: new Date().toISOString(),
          next_check_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Check again in 7 days
          check_count: 1,
        },
        {
          onConflict: 'game_id',
        }
      )

    return { success: true, releases }
  } catch (error) {
    console.error('Error discovering releases:', error)
    return {
      success: false,
      releases: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Process pending release discovery jobs
export async function processReleaseDiscoveryQueue(limit = 5): Promise<number> {
  const supabase = createAdminClient()

  // Get pending items
  const { data: queue } = await supabase
    .from('release_discovery_queue')
    .select('game_id, games(name)')
    .eq('status', 'pending')
    .lte('next_check_at', new Date().toISOString())
    .limit(limit)

  if (!queue || queue.length === 0) {
    return 0
  }

  let processed = 0

  for (const item of queue) {
    const gameData = item.games as unknown as { name: string } | null
    if (!gameData) continue

    // Mark as processing
    await supabase
      .from('release_discovery_queue')
      .update({ status: 'processing' })
      .eq('game_id', item.game_id)

    // Discover releases
    const result = await discoverUpcomingReleases({
      gameName: gameData.name,
      gameId: item.game_id,
    })

    if (result.success) {
      processed++
    } else {
      // Mark as failed
      await supabase
        .from('release_discovery_queue')
        .update({
          status: 'failed',
          next_check_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Retry in 1 day
        })
        .eq('game_id', item.game_id)
    }
  }

  return processed
}
