import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Steam image helper
function getSteamImages(appId: number) {
  return {
    cover_url: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
    hero_url: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`,
    logo_url: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/logo.png`,
  }
}

const gamesToAdd = [
  {
    name: 'ARC Raiders',
    slug: 'arc-raiders',
    steam_app_id: 1562840,
    platforms: ['PC'],
    genre: 'Shooter',
    is_live_service: true,
  },
  {
    name: 'Escape from Duckov',
    slug: 'escape-from-duckov',
    steam_app_id: 3033840,
    platforms: ['PC'],
    genre: 'Extraction Shooter',
    is_live_service: false,
  },
  {
    name: 'Where Winds Meet',
    slug: 'where-winds-meet',
    steam_app_id: 1928290,
    platforms: ['PC'],
    genre: 'Action RPG',
    is_live_service: true,
  },
  {
    name: 'Battlefield 6',
    slug: 'battlefield-6',
    steam_app_id: null, // Not on Steam yet
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genre: 'Shooter',
    is_live_service: true,
  },
  {
    name: 'EA SPORTS FC 26',
    slug: 'ea-sports-fc-26',
    steam_app_id: null, // Not on Steam yet
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genre: 'Sports',
    is_live_service: true,
  },
  {
    name: 'Clair Obscur: Expedition 33',
    slug: 'clair-obscur-expedition-33',
    steam_app_id: 2138710,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genre: 'RPG',
    is_live_service: false,
  },
  {
    name: 'Kingdom Come: Deliverance II',
    slug: 'kingdom-come-deliverance-2',
    steam_app_id: 1771300,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genre: 'RPG',
    is_live_service: false,
  },
  {
    name: 'Grand Theft Auto V',
    slug: 'grand-theft-auto-v',
    steam_app_id: 271590,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genre: 'Action',
    is_live_service: true,
  },
]

async function main() {
  console.log('Checking and adding games...\n')

  for (const game of gamesToAdd) {
    // Check if exists
    const { data: existing } = await supabase
      .from('games')
      .select('id, name')
      .or(`slug.eq.${game.slug},name.ilike.%${game.name.split(':')[0]}%`)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`✓ ALREADY EXISTS: ${game.name} (as "${existing[0].name}")`)
      continue
    }

    // Get Steam images if available
    const images = game.steam_app_id ? getSteamImages(game.steam_app_id) : null

    // Insert game
    const { data: inserted, error } = await supabase
      .from('games')
      .insert({
        name: game.name,
        slug: game.slug,
        steam_app_id: game.steam_app_id,
        platforms: game.platforms,
        genre: game.genre,
        is_live_service: game.is_live_service,
        cover_url: images?.cover_url || null,
        hero_url: images?.hero_url || null,
        logo_url: images?.logo_url || null,
        support_tier: 'partial',
        mvp_eligible: false,
      })
      .select('id, name')
      .single()

    if (error) {
      console.log(`✗ FAILED: ${game.name} - ${error.message}`)
    } else {
      console.log(`+ ADDED: ${game.name}`)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
