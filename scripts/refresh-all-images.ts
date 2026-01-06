import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const STEAM_CDN = 'https://cdn.akamai.steamstatic.com/steam/apps'

// Verify if a Steam image URL is valid
async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Search Steam for a game and get its app ID
async function searchSteamAppId(gameName: string): Promise<number | null> {
  try {
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&cc=us&l=en`
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PatchPulseBot/1.0)' },
    })
    if (!response.ok) return null
    const data = await response.json()
    if (data.items && data.items.length > 0) {
      return data.items[0].id as number
    }
    return null
  } catch {
    return null
  }
}

// Get IGDB access token
async function getIgdbToken(): Promise<string | null> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID
    const clientSecret = process.env.TWITCH_CLIENT_SECRET
    if (!clientId || !clientSecret) return null

    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    )
    const data = await response.json()
    return data.access_token
  } catch {
    return null
  }
}

// Search IGDB for a game
async function searchIgdb(gameName: string, token: string): Promise<{ cover_url: string; name: string } | null> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID
    if (!clientId) return null

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${gameName}"; fields name, cover.image_id; limit 1;`,
    })

    const data = await response.json()
    if (data && data.length > 0 && data[0].cover?.image_id) {
      return {
        name: data[0].name,
        cover_url: `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${data[0].cover.image_id}.jpg`
      }
    }
    return null
  } catch {
    return null
  }
}

async function processGame(game: { id: string; name: string; steam_app_id: number | null }, igdbToken: string | null) {
  let steamAppId = game.steam_app_id

  // Try to find Steam ID if not set
  if (!steamAppId) {
    steamAppId = await searchSteamAppId(game.name)
    if (steamAppId) {
      await supabase.from('games').update({ steam_app_id: steamAppId }).eq('id', game.id)
    }
  }

  // Try Steam images first
  if (steamAppId) {
    const coverUrl = `${STEAM_CDN}/${steamAppId}/library_600x900_2x.jpg`
    const heroUrl = `${STEAM_CDN}/${steamAppId}/library_hero.jpg`
    const logoUrl = `${STEAM_CDN}/${steamAppId}/logo.png`

    const coverValid = await verifyImageUrl(coverUrl)
    if (coverValid) {
      const updates: Record<string, string> = { cover_url: coverUrl }
      if (await verifyImageUrl(heroUrl)) updates.hero_url = heroUrl
      if (await verifyImageUrl(logoUrl)) updates.logo_url = logoUrl

      await supabase.from('games').update(updates).eq('id', game.id)
      return { success: true, source: 'steam' }
    }

    // Try fallback cover
    const fallbackCover = `${STEAM_CDN}/${steamAppId}/library_600x900.jpg`
    if (await verifyImageUrl(fallbackCover)) {
      await supabase.from('games').update({ cover_url: fallbackCover }).eq('id', game.id)
      return { success: true, source: 'steam-fallback' }
    }
  }

  // Fallback to IGDB
  if (igdbToken) {
    const igdbResult = await searchIgdb(game.name, igdbToken)
    if (igdbResult) {
      await supabase.from('games').update({ cover_url: igdbResult.cover_url }).eq('id', game.id)
      return { success: true, source: 'igdb', igdbMatch: igdbResult.name }
    }
  }

  return { success: false, error: 'No image source found' }
}

async function main() {
  console.log('Getting IGDB token...')
  const igdbToken = await getIgdbToken()
  if (!igdbToken) {
    console.log('Warning: Could not get IGDB token, will only use Steam')
  }

  console.log('Fetching all games...')
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, steam_app_id')
    .order('name')
    .range(0, 1999) // Fetch up to 2000 games

  if (error || !games) {
    console.error('Error fetching games:', error)
    process.exit(1)
  }

  console.log(`Processing ${games.length} games...`)

  let updated = 0
  let failed = 0
  let steamCount = 0
  let igdbCount = 0

  for (let i = 0; i < games.length; i++) {
    const game = games[i]
    process.stdout.write(`\r[${i + 1}/${games.length}] Processing: ${game.name.substring(0, 40).padEnd(40)}`)

    try {
      const result = await processGame(game, igdbToken)
      if (result.success) {
        updated++
        if (result.source === 'steam' || result.source === 'steam-fallback') steamCount++
        if (result.source === 'igdb') igdbCount++
      } else {
        failed++
      }
    } catch (err) {
      failed++
      console.error(`\nError processing ${game.name}:`, err)
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log(`\n\nDone!`)
  console.log(`Updated: ${updated}`)
  console.log(`  - Steam: ${steamCount}`)
  console.log(`  - IGDB: ${igdbCount}`)
  console.log(`Failed: ${failed}`)
}

main().catch(console.error)
