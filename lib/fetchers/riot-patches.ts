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

// Riot Games titles with their patch note sources
const RIOT_FEEDS: Record<string, { name: string; feedUrl: string; patchKeywords: string[] }> = {
  'league-of-legends': {
    name: 'League of Legends',
    feedUrl: 'https://www.leagueoflegends.com/en-us/news/game-updates/feed/',
    patchKeywords: ['patch', 'update', 'notes', 'hotfix', 'balance', 'fix', 'champion'],
  },
  'valorant': {
    name: 'Valorant',
    feedUrl: 'https://playvalorant.com/en-us/news/game-updates/feed/',
    patchKeywords: ['patch', 'update', 'notes', 'hotfix', 'agent', 'map', 'balance', 'fix'],
  },
  'teamfight-tactics': {
    name: 'Teamfight Tactics',
    feedUrl: 'https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/feed/',
    patchKeywords: ['patch', 'update', 'notes', 'set', 'balance', 'hotfix'],
  },
  'tft': {
    name: 'Teamfight Tactics',
    feedUrl: 'https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/feed/',
    patchKeywords: ['patch', 'update', 'notes', 'set', 'balance', 'hotfix'],
  },
  'wild-rift': {
    name: 'Wild Rift',
    feedUrl: 'https://wildrift.leagueoflegends.com/en-us/news/game-updates/feed/',
    patchKeywords: ['patch', 'update', 'notes', 'balance', 'champion', 'fix'],
  },
  'legends-of-runeterra': {
    name: 'Legends of Runeterra',
    feedUrl: 'https://playruneterra.com/en-us/news/game-updates/feed/',
    patchKeywords: ['patch', 'update', 'notes', 'balance', 'card', 'fix'],
  },
}

// Alternative JSON API endpoints for Riot
const RIOT_API_ENDPOINTS = {
  valorant: 'https://playvalorant.com/page-data/en-us/news/game-updates/page-data.json',
  lol: 'https://www.leagueoflegends.com/page-data/en-us/news/game-updates/page-data.json',
}

type FeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
  guid?: string
}

