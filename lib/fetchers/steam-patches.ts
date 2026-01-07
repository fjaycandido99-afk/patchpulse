'use server'

import Parser from 'rss-parser'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

const parser = new Parser({
  customFields: {
    item: ['description'],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
})

type SteamFeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
}

// Fetch Steam news/patches for a game
export async function fetchSteamPatches(steamAppId: number, gameId: string, gameName: string) {
  const feedUrl = `https://store.steampowered.com/feeds/news/app/${steamAppId}`

  try {
    const feed = await parser.parseURL(feedUrl)
    const supabase = createAdminClient()

    let addedCount = 0

    for (const item of feed.items as SteamFeedItem[]) {
      // Skip non-patch items (look for keywords in title and content)
      const title = item.title?.toLowerCase() || ''
      const content = (item.contentSnippet || item.content || '').toLowerCase()

      // Title-based detection (expanded keywords)
      const titleIsPatch = title.includes('update') ||
                      title.includes('patch') ||
                      title.includes('hotfix') ||
                      title.includes('fix') ||
                      title.includes('version') ||
                      title.includes('changelog') ||
                      title.includes('release note') ||
                      title.includes('maintenance') ||
                      title.includes('notes') ||
                      title.includes('build') ||
                      title.includes('release') ||
                      title.includes('season') ||
                      title.includes('chapter') ||
                      title.includes('balance') ||
                      title.includes('nerf') ||
                      title.includes('buff') ||
                      title.includes('rework') ||
                      title.includes('changes') ||
                      title.includes('adjustment') ||
                      // Version patterns like v0.15.1.0, v1.2, etc.
                      /v\d+\.\d+/.test(title) ||
                      // Numbered updates like "1.14.105" or "1.14"
                      /\d+\.\d+(\.\d+)?/.test(title) ||
                      // Build numbers like "Build 12345"
                      /build\s*\d+/i.test(title)

      // Content-based detection (expanded - if title doesn't match)
      const contentIsPatch = content.includes('bug fix') ||
                             content.includes('patch note') ||
                             content.includes('changelog') ||
                             content.includes('balance change') ||
                             content.includes('we have released') ||
                             content.includes('has been released') ||
                             content.includes('now live') ||
                             content.includes('is now available') ||
                             content.includes('fixed') ||
                             content.includes('improved') ||
                             content.includes('added') ||
                             content.includes('removed') ||
                             content.includes('changed') ||
                             content.includes('nerfed') ||
                             content.includes('buffed') ||
                             content.includes('tweaked') ||
                             content.includes('addressed') ||
                             content.includes('resolved') ||
                             content.includes('stability') ||
                             content.includes('performance')

      if (!titleIsPatch && !contentIsPatch) continue

      // Check if we already have this patch (by source_url OR similar title)
      const { data: existingByUrl } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('source_url', item.link)
        .single()

      if (existingByUrl) continue

      // Also check by similar title for the same game (prevent duplicates from different sources)
      const { data: existingByTitle } = await supabase
        .from('patch_notes')
        .select('id, title')
        .eq('game_id', gameId)
        .ilike('title', `%${item.title?.slice(0, 50) || ''}%`)
        .limit(1)

      if (existingByTitle && existingByTitle.length > 0) continue

      // Extract raw text from content
      const rawText = item.contentSnippet || item.content || ''

      if (rawText.length < 20) continue // Skip too-short entries (reduced threshold)

      // Insert the patch
      const { data: newPatch, error } = await supabase
        .from('patch_notes')
        .insert({
          game_id: gameId,
          title: item.title || `${gameName} Update`,
          source_url: item.link,
          raw_text: rawText.slice(0, 10000), // Limit raw text size
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          summary_tldr: 'AI summary pending...',
          impact_score: 5,
          tags: [],
          key_changes: [],
        })
        .select('id')
        .single()

      if (error) {
        console.error(`Failed to insert patch for ${gameName}:`, error)
        continue
      }

      // Queue AI processing
      if (newPatch) {
        await queueAIJob('PATCH_SUMMARY', newPatch.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    console.error(`Failed to fetch Steam patches for app ${steamAppId}:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Process a batch of games in parallel
async function processBatch(
  games: { id: string; name: string; steam_app_id: number }[],
  errors: string[]
): Promise<number> {
  const results = await Promise.allSettled(
    games.map(game =>
      Promise.race([
        fetchSteamPatches(game.steam_app_id, game.id, game.name),
        // Per-game timeout of 8 seconds
        new Promise<{ success: false; error: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ])
    )
  )

  let added = 0
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.success) {
      added += result.value.addedCount || 0
    } else if (result.status === 'rejected') {
      // Only log non-404 errors (404 means game doesn't have a feed)
      const errorMsg = result.reason?.message || 'Unknown error'
      if (!errorMsg.includes('404')) {
        errors.push(`${games[i].name}: ${errorMsg}`)
      }
    }
  })

  return added
}

// Fetch patches for all games with Steam App IDs
export async function fetchAllSteamPatches() {
  const startTime = Date.now()
  const MAX_RUNTIME = 60000 // 60 seconds max for this fetcher
  const BATCH_SIZE = 10 // Process 10 games in parallel

  const supabase = createAdminClient()

  // Get ALL games with Steam App IDs (no limit)
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, steam_app_id')
    .not('steam_app_id', 'is', null)
    .order('name')

  if (error || !games) {
    return { success: false, error: error?.message || 'No games found' }
  }

  let totalAdded = 0
  const errors: string[] = []
  let gamesProcessed = 0

  // Process in batches
  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    // Check if we're running out of time
    if (Date.now() - startTime > MAX_RUNTIME) {
      console.log(`[Steam] Stopping early - processed ${gamesProcessed}/${games.length} games in ${MAX_RUNTIME}ms`)
      break
    }

    const batch = games.slice(i, i + BATCH_SIZE).filter(g => g.steam_app_id) as { id: string; name: string; steam_app_id: number }[]
    const batchAdded = await processBatch(batch, errors)
    totalAdded += batchAdded
    gamesProcessed += batch.length

    // Small delay between batches to be nice to Steam
    if (i + BATCH_SIZE < games.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return {
    success: true,
    totalAdded,
    gamesChecked: gamesProcessed,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limit errors returned
  }
}
