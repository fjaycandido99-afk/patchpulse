#!/usr/bin/env npx tsx
/**
 * Backfill game images from Steam
 *
 * Run: npx tsx scripts/backfill-game-images.ts
 *
 * Options:
 *   --limit=N     Number of games to process (default: 100)
 *   --refresh     Force refresh all images even if they exist
 *   --game=ID     Update a specific game by ID
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const STEAM_CDN = 'https://cdn.akamai.steamstatic.com/steam/apps'

function getSteamImageUrls(steamAppId: number) {
  return {
    cover_url: `${STEAM_CDN}/${steamAppId}/library_600x900_2x.jpg`,
    header_url: `${STEAM_CDN}/${steamAppId}/header.jpg`,
    hero_url: `${STEAM_CDN}/${steamAppId}/library_hero.jpg`,
    logo_url: `${STEAM_CDN}/${steamAppId}/logo.png`,
    capsule_url: `${STEAM_CDN}/${steamAppId}/capsule_616x353.jpg`,
  }
}

function getSteamCoverFallbacks(steamAppId: number): string[] {
  return [
    `${STEAM_CDN}/${steamAppId}/library_600x900_2x.jpg`,
    `${STEAM_CDN}/${steamAppId}/library_600x900.jpg`,
    `${STEAM_CDN}/${steamAppId}/capsule_616x353.jpg`,
    `${STEAM_CDN}/${steamAppId}/header.jpg`,
  ]
}

async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

async function searchSteamAppId(gameName: string): Promise<number | null> {
  try {
    const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&cc=us&l=en`
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PatchPulseBot/1.0)',
      },
    })

    if (!response.ok) return null

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      return data.items[0].id as number
    }

    return null
  } catch (error) {
    console.error('Steam search error:', error)
    return null
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING')
    console.error('  SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'set' : 'MISSING')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Parse args
  const args = process.argv.slice(2)
  const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '100', 10)
  const forceRefresh = args.includes('--refresh')
  const specificGameId = args.find(a => a.startsWith('--game='))?.split('=')[1]

  console.log('\n🎮 Game Image Backfill Script')
  console.log('================================')
  console.log(`  Limit: ${limit}`)
  console.log(`  Force Refresh: ${forceRefresh}`)
  if (specificGameId) console.log(`  Specific Game: ${specificGameId}`)
  console.log('')

  // Get games to process
  let query = supabase
    .from('games')
    .select('id, name, steam_app_id, cover_url, hero_url, logo_url')

  if (specificGameId) {
    query = query.eq('id', specificGameId)
  } else if (!forceRefresh) {
    query = query.or('cover_url.is.null,hero_url.is.null,logo_url.is.null')
  }

  const { data: games, error } = await query.limit(limit)

  if (error) {
    console.error('Database error:', error.message)
    process.exit(1)
  }

  if (!games || games.length === 0) {
    console.log('No games found to update!')
    process.exit(0)
  }

  console.log(`Found ${games.length} games to process\n`)

  let updated = 0
  let failed = 0
  let skipped = 0

  for (const game of games) {
    process.stdout.write(`Processing: ${game.name}... `)

    let steamAppId = game.steam_app_id

    // If no steam_app_id, try to find it
    if (!steamAppId) {
      steamAppId = await searchSteamAppId(game.name)

      if (steamAppId) {
        await supabase
          .from('games')
          .update({ steam_app_id: steamAppId })
          .eq('id', game.id)
        console.log(`[Found Steam ID: ${steamAppId}]`)
      } else {
        console.log('[Not found on Steam]')
        failed++
        continue
      }
    }

    const urls = getSteamImageUrls(steamAppId)
    const coverFallbacks = getSteamCoverFallbacks(steamAppId)
    const updates: Record<string, string | null> = {}

    // Try cover fallbacks
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

    // Fallback cover to capsule
    if (!updates.cover_url && await verifyImageUrl(urls.capsule_url)) {
      updates.cover_url = urls.capsule_url
    }

    if (Object.keys(updates).length === 0) {
      console.log('[No valid images found]')
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('games')
      .update(updates)
      .eq('id', game.id)

    if (updateError) {
      console.log(`[Error: ${updateError.message}]`)
      failed++
    } else {
      console.log(`[Updated: ${Object.keys(updates).join(', ')}]`)
      updated++
    }

    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('\n================================')
  console.log('Summary:')
  console.log(`  Updated: ${updated}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Skipped: ${skipped}`)
  console.log('================================\n')
}

main().catch(console.error)
