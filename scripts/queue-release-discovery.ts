// Script to queue release discovery for all followed games
// Run with: npx tsx scripts/queue-release-discovery.ts

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env vars from .env.local
config({ path: '.env.local' })
import { queueAIJob } from '../lib/ai/jobs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function main() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get all games
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name')

  if (error) {
    console.error('Error fetching games:', error)
    return
  }

  console.log(`Found ${games?.length || 0} games`)

  for (const game of games || []) {
    console.log(`Queueing release discovery for: ${game.name}`)
    const result = await queueAIJob('DISCOVER_RELEASES', game.id)
    if ('error' in result) {
      console.error(`  Failed: ${result.error}`)
    } else {
      console.log(`  Queued job: ${result.id}`)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
