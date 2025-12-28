import { createAdminClient } from '@/lib/supabase/admin'
import { searchIgdbGame } from './igdb'

// Steam CDN URL patterns
const STEAM_CDN = 'https://cdn.akamai.steamstatic.com/steam/apps'

// Known Steam App IDs for games that might have wrong slugs
const KNOWN_STEAM_IDS: Record<string, number> = {
  'destiny 2': 1085660,
  'destiny 2: renegades': 3186540,
  'destiny 2 renegades': 3186540,
  'octopath traveler': 921570,
  'octopath traveler ii': 1971650,
  'octopath traveler 2': 1971650,
  'monster hunter wilds': 2246340,
  'path of exile 2': 2694490,
  'marvel rivals': 2767030,
  'phantom blade zero': 4115450,
  'phantom blade 0': 4115450,
}

export function getSteamImageUrls(steamAppId: number) {
  return {
    // Vertical capsule (600x900 @2x) - best for cover
    cover_url: `${STEAM_CDN}/${steamAppId}/library_600x900_2x.jpg`,
    // Header image (460x215) - fallback for cards
    header_url: `${STEAM_CDN}/${steamAppId}/header.jpg`,
    // Hero image (large banner)
    hero_url: `${STEAM_CDN}/${steamAppId}/library_hero.jpg`,
    // Logo (transparent PNG)
    logo_url: `${STEAM_CDN}/${steamAppId}/logo.png`,
    // Capsule (main store capsule - most reliable)
    capsule_url: `${STEAM_CDN}/${steamAppId}/capsule_616x353.jpg`,
  }
}

// Alternative cover formats if library_600x900_2x doesn't exist
export function getSteamCoverFallbacks(steamAppId: number): string[] {
  return [
    `${STEAM_CDN}/${steamAppId}/library_600x900_2x.jpg`,
    `${STEAM_CDN}/${steamAppId}/library_600x900.jpg`,
    `${STEAM_CDN}/${steamAppId}/capsule_616x353.jpg`,
    `${STEAM_CDN}/${steamAppId}/header.jpg`,
  ]
}

// Verify if a Steam image URL is valid
async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Fetch and update images for a single game
export async function updateGameImages(gameId: string, steamAppId: number) {
  const supabase = createAdminClient()
  const urls = getSteamImageUrls(steamAppId)
  const coverFallbacks = getSteamCoverFallbacks(steamAppId)

  const updates: Record<string, string | null> = {}

  // Try cover fallbacks in order
  for (const coverUrl of coverFallbacks) {
    if (await verifyImageUrl(coverUrl)) {
      updates.cover_url = coverUrl
      break
    }
  }

  // Try hero image
  if (await verifyImageUrl(urls.hero_url)) {
    updates.hero_url = urls.hero_url
  }

  // Try logo
  if (await verifyImageUrl(urls.logo_url)) {
    updates.logo_url = urls.logo_url
  }

  // If no cover found, use capsule as fallback
  if (!updates.cover_url && await verifyImageUrl(urls.capsule_url)) {
    updates.cover_url = urls.capsule_url
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, error: 'No valid images found' }
  }

  const { error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, source: 'steam', updated: Object.keys(updates) }
}

