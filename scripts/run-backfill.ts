import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const parser = new Parser({
  customFields: {
    item: ['description'],
  },
})

async function runBackfill() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get backlog games with steam_app_id
  const { data: games } = await supabase
    .from('games')
    .select('id, name, slug, steam_app_id')
    .not('steam_app_id', 'is', null)

  if (!games) {
    console.log('No games found')
    return
  }

  console.log(`Found ${games.length} games with Steam IDs\n`)

  const fourMonthsAgo = new Date()
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  let totalAdded = 0

  for (const game of games) {
    console.log(`\n🎮 ${game.name} (ID: ${game.steam_app_id})`)

    try {
      const feedUrl = `https://store.steampowered.com/feeds/news/app/${game.steam_app_id}`
      const feed = await parser.parseURL(feedUrl)

      let addedForGame = 0

      for (const item of feed.items || []) {
        // Check if within 4 months
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()
        if (pubDate < fourMonthsAgo) continue

        const title = (item.title || '').toLowerCase()
        const isPatch =
          title.includes('update') ||
          title.includes('patch') ||
          title.includes('hotfix') ||
          title.includes('fix') ||
          title.includes('version') ||
          title.includes('changelog') ||
          title.includes('release note') ||
          title.includes('maintenance') ||
          title.includes('notes')

        if (!isPatch) continue

        // Check for duplicates
        const { data: existing } = await supabase
          .from('patch_notes')
          .select('id')
          .eq('source_url', item.link)
          .single()

        if (existing) {
          console.log(`   ⏭️ Already exists: ${item.title?.slice(0, 50)}`)
          continue
        }

        const rawText = item.contentSnippet || item.content || ''
        if (rawText.length < 50) continue

        // Insert patch
        const { error } = await supabase.from('patch_notes').insert({
          game_id: game.id,
          title: item.title || `${game.name} Update`,
          source_url: item.link,
          raw_text: rawText.slice(0, 10000),
          published_at: pubDate.toISOString(),
          summary_tldr: 'Patch notes for this update. AI summary processing...',
          impact_score: 5,
          tags: ['update'],
          key_changes: [],
        })

        if (error) {
          console.log(`   ❌ Error: ${error.message}`)
        } else {
          console.log(`   ✅ Added: ${item.title?.slice(0, 50)}`)
          addedForGame++
          totalAdded++
        }
      }

      console.log(`   Added ${addedForGame} patches`)
    } catch (error: any) {
      console.log(`   ❌ Feed error: ${error.message}`)
    }
  }

  console.log(`\n\n🎉 Total patches added: ${totalAdded}`)
}

runBackfill().catch(console.error)
