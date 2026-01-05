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

type PatchSource = {
  name: string
  feedUrl: string
  filterKeywords?: string[] // Only include items containing these keywords
}

// RSS feeds that commonly post patch notes and game updates
const PATCH_SOURCES: PatchSource[] = [
  {
    name: 'PC Gamer',
    feedUrl: 'https://www.pcgamer.com/rss/',
    filterKeywords: ['patch', 'update', 'hotfix', 'changelog', 'notes', 'balance', 'nerf', 'buff', 'fix', 'version']
  },
  {
    name: 'Rock Paper Shotgun',
    feedUrl: 'https://www.rockpapershotgun.com/feed',
    filterKeywords: ['patch', 'update', 'hotfix', 'changelog', 'notes', 'balance', 'nerf', 'buff', 'fix']
  },
  {
    name: 'Eurogamer',
    feedUrl: 'https://www.eurogamer.net/feed',
    filterKeywords: ['patch', 'update', 'hotfix', 'notes', 'balance', 'nerf', 'buff', 'fix']
  },
  {
    name: 'VG247',
    feedUrl: 'https://www.vg247.com/feed',
    filterKeywords: ['patch', 'update', 'hotfix', 'notes', 'balance', 'nerf', 'buff']
  },
  {
    name: 'GamesRadar+',
    feedUrl: 'https://www.gamesradar.com/rss/',
    filterKeywords: ['patch', 'update', 'hotfix', 'notes', 'balance', 'nerf', 'buff']
  },
]

// Game name aliases for matching (same as news)
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
  'Elden Ring': ['ELDEN RING', 'Elden Ring'],
  'Baldur\'s Gate 3': ['BG3', 'Baldurs Gate 3', 'Baldur\'s Gate'],
  'Diablo IV': ['Diablo 4', 'D4', 'Diablo'],
  'Path of Exile 2': ['PoE 2', 'PoE2', 'Path of Exile'],
  'Path of Exile': ['PoE', 'Path of Exile'],
  'World of Warcraft': ['WoW', 'Warcraft', 'World of Warcraft'],
  'Final Fantasy XIV': ['FFXIV', 'FF14', 'Final Fantasy'],
  'Destiny 2': ['Destiny 2', 'Destiny'],
  'Helldivers 2': ['HD2', 'Helldivers'],
  'Cyberpunk 2077': ['Cyberpunk', 'CP2077', 'Cyberpunk 2077'],
  'The Witcher 3: Wild Hunt': ['Witcher 3', 'TW3', 'Witcher'],
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
  'Genshin Impact': ['Genshin'],
  'Honkai: Star Rail': ['Honkai', 'Star Rail'],
  'Zenless Zone Zero': ['Zenless', 'ZZZ'],
  'Wuthering Waves': ['Wuthering'],
}

type FeedItem = {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Match news item to a game in our database
async function matchGameToPatch(title: string, content: string): Promise<string | null> {
  const supabase = createAdminClient()
  const searchText = `${title} ${content}`.toLowerCase()
  const titleLower = title.toLowerCase()

  // Get all games
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

    nameToGameId.set(gameName, { id: game.id, priority: gameName.length * 2 })

    const aliases = GAME_ALIASES[game.name] || []
    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase()
      if (aliasLower.length >= 3) {
        nameToGameId.set(aliasLower, { id: game.id, priority: aliasLower.length })
      }
    }
  }

  const sortedNames = Array.from(nameToGameId.entries())
    .sort((a, b) => b[1].priority - a[1].priority)

  // Check title first (higher confidence)
  for (const [name, { id }] of sortedNames) {
    if (name.length < 8) {
      const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i')
      if (regex.test(titleLower)) {
        return id
      }
    } else if (titleLower.includes(name)) {
      return id
    }
  }

  // Check content (lower confidence)
  for (const [name, { id }] of sortedNames) {
    if (name.length < 6) continue

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

// Fetch patches from a single source
export async function fetchPatchesFromSource(source: PatchSource) {
  try {
    const feed = await parser.parseURL(source.feedUrl)
    const supabase = createAdminClient()

    let addedCount = 0

    for (const item of (feed.items as FeedItem[]).slice(0, 15)) {
      const title = item.title?.toLowerCase() || ''
      const content = (item.contentSnippet || item.content || '').toLowerCase()
      const fullText = `${title} ${content}`

      // Check if this is a patch-related article
      const isPatchRelated = source.filterKeywords?.some(keyword =>
        fullText.includes(keyword)
      ) ?? true

      if (!isPatchRelated) continue

      // Check if we already have this patch
      const { data: existingByUrl } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('source_url', item.link)
        .single()

      if (existingByUrl) continue

      // Try to match to a game
      const gameId = await matchGameToPatch(item.title || '', content)

      // Only add if we matched to a game
      if (!gameId) continue

      const rawText = item.contentSnippet || item.content || ''
      if (rawText.length < 30) continue

      // Check for duplicate by similar title for same game
      const titleToCheck = item.title?.slice(0, 50) || ''
      if (titleToCheck.length > 10) {
        const { data: existingByTitle } = await supabase
          .from('patch_notes')
          .select('id')
          .eq('game_id', gameId)
          .ilike('title', `%${titleToCheck}%`)
          .limit(1)

        if (existingByTitle && existingByTitle.length > 0) continue
      }

      // Insert the patch
      const { data: newPatch, error } = await supabase
        .from('patch_notes')
        .insert({
          game_id: gameId,
          title: item.title || 'Game Update',
          source_url: item.link,
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
        console.error(`Failed to insert patch from ${source.name}:`, error)
        continue
      }

      if (newPatch) {
        await queueAIJob('PATCH_SUMMARY', newPatch.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    console.error(`Failed to fetch patches from ${source.name}:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Fetch patches from all external sources
export async function fetchAllExternalPatches() {
  let totalAdded = 0
  const errors: string[] = []

  for (const source of PATCH_SOURCES) {
    const result = await fetchPatchesFromSource(source)

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
    sourcesChecked: PATCH_SOURCES.length,
    errors: errors.length > 0 ? errors : undefined
  }
}
