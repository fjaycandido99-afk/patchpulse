// Seed upcoming_releases with test data
// Run with: npx tsx scripts/seed-releases.ts

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env vars from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function seed() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Fetching games...\n')

  // Get all games
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('id, name')
    .limit(5)

  if (gamesError) {
    console.log('Error fetching games:', gamesError.message)
    return
  }

  if (!games || games.length === 0) {
    console.log('No games found in database')
    return
  }

  console.log(`Found ${games.length} games, adding sample releases...\n`)

  // Sample release data for each game
  const releases = games.flatMap((game) => [
    {
      game_id: game.id,
      title: `${game.name} - Season 2`,
      release_type: 'season',
      release_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks
      is_confirmed: true,
      confidence_score: 0.9,
    },
    {
      game_id: game.id,
      title: `${game.name} - Winter Update`,
      release_type: 'update',
      release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week
      release_window: 'Late December 2024',
      is_confirmed: false,
      confidence_score: 0.7,
    },
  ])

  const { data, error } = await supabase
    .from('upcoming_releases')
    .upsert(releases, { onConflict: 'game_id,title' })
    .select()

  if (error) {
    console.log('Error inserting releases:', error.message)
    return
  }

  console.log(`Successfully added ${releases.length} releases!`)
  console.log('Sample:', JSON.stringify(data?.slice(0, 2), null, 2))
}

seed().catch(console.error)
