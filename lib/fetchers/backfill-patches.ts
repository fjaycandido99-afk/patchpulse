'use server'

import Parser from 'rss-parser'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

const parser = new Parser({
  customFields: {
    item: ['description'],
  },
})

type SteamFeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
}

// Backfill patches for a specific game (up to 4 months of history)
export async function backfillPatchesForGame(gameId: string): Promise<{
  success: boolean
  addedCount: number
  error?: string
}> {
  const supabase = createAdminClient()

  // Get the game details
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, name, slug, steam_app_id')
    .eq('id', gameId)
    .single()

  if (gameError || !game) {
    return { success: false, addedCount: 0, error: 'Game not found' }
  }

  let totalAdded = 0
  const fourMonthsAgo = new Date()
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  // 1. Backfill from Steam if we have Steam App ID
  if (game.steam_app_id) {
    try {
      const feedUrl = `https://store.steampowered.com/feeds/news/app/${game.steam_app_id}`
      const feed = await parser.parseURL(feedUrl)

      for (const item of feed.items as SteamFeedItem[]) {
        // Check if within 4 months
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()
        if (pubDate < fourMonthsAgo) continue

        const title = item.title?.toLowerCase() || ''
        const isPatch = title.includes('update') ||
                        title.includes('patch') ||
                        title.includes('hotfix') ||
                        title.includes('fix') ||
                        title.includes('version') ||
                        title.includes('changelog') ||
                        title.includes('release note') ||
                        title.includes('maintenance') ||
                        title.includes('notes')

        if (!isPatch) continue

        // Check for duplicates
        const { data: existing } = await supabase
          .from('patch_notes')
          .select('id')
          .eq('source_url', item.link)
          .single()

        if (existing) continue

        const rawText = item.contentSnippet || item.content || ''
        if (rawText.length < 50) continue

        // Insert patch
        const { data: newPatch, error } = await supabase
          .from('patch_notes')
          .insert({
            game_id: gameId,
            title: item.title || `${game.name} Update`,
            source_url: item.link,
            raw_text: rawText.slice(0, 10000),
            published_at: pubDate.toISOString(),
            summary_tldr: 'AI summary pending...',
            impact_score: 5,
            tags: [],
            key_changes: [],
          })
          .select('id')
          .single()

        if (!error && newPatch) {
          await queueAIJob('PATCH_SUMMARY', newPatch.id)
          totalAdded++
        }
      }
    } catch (error) {
      console.error(`Steam backfill failed for ${game.name}:`, error)
    }
  }

  // 2. Backfill from Reddit if we have a known subreddit
  try {
    const subredditMap: Record<string, string> = {
      'league-of-legends': 'leagueoflegends',
      'valorant': 'VALORANT',
      'fortnite': 'FortNiteBR',
      'apex-legends': 'apexlegends',
      'destiny-2': 'DestinyTheGame',
      'overwatch-2': 'Overwatch',
      'diablo-4': 'diablo4',
      'counter-strike-2': 'cs2',
      'cs2': 'cs2',
      'dota-2': 'DotA2',
      'rocket-league': 'RocketLeague',
      'rainbow-six-siege': 'Rainbow6',
      'genshin-impact': 'Genshin_Impact',
      'world-of-warcraft': 'wow',
      'path-of-exile': 'pathofexile',
      'dead-by-daylight': 'deadbydaylight',
      'escape-from-tarkov': 'EscapefromTarkov',
      'helldivers-2': 'Helldivers',
    }

    const subreddit = Object.entries(subredditMap).find(
      ([slug]) => game.slug.includes(slug) || slug.includes(game.slug)
    )?.[1]

    if (subreddit) {
      // Fetch top posts from subreddit (includes older posts)
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?q=patch+OR+update+OR+hotfix&restrict_sr=1&sort=new&limit=50`,
        {
          headers: { 'User-Agent': 'PatchPulse/1.0' },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const posts = data?.data?.children || []

        for (const post of posts) {
          const { title, selftext, permalink, created_utc, url } = post.data
          const pubDate = new Date(created_utc * 1000)

          if (pubDate < fourMonthsAgo) continue

          const sourceUrl = `https://www.reddit.com${permalink}`

          // Check for duplicates
          const { data: existing } = await supabase
            .from('patch_notes')
            .select('id')
            .eq('source_url', sourceUrl)
            .single()

          if (existing) continue

          const rawText = selftext || title
          if (rawText.length < 20) continue

          const { data: newPatch, error } = await supabase
            .from('patch_notes')
            .insert({
              game_id: gameId,
              title: title.slice(0, 500),
              source_url: sourceUrl,
              raw_text: rawText.slice(0, 10000),
              published_at: pubDate.toISOString(),
              summary_tldr: 'AI summary pending...',
              impact_score: 5,
              tags: [],
              key_changes: [],
            })
            .select('id')
            .single()

          if (!error && newPatch) {
            await queueAIJob('PATCH_SUMMARY', newPatch.id)
            totalAdded++
          }
        }
      }
    }
  } catch (error) {
    console.error(`Reddit backfill failed for ${game.name}:`, error)
  }

  return { success: true, addedCount: totalAdded }
}

// Check if a game needs backfill (no patches in last 4 months)
export async function needsBackfill(gameId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const fourMonthsAgo = new Date()
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  const { data, error } = await supabase
    .from('patch_notes')
    .select('id')
    .eq('game_id', gameId)
    .gte('published_at', fourMonthsAgo.toISOString())
    .limit(1)

  if (error) return true // Assume needs backfill on error

  return !data || data.length === 0
}
