import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  console.log('Fetching games with hero images...')

  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, hero_url')
    .not('hero_url', 'is', null)
    .order('name')
    .range(0, 1999)

  if (error || !games) {
    console.error('Error:', error)
    process.exit(1)
  }

  console.log(`Checking ${games.length} hero images...\n`)

  const broken: Array<{ name: string; id: string; hero_url: string }> = []

  for (let i = 0; i < games.length; i++) {
    const game = games[i]
    if (!game.hero_url) continue

    process.stdout.write(`\r[${i + 1}/${games.length}] Checking: ${game.name.substring(0, 40).padEnd(40)}`)

    const isValid = await checkImageUrl(game.hero_url)
    if (!isValid) {
      broken.push({ name: game.name, id: game.id, hero_url: game.hero_url })
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.log(`\n\nDone! Found ${broken.length} broken hero images:\n`)

  for (const game of broken) {
    console.log(`- ${game.name}`)
    console.log(`  ID: ${game.id}`)
    console.log(`  URL: ${game.hero_url}\n`)
  }

  // Output as JSON for easy processing
  if (broken.length > 0) {
    console.log('\nBroken games JSON:')
    console.log(JSON.stringify(broken.map(g => ({ id: g.id, name: g.name })), null, 2))
  }
}

main().catch(console.error)
