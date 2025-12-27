#!/usr/bin/env npx tsx
/**
 * Fetch gaming news from RSS feeds
 *
 * Run: npx tsx scripts/fetch-news.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import Parser from 'rss-parser'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const parser = new Parser()

type NewsSource = {
  name: string
  feedUrl: string
}

const NEWS_SOURCES: NewsSource[] = [
  { name: 'IGN', feedUrl: 'https://feeds.feedburner.com/ign/games-all' },
  { name: 'GameSpot', feedUrl: 'https://www.gamespot.com/feeds/news/' },
  { name: 'Kotaku', feedUrl: 'https://kotaku.com/rss' },
  { name: 'PC Gamer', feedUrl: 'https://www.pcgamer.com/rss/' },
  { name: 'Eurogamer', feedUrl: 'https://www.eurogamer.net/feed' },
  { name: 'Rock Paper Shotgun', feedUrl: 'https://www.rockpapershotgun.com/feed' },
  { name: 'Polygon', feedUrl: 'https://www.polygon.com/rss/index.xml' },
  { name: 'VG247', feedUrl: 'https://www.vg247.com/feed' },
  { name: 'GamesRadar+', feedUrl: 'https://www.gamesradar.com/rss/' },
  { name: 'The Verge Gaming', feedUrl: 'https://www.theverge.com/games/rss/index.xml' },
]

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
  'Metroid Dread': ['Metroid'],
  'Donkey Kong Country Returns HD': ['Donkey Kong'],
  'Nier Automata': ['Nier', 'NieR'],
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
  'Arknights': ['Arknights'],
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('\n🗞️  Gaming News Fetcher')
  console.log('========================\n')

  // Get all games for matching
  const { data: games } = await supabase
    .from('games')
    .select('id, name')
    .order('name')

  if (!games) {
    console.error('Failed to fetch games')
    process.exit(1)
  }

  console.log(`Loaded ${games.length} games for matching\n`)

  // Build name -> game ID map
  const nameToGameId = new Map<string, { id: string; name: string; priority: number }>()

  for (const game of games) {
    const gameName = game.name.toLowerCase()
    if (gameName.length < 4 && !['rust', 'apex', 'dota', 'ark'].includes(gameName)) {
      continue
    }

    nameToGameId.set(gameName, { id: game.id, name: game.name, priority: gameName.length * 2 })

    const aliases = GAME_ALIASES[game.name] || []
    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase()
      if (aliasLower.length >= 3) {
        nameToGameId.set(aliasLower, { id: game.id, name: game.name, priority: aliasLower.length })
      }
    }
  }

  const sortedNames = Array.from(nameToGameId.entries())
    .sort((a, b) => b[1].priority - a[1].priority)

  function matchGame(title: string, content: string) {
    const searchText = `${title} ${content}`.toLowerCase()
    const titleLower = title.toLowerCase()

    // Check title first
    for (const [name, data] of sortedNames) {
      if (name.length < 8) {
        const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i')
        if (regex.test(titleLower)) {
          return data
        }
      } else if (titleLower.includes(name)) {
        return data
      }
    }

    // Check content
    for (const [name, data] of sortedNames) {
      if (name.length < 6) continue
      if (name.length < 10) {
        const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i')
        if (regex.test(searchText)) {
          return data
        }
      } else if (searchText.includes(name)) {
        return data
      }
    }

    return null
  }

  let totalAdded = 0
  let totalMatched = 0
  let totalSkipped = 0

  for (const source of NEWS_SOURCES) {
    process.stdout.write(`\nFetching from ${source.name}... `)

    try {
      const feed = await parser.parseURL(source.feedUrl)
      console.log(`${feed.items.length} items`)

      for (const item of feed.items.slice(0, 15)) {
        const title = item.title || ''
        const link = item.link || ''
        const content = item.contentSnippet || item.content || ''

        if (!title || !link) continue

        // Check if already exists
        const { data: existing } = await supabase
          .from('news_items')
          .select('id')
          .eq('source_url', link)
          .single()

        if (existing) {
          totalSkipped++
          continue
        }

        // Try to match a game
        const gameMatch = matchGame(title, content)

        // Insert the news item
        const { error } = await supabase
          .from('news_items')
          .insert({
            game_id: gameMatch?.id || null,
            title: title,
            source_name: source.name,
            source_url: link,
            summary: content.slice(0, 2000),
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            topics: [],
            is_rumor: false,
          })

        if (error) {
          console.error(`  Error: ${error.message}`)
          continue
        }

        totalAdded++
        if (gameMatch) {
          totalMatched++
          console.log(`  + ${title.substring(0, 50)}... -> ${gameMatch.name}`)
        } else {
          console.log(`  + ${title.substring(0, 50)}... (no game match)`)
        }
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n========================')
  console.log(`Total added: ${totalAdded}`)
  console.log(`Matched to games: ${totalMatched}`)
  console.log(`Already existed: ${totalSkipped}`)
  console.log('========================\n')
}

main().catch(console.error)
