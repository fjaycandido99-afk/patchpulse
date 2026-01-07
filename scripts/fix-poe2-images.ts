/**
 * Fix Path of Exile 2 images
 * Run with: npx tsx scripts/fix-poe2-images.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const POE2_STEAM_APP_ID = 2694490
const STEAM_CDN = 'https://cdn.akamai.steamstatic.com/steam/apps'

async function fixPoe2Images() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Steam image URLs for PoE2
  const imageUrls = {
    cover_url: `${STEAM_CDN}/${POE2_STEAM_APP_ID}/library_600x900_2x.jpg`,
    hero_url: `${STEAM_CDN}/${POE2_STEAM_APP_ID}/library_hero.jpg`,
    logo_url: `${STEAM_CDN}/${POE2_STEAM_APP_ID}/logo.png`,
    steam_app_id: POE2_STEAM_APP_ID,
  }

  // Find Path of Exile 2 in database
  const { data: game, error: findError } = await supabase
    .from('games')
    .select('id, name, cover_url, hero_url, logo_url, steam_app_id')
    .ilike('name', 'Path of Exile 2')
    .single()

  if (findError || !game) {
    console.error('Could not find Path of Exile 2:', findError?.message)
    return
  }

  console.log('Found game:', game.name)
  console.log('Current images:')
  console.log('  cover_url:', game.cover_url || '(none)')
  console.log('  hero_url:', game.hero_url || '(none)')
  console.log('  logo_url:', game.logo_url || '(none)')
  console.log('  steam_app_id:', game.steam_app_id || '(none)')

  // Update with Steam images
  const { error: updateError } = await supabase
    .from('games')
    .update(imageUrls)
    .eq('id', game.id)

  if (updateError) {
    console.error('Failed to update:', updateError.message)
    return
  }

  console.log('\nUpdated Path of Exile 2 with:')
  console.log('  cover_url:', imageUrls.cover_url)
  console.log('  hero_url:', imageUrls.hero_url)
  console.log('  logo_url:', imageUrls.logo_url)
  console.log('  steam_app_id:', imageUrls.steam_app_id)
  console.log('\nDone!')
}

fixPoe2Images().catch(console.error)
