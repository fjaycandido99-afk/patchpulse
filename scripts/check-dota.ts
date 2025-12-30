import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  // Get Dota 2 game
  const { data: game } = await supabase
    .from('games')
    .select('id, name, cover_url, hero_url, logo_url')
    .ilike('name', '%dota%')
    .single()

  console.log('Dota 2 Game:', JSON.stringify(game, null, 2))

  if (!game) {
    console.log('Dota 2 not found')
    return
  }

  // Check if cover_url is valid
  if (game.cover_url) {
    console.log('\nCover URL:', game.cover_url)
  } else {
    console.log('\nNo cover_url set!')
  }
}

check().catch(console.error)
