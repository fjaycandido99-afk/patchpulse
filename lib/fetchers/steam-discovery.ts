'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Steam Store API endpoints
const STEAM_FEATURED_URL = 'https://store.steampowered.com/api/featured/'
const STEAM_FEATURED_CATEGORIES_URL = 'https://store.steampowered.com/api/featuredcategories/'
const STEAM_TOP_GAMES_URL = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/'

type SteamFeaturedGame = {
  id: number
  name: string
  header_image: string
  discount_percent?: number
  original_price?: number
  final_price?: number
  large_capsule_image?: string
}

type SteamAppDetails = {
  success: boolean
  data?: {
    type: string
    name: string
    steam_appid: number
    is_free: boolean
    short_description: string
    header_image: string
    genres?: { id: string; description: string }[]
    release_date?: { coming_soon: boolean; date: string }
    developers?: string[]
    publishers?: string[]
    categories?: { id: number; description: string }[]
  }
}

// Fetch app details from Steam
async function getAppDetails(appId: number): Promise<SteamAppDetails['data'] | null> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}`,
      {
        headers: {
          'User-Agent': 'PatchPulse/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const appData = data[appId.toString()] as SteamAppDetails

    if (!appData?.success || !appData.data) return null
    if (appData.data.type !== 'game') return null // Only games, not DLC/software

    return appData.data
  } catch {
    return null
  }
}

// Generate slug from game name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

// Map Steam genres to our genre format
function mapSteamGenres(genres?: { id: string; description: string }[]): string[] {
  if (!genres) return []
  return genres.map(g => g.description).slice(0, 5)
}

// Convert Steam app to our game record format
function steamToGameRecord(app: NonNullable<SteamAppDetails['data']>) {
  return {
    name: app.name,
    slug: generateSlug(app.name),
    cover_url: app.header_image,
    steam_app_id: app.steam_appid.toString(),
    genres: mapSteamGenres(app.genres),
    release_date: app.release_date?.date || null,
    description: app.short_description || null,
    developer: app.developers?.[0] || null,
    publisher: app.publishers?.[0] || null,
  }
}

// Fetch featured/new releases from Steam
export async function discoverSteamGames(): Promise<{
  success: boolean
  fetched: number
  added: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const results = {
    success: true,
    fetched: 0,
    added: 0,
    errors: [] as string[],
  }

  const allAppIds: Set<number> = new Set()

  // 1. Fetch featured games
  try {
    const featuredRes = await fetch(STEAM_FEATURED_URL, {
      headers: { 'User-Agent': 'PatchPulse/1.0' },
    })

    if (featuredRes.ok) {
      const featured = await featuredRes.json()

      // Featured large capsules
      if (featured.large_capsules) {
        featured.large_capsules.forEach((game: SteamFeaturedGame) => {
          if (game.id) allAppIds.add(game.id)
        })
      }

      // Featured win
      if (featured.featured_win) {
        featured.featured_win.forEach((game: SteamFeaturedGame) => {
          if (game.id) allAppIds.add(game.id)
        })
      }
    }
  } catch (error) {
    results.errors.push(`Featured fetch failed: ${error}`)
  }

  // 2. Fetch featured categories (new releases, top sellers, etc.)
  try {
    const categoriesRes = await fetch(STEAM_FEATURED_CATEGORIES_URL, {
      headers: { 'User-Agent': 'PatchPulse/1.0' },
    })

    if (categoriesRes.ok) {
      const categories = await categoriesRes.json()

      // New releases
      if (categories.new_releases?.items) {
        categories.new_releases.items.forEach((game: SteamFeaturedGame) => {
          if (game.id) allAppIds.add(game.id)
        })
      }

      // Top sellers
      if (categories.top_sellers?.items) {
        categories.top_sellers.items.forEach((game: SteamFeaturedGame) => {
          if (game.id) allAppIds.add(game.id)
        })
      }

      // Coming soon
      if (categories.coming_soon?.items) {
        categories.coming_soon.items.forEach((game: SteamFeaturedGame) => {
          if (game.id) allAppIds.add(game.id)
        })
      }

      // Specials (on sale)
      if (categories.specials?.items) {
        categories.specials.items.slice(0, 30).forEach((game: SteamFeaturedGame) => {
          if (game.id) allAppIds.add(game.id)
        })
      }
    }
  } catch (error) {
    results.errors.push(`Categories fetch failed: ${error}`)
  }

  // 3. Fetch most played games from Steam Charts
  try {
    const topGamesRes = await fetch(STEAM_TOP_GAMES_URL, {
      headers: { 'User-Agent': 'PatchPulse/1.0' },
    })

    if (topGamesRes.ok) {
      const topGames = await topGamesRes.json()
      if (topGames.response?.ranks) {
        topGames.response.ranks.slice(0, 100).forEach((game: { appid: number }) => {
          if (game.appid) allAppIds.add(game.appid)
        })
      }
    }
  } catch (error) {
    results.errors.push(`Top games fetch failed: ${error}`)
  }

  results.fetched = allAppIds.size
  console.log(`[Steam Discovery] Found ${allAppIds.size} unique app IDs`)

  // Process each app (with rate limiting)
  const appIds = Array.from(allAppIds).slice(0, 100) // Increased to 100 per run

  for (const appId of appIds) {
    try {
      // Check if already exists by steam_app_id
      const { data: existing } = await supabase
        .from('games')
        .select('id')
        .eq('steam_app_id', appId.toString())
        .single()

      if (existing) continue // Skip existing

      // Fetch app details
      const appDetails = await getAppDetails(appId)
      if (!appDetails) continue

      // Check by name too
      const { data: existingByName } = await supabase
        .from('games')
        .select('id')
        .ilike('name', appDetails.name)
        .single()

      if (existingByName) continue

      // Insert new game
      const gameRecord = steamToGameRecord(appDetails)
      const { error } = await supabase.from('games').insert(gameRecord)

      if (error) {
        results.errors.push(`${appDetails.name}: ${error.message}`)
      } else {
        results.added++
        console.log(`[Steam Discovery] Added: ${appDetails.name}`)
      }

      // Rate limit: 200ms between requests to avoid Steam rate limits
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      results.errors.push(`App ${appId}: ${error}`)
    }
  }

  return results
}
