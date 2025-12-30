import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkBacklogPatches() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get all games in any user's backlog
  const { data: backlogItems } = await supabase
    .from('backlog_items')
    .select('game_id, games(id, name, slug, steam_app_id)')
    .limit(20)

  if (!backlogItems) {
    console.log('No backlog items found')
    return
  }

  const uniqueGames = new Map()
  for (const item of backlogItems) {
    const game = item.games as any
    if (game && !uniqueGames.has(game.id)) {
      uniqueGames.set(game.id, game)
    }
  }

  console.log(`\nFound ${uniqueGames.size} unique games in backlog:\n`)

  for (const [gameId, game] of uniqueGames) {
    // Count patches for this game
    const { count: patchCount } = await supabase
      .from('patch_notes')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)

    // Get most recent patch
    const { data: recentPatch } = await supabase
      .from('patch_notes')
      .select('title, published_at')
      .eq('game_id', gameId)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    console.log(`📦 ${game.name}`)
    console.log(`   Steam ID: ${game.steam_app_id || 'NONE'}`)
    console.log(`   Patches: ${patchCount || 0}`)
    if (recentPatch) {
      console.log(`   Latest: ${recentPatch.title?.slice(0, 50)}... (${recentPatch.published_at?.split('T')[0]})`)
    }
    console.log('')
  }
}

checkBacklogPatches().catch(console.error)
