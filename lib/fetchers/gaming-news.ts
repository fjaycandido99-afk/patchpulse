'use server'

import Parser from 'rss-parser'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'
import { fetchOGImage } from '@/lib/ai/og-image-fetcher'

const parser = new Parser()

type NewsSource = {
  name: string
  feedUrl: string
  category: 'general' | 'pc' | 'playstation' | 'xbox' | 'nintendo'
}

// Popular gaming news RSS feeds
const NEWS_SOURCES: NewsSource[] = [
  { name: 'IGN', feedUrl: 'https://feeds.feedburner.com/ign/games-all', category: 'general' },
  { name: 'GameSpot', feedUrl: 'https://www.gamespot.com/feeds/news/', category: 'general' },
  { name: 'Kotaku', feedUrl: 'https://kotaku.com/rss', category: 'general' },
  { name: 'PC Gamer', feedUrl: 'https://www.pcgamer.com/rss/', category: 'pc' },
  { name: 'Eurogamer', feedUrl: 'https://www.eurogamer.net/feed', category: 'general' },
  { name: 'Rock Paper Shotgun', feedUrl: 'https://www.rockpapershotgun.com/feed', category: 'pc' },
]

type FeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
  creator?: string
}

// Try to match news to a game in our database
async function matchGameToNews(title: string, content: string) {
  const supabase = createAdminClient()
  const searchText = `${title} ${content}`.toLowerCase()

  // Get all games and check for matches
  const { data: games } = await supabase
    .from('games')
    .select('id, name')
    .limit(100)

  if (!games) return null

  for (const game of games) {
    const gameName = game.name.toLowerCase()
    // Check if game name appears in title or content
    if (searchText.includes(gameName)) {
      return game.id
    }
  }

  return null
}

// Fetch news from a single source
export async function fetchNewsFromSource(source: NewsSource) {
  try {
    const feed = await parser.parseURL(source.feedUrl)
    const supabase = createAdminClient()

    let addedCount = 0

    for (const item of (feed.items as FeedItem[]).slice(0, 10)) { // Limit to 10 most recent
      // Check if we already have this news item (by source_url)
      const { data: existingByUrl } = await supabase
        .from('news_items')
        .select('id')
        .eq('source_url', item.link)
        .single()

      if (existingByUrl) continue

      // Also check by similar title (prevent duplicates from different sources)
      const titleToCheck = item.title?.slice(0, 60) || ''
      if (titleToCheck.length > 10) {
        const { data: existingByTitle } = await supabase
          .from('news_items')
          .select('id')
          .ilike('title', `%${titleToCheck}%`)
          .limit(1)

        if (existingByTitle && existingByTitle.length > 0) continue
      }

      const rawText = item.contentSnippet || item.content || ''
      if (rawText.length < 50) continue

      // Try to match to a game
      const gameId = await matchGameToNews(item.title || '', rawText)

      // Fetch OG image from source URL
      let imageUrl: string | null = null
      if (item.link) {
        try {
          const ogData = await fetchOGImage(item.link)
          imageUrl = ogData.imageUrl
        } catch (e) {
          console.warn(`Failed to fetch OG image for ${item.link}:`, e)
        }
      }

      // Insert the news item
      const { data: newNews, error } = await supabase
        .from('news_items')
        .insert({
          game_id: gameId, // May be null for general news
          title: item.title || 'Gaming News',
          source_name: source.name,
          source_url: item.link,
          image_url: imageUrl,
          summary: rawText.slice(0, 2000), // Store raw text, AI will refine
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          topics: [],
          is_rumor: false,
        })
        .select('id')
        .single()

      if (error) {
        console.error(`Failed to insert news from ${source.name}:`, error)
        continue
      }

      // Queue AI processing
      if (newNews) {
        await queueAIJob('NEWS_SUMMARY', newNews.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    console.error(`Failed to fetch news from ${source.name}:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Fetch news from all sources
export async function fetchAllGamingNews() {
  let totalAdded = 0
  const errors: string[] = []

  for (const source of NEWS_SOURCES) {
    const result = await fetchNewsFromSource(source)

    if (result.success) {
      totalAdded += result.addedCount || 0
    } else {
      errors.push(`${source.name}: ${result.error}`)
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return {
    success: true,
    totalAdded,
    sourcesChecked: NEWS_SOURCES.length,
    errors: errors.length > 0 ? errors : undefined
  }
}
