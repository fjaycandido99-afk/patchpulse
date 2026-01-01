'use server'

import Parser from 'rss-parser'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
})

// Blizzard game feeds - maps game slug patterns to their news feeds
const BLIZZARD_FEEDS: Record<string, { name: string; feedUrl: string; patchKeywords: string[] }> = {
  'world-of-warcraft': {
    name: 'World of Warcraft',
    feedUrl: 'https://news.blizzard.com/en-us/world-of-warcraft/feed',
    patchKeywords: ['hotfix', 'patch', 'update', 'maintenance', 'notes', 'fix', 'balance'],
  },
  'diablo-4': {
    name: 'Diablo IV',
    feedUrl: 'https://news.blizzard.com/en-us/diablo4/feed',
    patchKeywords: ['hotfix', 'patch', 'update', 'notes', 'fix', 'season', 'balance'],
  },
  'diablo-iv': {
    name: 'Diablo IV',
    feedUrl: 'https://news.blizzard.com/en-us/diablo4/feed',
    patchKeywords: ['hotfix', 'patch', 'update', 'notes', 'fix', 'season', 'balance'],
  },
  'overwatch-2': {
    name: 'Overwatch 2',
    feedUrl: 'https://news.blizzard.com/en-us/overwatch/feed',
    patchKeywords: ['patch', 'update', 'notes', 'hero', 'balance', 'fix', 'hotfix'],
  },
  'hearthstone': {
    name: 'Hearthstone',
    feedUrl: 'https://news.blizzard.com/en-us/hearthstone/feed',
    patchKeywords: ['patch', 'update', 'balance', 'nerf', 'buff', 'notes'],
  },
  'starcraft-ii': {
    name: 'StarCraft II',
    feedUrl: 'https://news.blizzard.com/en-us/starcraft2/feed',
    patchKeywords: ['patch', 'update', 'balance', 'notes', 'fix'],
  },
}

type FeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
}

export async function fetchBattlenetPatches(gameSlug: string, gameId: string, gameName: string) {
  // Find matching Blizzard feed
  const feedConfig = Object.entries(BLIZZARD_FEEDS).find(([slug]) =>
    gameSlug.includes(slug) || slug.includes(gameSlug)
  )?.[1]

  if (!feedConfig) {
    return { success: false, error: 'No Battle.net feed for this game', addedCount: 0 }
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

      // Check for duplicates by source URL
      const { data: existingByUrl } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('source_url', item.link)
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
      if (rawText.length < 50) continue

      // Insert patch with source URL
      const { data: newPatch, error } = await supabase
        .from('patch_notes')
        .insert({
          game_id: gameId,
          title: item.title || `${gameName} Update`,
          source_url: item.link, // Important: include source URL
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
        console.error(`Failed to insert Battle.net patch for ${gameName}:`, error)
        continue
      }

      if (newPatch) {
        await queueAIJob('PATCH_SUMMARY', newPatch.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    console.error(`Failed to fetch Battle.net patches for ${gameName}:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', addedCount: 0 }
  }
}

// Fetch patches for all Blizzard games in our database
export async function fetchAllBattlenetPatches() {
  const supabase = createAdminClient()

  // Get games that match Blizzard titles
  const blizzardSlugs = Object.keys(BLIZZARD_FEEDS)
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, slug')
    .or(blizzardSlugs.map(s => `slug.ilike.%${s}%`).join(','))
    .limit(20)

  if (error || !games || games.length === 0) {
    return { success: true, totalAdded: 0, gamesChecked: 0 }
  }

  let totalAdded = 0
  const errors: string[] = []

  for (const game of games) {
    const result = await fetchBattlenetPatches(game.slug, game.id, game.name)

    if (result.success) {
      totalAdded += result.addedCount || 0
    } else if (result.error && result.error !== 'No Battle.net feed for this game') {
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