// Backfill images for all games with steam_app_id
// Set forceRefresh=true to re-fetch all images even if they exist
export async function backfillSteamImages(limit = 50, forceRefresh = false) {
  const supabase = createAdminClient()

  // Find games with steam_app_id
  let query = supabase
    .from('games')
    .select('id, name, steam_app_id, cover_url, hero_url, logo_url')
    .not('steam_app_id', 'is', null)

  // Only filter for missing images if not force refreshing
  if (!forceRefresh) {
    query = query.or('cover_url.is.null,hero_url.is.null,logo_url.is.null')
  }

  const { data: games, error } = await query.limit(limit)

  if (error || !games) {
    return { success: false, error: error?.message || 'No games found' }
  }

  let updated = 0
  let failed = 0
  const results: Array<{ name: string; success: boolean; error?: string }> = []

  for (const game of games) {
    if (!game.steam_app_id) continue

    const result = await updateGameImages(game.id, game.steam_app_id)

    if (result.success) {
      updated++
      results.push({ name: game.name, success: true })
    } else {
      failed++
      results.push({ name: game.name, success: false, error: result.error })
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return {
    success: true,
    gamesChecked: games.length,
    updated,
    failed,
    results,
  }
}

// Search Steam for a game and get its app ID
export async function searchSteamAppId(gameName: string): Promise<number | null> {
  const lowerName = gameName.toLowerCase()

  // Check known Steam IDs first
  if (KNOWN_STEAM_IDS[lowerName]) {
    return KNOWN_STEAM_IDS[lowerName]
  }

  // Check partial matches in known IDs
  for (const [key, appId] of Object.entries(KNOWN_STEAM_IDS)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return appId
    }
  }

  try {
    // Use Steam's search API (unofficial but works)
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&cc=us&l=en`

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PatchPulseBot/1.0)',
      },
    })

    if (!response.ok) return null

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      // Return the first match
      return data.items[0].id as number
    }

    return null
  } catch (error) {
    console.error('Steam search error:', error)
    return null
  }
}

// Update game with IGDB image using dynamic API search
async function updateGameWithIgdb(gameId: string, gameName: string) {
  try {
    // Use IGDB API to search for the game and get cover
    const igdbResult = await searchIgdbGame(gameName)

    if (!igdbResult?.cover_url) {
      return { success: false, error: 'No IGDB cover found for this game' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('games')
      .update({ cover_url: igdbResult.cover_url })
      .eq('id', gameId)

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      source: 'igdb',
      updated: ['cover_url'],
      igdbName: igdbResult.name,
      igdbId: igdbResult.id
    }
  } catch (error) {
    console.error('IGDB update error:', error)
    return { success: false, error: 'IGDB API error' }
  }
}

// Find Steam App ID and update game images
export async function discoverAndUpdateGameImages(gameId: string, gameName: string) {
  const supabase = createAdminClient()

  // First check if game already has steam_app_id
  const { data: game } = await supabase
    .from('games')
    .select('steam_app_id')
    .eq('id', gameId)
    .single()

  let steamAppId = game?.steam_app_id

  // If no steam_app_id, try to find it
  if (!steamAppId) {
    steamAppId = await searchSteamAppId(gameName)

    if (steamAppId) {
      // Save the steam_app_id
      await supabase
        .from('games')
        .update({ steam_app_id: steamAppId })
        .eq('id', gameId)
    }
  }

  // If found on Steam, try to update with Steam images
  if (steamAppId) {
    const steamResult = await updateGameImages(gameId, steamAppId)
    // If Steam images found, return success
    if (steamResult.success) {
      return steamResult
    }
    // If Steam images not found (404), fall through to IGDB
  }

  // Fallback to IGDB for games not on Steam OR when Steam images don't exist
  const igdbResult = await updateGameWithIgdb(gameId, gameName)
  if (igdbResult.success) {
    return igdbResult
  }

  return { success: false, error: 'Game not found on Steam or IGDB' }
}

// Force update all games using IGDB API only (ignores Steam)
// Use this when you want accurate cover art from IGDB
export async function updateAllGamesFromIgdb(limit = 50) {
  const supabase = createAdminClient()

  // Get all games - prioritize upcoming/new releases
  const today = new Date()
  const oneYearFromNow = new Date(today)
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]
  const oneYearStr = oneYearFromNow.toISOString().split('T')[0]

  // Get upcoming and recent games
  const { data: games } = await supabase
    .from('games')
    .select('id, name, cover_url')
    .or(`release_date.gte.${thirtyDaysAgoStr},release_date.lte.${oneYearStr}`)
    .order('release_date', { ascending: true })
    .limit(limit)

  if (!games || games.length === 0) {
    return { success: true, message: 'No games to update', updated: 0, failed: 0, results: [] }
  }

  let updated = 0
  let failed = 0
  const results: Array<{
    name: string
    success: boolean
    error?: string
    igdbMatch?: string
  }> = []

  for (const game of games) {
    // Force IGDB only - no Steam fallback
    const result = await updateGameWithIgdb(game.id, game.name)

    if (result.success) {
      updated++
      results.push({
        name: game.name,
        success: true,
        igdbMatch: result.igdbName
      })
    } else {
      failed++
      results.push({ name: game.name, success: false, error: result.error })
    }

    // Delay to avoid IGDB rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return {
    success: true,
    source: 'igdb-only',
    gamesChecked: games.length,
    updated,
    failed,
    results
  }
}

// Discover and update images for ALL games missing covers
// This searches Steam for each game to find the app ID
export async function discoverAllGameImages(limit = 50) {
  const supabase = createAdminClient()

  // Get games that need images - prioritize upcoming/new releases
  const today = new Date()
  const oneYearFromNow = new Date(today)
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const todayStr = today.toISOString().split('T')[0]
  const oneYearStr = oneYearFromNow.toISOString().split('T')[0]
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  // First get upcoming and recent games
  const { data: priorityGames } = await supabase
    .from('games')
    .select('id, name, steam_app_id, cover_url')
    .or(`release_date.gte.${thirtyDaysAgoStr},release_date.lte.${oneYearStr}`)
    .order('release_date', { ascending: true })
    .limit(limit)

  // Then get any other games missing covers
  const { data: otherGames } = await supabase
    .from('games')
    .select('id, name, steam_app_id, cover_url')
    .is('cover_url', null)
    .limit(limit)

  // Combine and deduplicate
  const allGames = [...(priorityGames || []), ...(otherGames || [])]
  const uniqueGames = Array.from(new Map(allGames.map(g => [g.id, g])).values())
    .slice(0, limit)

  if (uniqueGames.length === 0) {
    return { success: true, message: 'No games need image updates', updated: 0, failed: 0, results: [] }
  }

  let updated = 0
  let failed = 0
  const results: Array<{
    name: string
    success: boolean
    error?: string
    source?: string
    igdbMatch?: string
  }> = []

  for (const game of uniqueGames) {
    // Always try to update - don't skip any games
    const result = await discoverAndUpdateGameImages(game.id, game.name)

    if (result.success) {
      updated++
      const igdbMatch = 'igdbName' in result ? (result as { igdbName?: string }).igdbName : undefined
      results.push({
        name: game.name,
        success: true,
        source: result.source,
        igdbMatch
      })
    } else {
      failed++
      results.push({ name: game.name, success: false, error: result.error })
    }

    // Delay to avoid rate limiting Steam/IGDB APIs
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return {
    success: true,
    gamesChecked: uniqueGames.length,
    updated,
    failed,
    results,
  }
}
