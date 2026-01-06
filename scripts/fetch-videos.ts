import { config } from 'dotenv'
config({ path: '.env.local' })

import { fetchAllGameVideos } from '../lib/youtube/api'

async function main() {
  console.log('Starting video fetch...')
  console.log('Quota: ~2,250 units/run × 4 runs/day = ~9,000/day')
  console.log('Split: Trailers 35% (8 games), Clips 35% (5 games + 3 viral), Gameplay 15% (3 games), Esports 15% (3 games)\n')

  try {
    const result = await fetchAllGameVideos()

    console.log('\n=== Video Fetch Complete ===')
    console.log(`Total videos added: ${result.totalAdded}\n`)

    console.log('Breakdown by category:')
    const { breakdown } = result
    console.log(`  Trailers: ${breakdown.trailers.added} videos`)
    if (breakdown.trailers.games.length > 0) {
      console.log(`    Games: ${breakdown.trailers.games.join(', ')}`)
    }

    console.log(`  Clips: ${breakdown.clips.added} videos`)
    if (breakdown.clips.games.length > 0) {
      console.log(`    Games: ${breakdown.clips.games.join(', ')}`)
    }

    console.log(`  Gameplay: ${breakdown.gameplay.added} videos`)
    if (breakdown.gameplay.games.length > 0) {
      console.log(`    Games: ${breakdown.gameplay.games.join(', ')}`)
    }

    console.log(`  Esports: ${breakdown.esports.added} videos`)
    if (breakdown.esports.games.length > 0) {
      console.log(`    Games: ${breakdown.esports.games.join(', ')}`)
    }

    if (result.errors && result.errors.length > 0) {
      console.log('\nErrors:', result.errors)
    }
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    process.exit(1)
  }
}

main()
