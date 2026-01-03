'use server'

import Parser from 'rss-parser'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  timeout: 15000,
})

// Epic Games titles with their patch note sources
const EPIC_FEEDS: Record<string, { name: string; feedUrl: string; patchKeywords: string[] }> = {
  'fortnite': {
    name: 'Fortnite',
    feedUrl: 'https://www.fortnite.com/news/rss',
    patchKeywords: ['update', 'patch', 'hotfix', 'notes', 'v.', 'chapter', 'season', 'maintenance'],
  },
  'rocket-league': {
    name: 'Rocket League',
    feedUrl: 'https://www.rocketleague.com/news/rss',
    patchKeywords: ['update', 'patch', 'notes', 'hotfix', 'season', 'fix'],
  },
  'fall-guys': {
    name: 'Fall Guys',
    feedUrl: 'https://www.fallguys.com/news/rss',
    patchKeywords: ['update', 'patch', 'season', 'notes', 'hotfix', 'fix'],
  },
}

// Alternative: Use Epic Games Store API for game updates
const EPIC_STORE_NEWS_URL = 'https://store-content.ak.epicgames.com/api/en-US/content/products'

type FeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
  guid?: string
}

export async function fetchEpicPatches(gameSlug: string, gameId: string, gameName: string) {
  // Find matching Epic feed
  const feedConfig = Object.entries(EPIC_FEEDS).find(([slug]) =>
    gameSlug.includes(slug) || slug.includes(gameSlug) ||
    gameName.toLowerCase().includes(slug.replace('-', ' '))
  )?.[1]

  if (!feedConfig) {
    return { success: false, error: 'No Epic Games feed for this game', addedCount: 0 }
  }

  try {
    const feed = await parser.parseURL(feedConfig.feedUrl)
    const supabase = createAdminClient()
    let addedCount = 0

    for (const item of feed.items as FeedItem[]) {
      const title = item.title?.toLowerCase() || ''

      // Check if this is a patch/update post
      const isPatch = feedConfig.patchKeywords.some(keyword => title.includes(keyword))
      if (!isPatch) continue

      const sourceUrl = item.link || item.guid || ''
      if (!sourceUrl) continue // Skip items without URL

      // Check for duplicates by source URL
      const { data: existingByUrl } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('source_url', sourceUrl)
        .single()

      if (existingByUrl) continue

      // Check for similar title
      const { data: existingByTitle } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('game_id', gameId)
        .ilike('title', `%${item.title?.slice(0, 50) || ''}%`)
        .limit(1)

      if (existingByTitle && existingByTitle.length > 0) continue

      const rawText = item.contentSnippet || item.content || ''
      if (rawText.length < 30) continue // Epic posts can be shorter

      // Insert patch with source URL
      const { data: newPatch, error } = await supabase
        .from('patch_notes')
        .insert({
          game_id: gameId,
          title: item.title || `${gameName} Update`,
          source_url: sourceUrl,
          raw_text: rawText.slice(0, 10000),
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          summary_tldr: 'AI summary pending...',
          impact_score: 5,
          tags: [],
          key_changes: [],
        })
        .select('id')
        .single()

      if (error) {
        console.error(`Failed to insert Epic patch for ${gameName}:`, error)
        continue
      }

      if (newPatch) {
        await queueAIJob('PATCH_SUMMARY', newPatch.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    // Epic often blocks server-side requests with 403 - this is expected
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      console.log(`[Epic] Feed blocked for ${gameName} (403) - Epic uses bot protection`)
      return { success: true, addedCount: 0 } // Don't treat as error, just skip
    }
    console.error(`Failed to fetch Epic patches for ${gameName}:`, error)
    return { success: false, error: errorMessage, addedCount: 0 }
  }
}

// Fetch patches for all Epic games in our database
export async function fetchAllEpicPatches() {
  const supabase = createAdminClient()

  // Get games that match Epic titles
  const epicSlugs = Object.keys(EPIC_FEEDS)
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, slug')
    .or(epicSlugs.map(s => `slug.ilike.%${s}%`).join(',') + ',' + epicSlugs.map(s => `name.ilike.%${s.replace('-', ' ')}%`).join(','))
    .limit(20)

  if (error || !games || games.length === 0) {
    return { success: true, totalAdded: 0, gamesChecked: 0 }
  }

  let totalAdded = 0
  const errors: string[] = []

  for (const game of games) {
    const result = await fetchEpicPatches(game.slug, game.id, game.name)

    if (result.success) {
      totalAdded += result.addedCount || 0
    } else if (result.error && result.error !== 'No Epic Games feed for this game') {
      errors.push(`${game.name}: ${result.error}`)
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return {
    success: true,
    totalAdded,
    gamesChecked: games.length,
    errors: errors.length > 0 ? errors : undefined,
  }
}
