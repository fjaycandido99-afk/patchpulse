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
  { name: 'Polygon', feedUrl: 'https://www.polygon.com/rss/index.xml', category: 'general' },
  { name: 'VG247', feedUrl: 'https://www.vg247.com/feed', category: 'general' },
  { name: 'GamesRadar+', feedUrl: 'https://www.gamesradar.com/rss/', category: 'general' },
  { name: 'The Verge Gaming', feedUrl: 'https://www.theverge.com/games/rss/index.xml', category: 'general' },
]

type FeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
  creator?: string
}

// Common game name aliases and partial matches
const GAME_ALIASES: Record<string, string[]> = {
  'Counter-Strike 2': ['CS2', 'Counter Strike 2', 'CSGO', 'CS:GO', 'Counter-Strike'],
  'League of Legends': ['LoL', 'League of Legends'],
  'Dota 2': ['DOTA', 'Dota2', 'Dota 2'],
  'Valorant': ['VALORANT', 'Valorant'],
  'Overwatch 2': ['OW2', 'Overwatch'],
  'Apex Legends': ['Apex Legends', 'Apex'],
  'Fortnite': ['FORTNITE', 'Fortnite'],
  'Call of Duty: Warzone': ['Warzone', 'COD Warzone', 'Call of Duty'],
  'Call of Duty: Modern Warfare III': ['MW3', 'MWIII', 'Modern Warfare 3', 'Modern Warfare'],
  'Call of Duty: Black Ops 6': ['BO6', 'Black Ops 6', 'Black Ops'],
  'Grand Theft Auto V': ['GTA V', 'GTA 5', 'GTAV', 'GTA5', 'Grand Theft Auto'],
  'Grand Theft Auto VI': ['GTA VI', 'GTA 6', 'GTAVI', 'GTA6', 'GTA 6'],
  'The Elder Scrolls V: Skyrim': ['Skyrim', 'Elder Scrolls'],
  'The Legend of Zelda: Tears of the Kingdom': ['TOTK', 'Tears of the Kingdom', 'Zelda'],
  'Elden Ring': ['ELDEN RING', 'Elden Ring'],
  'Baldur\'s Gate 3': ['BG3', 'Baldurs Gate 3', 'Baldur\'s Gate'],
  'Diablo IV': ['Diablo 4', 'D4', 'Diablo'],
  'Path of Exile 2': ['PoE 2', 'PoE2', 'Path of Exile'],
  'Path of Exile': ['PoE', 'Path of Exile'],
  'World of Warcraft': ['WoW', 'Warcraft', 'World of Warcraft'],
  'Final Fantasy XIV': ['FFXIV', 'FF14', 'Final Fantasy'],
  'Final Fantasy XVI': ['FFXVI', 'FF16'],
  'Monster Hunter: World': ['MHW', 'Monster Hunter World', 'Monster Hunter'],
  'Monster Hunter Wilds': ['MH Wilds', 'Monster Hunter Wilds'],
  'Destiny 2': ['Destiny 2', 'Destiny'],
  'Helldivers 2': ['HD2', 'Helldivers'],
  'Cyberpunk 2077': ['Cyberpunk', 'CP2077', 'Cyberpunk 2077'],
  'Red Dead Redemption 2': ['RDR2', 'Red Dead 2', 'Red Dead'],
  'The Witcher 3: Wild Hunt': ['Witcher 3', 'TW3', 'Witcher'],
  'Hades II': ['Hades 2', 'Hades'],
  'Hollow Knight': ['Hollow Knight', 'Silksong'],
  'Stardew Valley': ['Stardew'],
  'Minecraft': ['Minecraft'],
  'Rocket League': ['Rocket League'],
  'Rainbow Six Siege': ['R6', 'Siege', 'R6S', 'Rainbow Six'],
  'Dead by Daylight': ['DBD', 'Dead by Daylight'],
  'Escape from Tarkov': ['EFT', 'Tarkov', 'Escape from Tarkov'],
  'No Man\'s Sky': ['NMS', 'No Man\'s Sky'],
  'Sea of Thieves': ['SoT', 'Sea of Thieves'],
  'Deep Rock Galactic': ['DRG', 'Deep Rock'],
  'S.T.A.L.K.E.R. 2': ['STALKER 2', 'Stalker 2', 'S.T.A.L.K.E.R.'],
  'Marvel Rivals': ['Marvel Rivals'],
  'The Finals': ['The Finals'],
  'Black Myth: Wukong': ['Wukong', 'Black Myth Wukong', 'Black Myth'],
  'Dragon Age: The Veilguard': ['Veilguard', 'Dragon Age'],
  'Indiana Jones and the Great Circle': ['Indiana Jones'],
  'Star Wars Outlaws': ['Star Wars Outlaws', 'Outlaws'],
  'Silent Hill 2': ['SH2', 'Silent Hill'],
  'Space Marine 2': ['SM2', 'Space Marine'],
  'Fallout 4': ['Fallout 4', 'Fallout'],
  'Fallout 76': ['Fallout 76'],
  'Metroid Dread': ['Metroid', 'Metroid Prime'],
  'Donkey Kong Country Returns HD': ['Donkey Kong'],
  'Battlefield 2042': ['Battlefield'],
  'Pokemon Scarlet & Violet': ['Pokemon', 'Pokémon'],
  'Animal Crossing: New Horizons': ['Animal Crossing'],
  'Super Mario Bros. Wonder': ['Mario', 'Super Mario'],
  'Splatoon 3': ['Splatoon'],
  'The Outer Worlds 2': ['Outer Worlds'],
  'Assassin\'s Creed Shadows': ['Assassin\'s Creed', 'Assassins Creed'],
  'PUBG: Battlegrounds': ['PUBG'],
  'Genshin Impact': ['Genshin'],
  'Honkai: Star Rail': ['Honkai', 'Star Rail'],
  'Zenless Zone Zero': ['Zenless', 'ZZZ'],
  'Wuthering Waves': ['Wuthering'],
  'Arc Raiders': ['Arc Raiders'],
  'Arknights': ['Arknights', 'Arknights: Endfield'],
  'Stellar Blade': ['Stellar Blade'],
  'Ninja Gaiden 4': ['Ninja Gaiden'],
}