async function fetchRiotPatchesFromFeed(
  feedUrl: string,
  gameId: string,
  gameName: string,
  patchKeywords: string[]
): Promise<{ success: boolean; addedCount: number; error?: string }> {
  try {
    const feed = await parser.parseURL(feedUrl)
    const supabase = createAdminClient()
    let addedCount = 0

    for (const item of feed.items as FeedItem[]) {
      const title = item.title?.toLowerCase() || ''

      // Check if this is a patch/update post
      const isPatch = patchKeywords.some(keyword => title.includes(keyword))
      if (!isPatch) continue

      const sourceUrl = item.link || item.guid || ''
      if (!sourceUrl) continue

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
      if (rawText.length < 30) continue

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
        console.error(`Failed to insert Riot patch for ${gameName}:`, error)
        continue
      }

      if (newPatch) {
        await queueAIJob('PATCH_SUMMARY', newPatch.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    return {
      success: false,
      addedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Try to fetch from JSON API as fallback
async function fetchRiotPatchesFromAPI(
  apiUrl: string,
  gameId: string,
  gameName: string,
  patchKeywords: string[]
): Promise<{ success: boolean; addedCount: number; error?: string }> {
  try {
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) {
      return { success: false, addedCount: 0, error: `API returned ${response.status}` }
    }

    const data = await response.json()
    const articles = data?.result?.data?.allContentstackArticles?.nodes || []
    const supabase = createAdminClient()
    let addedCount = 0

    for (const article of articles) {
      const title = article.title?.toLowerCase() || ''
      const isPatch = patchKeywords.some(keyword => title.includes(keyword))
      if (!isPatch) continue

      const sourceUrl = article.url?.url || article.external_link || ''
      if (!sourceUrl) continue

      // Check for duplicates
      const { data: existing } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('source_url', sourceUrl)
        .single()

      if (existing) continue

      const rawText = article.description || article.summary || ''
      if (rawText.length < 30) continue

      const { data: newPatch, error } = await supabase
        .from('patch_notes')
        .insert({
          game_id: gameId,
          title: article.title || `${gameName} Update`,
          source_url: sourceUrl,
          raw_text: rawText.slice(0, 10000),
          published_at: article.date ? new Date(article.date).toISOString() : new Date().toISOString(),
          summary_tldr: 'AI summary pending...',
          impact_score: 5,
          tags: [],
          key_changes: [],
        })
        .select('id')
        .single()

      if (!error && newPatch) {
        await queueAIJob('PATCH_SUMMARY', newPatch.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    return {
      success: false,
      addedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function fetchRiotPatches(gameSlug: string, gameId: string, gameName: string) {
  // Find matching Riot feed
  const feedConfig = Object.entries(RIOT_FEEDS).find(([slug]) =>
    gameSlug.includes(slug) || slug.includes(gameSlug) ||
    gameName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(slug.replace(/-/g, ''))
  )?.[1]

  if (!feedConfig) {
    return { success: false, error: 'No Riot Games feed for this game', addedCount: 0 }
  }

  // Try RSS feed first
  const feedResult = await fetchRiotPatchesFromFeed(
    feedConfig.feedUrl,
    gameId,
    gameName,
    feedConfig.patchKeywords
  )

  if (feedResult.success && feedResult.addedCount > 0) {
    return feedResult
  }

  // If RSS fails or returns nothing, try API
  const apiEndpoint = gameSlug.includes('valorant')
    ? RIOT_API_ENDPOINTS.valorant
    : gameSlug.includes('league')
    ? RIOT_API_ENDPOINTS.lol
    : null

  if (apiEndpoint) {
    const apiResult = await fetchRiotPatchesFromAPI(
      apiEndpoint,
      gameId,
      gameName,
      feedConfig.patchKeywords
    )
    return apiResult
  }

  return feedResult
}

// Process a batch of games in parallel with timeout
async function processBatch(
  games: { id: string; name: string; slug: string }[],
  errors: string[]
): Promise<number> {
  const results = await Promise.allSettled(
    games.map(game =>
      Promise.race([
        fetchRiotPatches(game.slug, game.id, game.name),
        // Per-game timeout of 10 seconds (Riot has RSS + API fallback)
        new Promise<{ success: false; error: string; addedCount: 0 }>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ])
    )
  )

  let added = 0
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.success) {
      added += result.value.addedCount || 0
    } else if (result.status === 'rejected') {
      const errorMsg = result.reason?.message || 'Unknown error'
      if (!errorMsg.includes('404') && errorMsg !== 'Timeout') {
        errors.push(`${games[i].name}: ${errorMsg}`)
      }
    }
  })

  return added
}

// Fetch patches for all Riot games in our database
export async function fetchAllRiotPatches() {
  const startTime = Date.now()
  const MAX_RUNTIME = 45000 // 45 seconds max (Riot has fallback API calls)
  const BATCH_SIZE = 5 // Process 5 games in parallel

  const supabase = createAdminClient()

  // Get games that match Riot titles
  const riotGames = [
    'league-of-legends', 'lol', 'valorant', 'teamfight-tactics', 'tft',
    'wild-rift', 'legends-of-runeterra', 'lor'
  ]

  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, slug')
    .or(riotGames.map(s => `slug.ilike.%${s}%`).join(','))
    .limit(20)

  if (error || !games || games.length === 0) {
    return { success: true, totalAdded: 0, gamesChecked: 0 }
  }

  let totalAdded = 0
  const errors: string[] = []
  let gamesProcessed = 0

  // Process in batches
  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    // Check if we're running out of time
    if (Date.now() - startTime > MAX_RUNTIME) {
      console.log(`[Riot] Stopping early - processed ${gamesProcessed}/${games.length} games`)
      break
    }

    const batch = games.slice(i, i + BATCH_SIZE)
    const batchAdded = await processBatch(batch, errors)
    totalAdded += batchAdded
    gamesProcessed += batch.length

    // Small delay between batches
    if (i + BATCH_SIZE < games.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return {
    success: true,
    totalAdded,
    gamesChecked: gamesProcessed,
    errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
  }
}
