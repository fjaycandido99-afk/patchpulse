import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const parser = new Parser()

async function testBackfill() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test games
  const testGames = [
    { name: 'Dota 2', steam_app_id: 570 },
    { name: 'Marvel Rivals', steam_app_id: 2767030 },
    { name: 'Where Winds Meet', steam_app_id: 3564740 },
  ]

  for (const game of testGames) {
    console.log(`\n🎮 Testing ${game.name} (Steam ID: ${game.steam_app_id})`)

    try {
      const feedUrl = `https://store.steampowered.com/feeds/news/app/${game.steam_app_id}`
      console.log(`   Fetching: ${feedUrl}`)

      const feed = await parser.parseURL(feedUrl)
      const itemCount = feed.items ? feed.items.length : 0
      console.log(`   Found ${itemCount} items in RSS feed`)

      // Show first few items
      const items = feed.items ? feed.items.slice(0, 5) : []
      for (const item of items) {
        const title = item.title || 'No title'
        const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : 'No date'
        const isPatch = /update|patch|hotfix|fix|version|changelog|notes|maintenance/i.test(title)
        const truncatedTitle = title.length > 60 ? title.slice(0, 60) + '...' : title
        console.log(`   ${isPatch ? '✅' : '⏭️'} [${date}] ${truncatedTitle}`)
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
}

testBackfill().catch(console.error)