// Words to ignore in matching to avoid false positives
const IGNORE_WORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'is', 'it',
  'game', 'games', 'gaming', 'update', 'patch', 'news', 'new', 'play', 'player',
  'best', 'top', 'review', 'preview', 'guide', 'how', 'what', 'why', 'when',
])

// Try to match news to a game in our database (improved version)
async function matchGameToNews(title: string, content: string): Promise<string | null> {
  const supabase = createAdminClient()
  const searchText = `${title} ${content}`.toLowerCase()
  const titleLower = title.toLowerCase()

  // Get all games (no limit)
  const { data: games } = await supabase
    .from('games')
    .select('id, name')
    .order('name')

  if (!games || games.length === 0) return null

  // Build a map of all possible names to game IDs
  const nameToGameId = new Map<string, { id: string; priority: number }>()

  for (const game of games) {
    const gameName = game.name.toLowerCase()

    // Skip very short names that could cause false positives
    if (gameName.length < 4 && !['rust', 'apex', 'dota', 'ark'].includes(gameName)) {
      continue
    }

    // Add the full game name with highest priority
    nameToGameId.set(gameName, { id: game.id, priority: gameName.length * 2 })

    // Add aliases if they exist
    const aliases = GAME_ALIASES[game.name] || []
    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase()
      if (aliasLower.length >= 3) {
        nameToGameId.set(aliasLower, { id: game.id, priority: aliasLower.length })
      }
    }
  }

  // Sort names by length (longer first) to match more specific names first
  const sortedNames = Array.from(nameToGameId.entries())
    .sort((a, b) => b[1].priority - a[1].priority)

  // First pass: check title (higher confidence)
  for (const [name, { id }] of sortedNames) {
    // Use word boundary matching for short names
    if (name.length < 8) {
      const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i')
      if (regex.test(titleLower)) {
        return id
      }
    } else if (titleLower.includes(name)) {
      return id
    }
  }

  // Second pass: check full content (lower confidence, only for longer names)
  for (const [name, { id }] of sortedNames) {
    if (name.length < 6) continue // Skip short names in content search

    if (name.length < 10) {
      const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i')
      if (regex.test(searchText)) {
        return id
      }
    } else if (searchText.includes(name)) {
      return id
    }
  }

  return null
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
