import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Count news with vs without game_id
  const { count: withGame } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true })
    .not('game_id', 'is', null)

  const { count: withoutGame } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true })
    .is('game_id', null)

  console.log(`\nNews with game_id: ${withGame}`)
  console.log(`News without game_id: ${withoutGame}`)

  // Get top 5 news items WITH game_id
  const { data, error } = await supabase
    .from('news_items')
    .select('id, title, image_url, game_id, games(name, cover_url, hero_url)')
    .not('game_id', 'is', null)
    .eq('is_rumor', false)
    .order('published_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('\nTop 5 news items WITH game_id:')
  data.forEach((item: any, i: number) => {
    console.log(`\n[${i+1}] ${item.title.substring(0, 60)}...`)
    console.log(`    game: ${item.games?.name || 'NULL'}`)
    console.log(`    game.cover_url: ${item.games?.cover_url ? 'SET' : 'NULL'}`)
    console.log(`    game.hero_url: ${item.games?.hero_url ? 'SET' : 'NULL'}`)
  })
}

check()
