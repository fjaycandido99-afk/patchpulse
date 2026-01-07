#!/usr/bin/env npx tsx
/**
 * Backfill OG images for existing news items
 *
 * Run: npx tsx scripts/backfill-news-images.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fetchOGImage } from '../lib/ai/og-image-fetcher'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('\n🖼️  Backfill News Images')
  console.log('=========================\n')

  // Get news items without images
  const { data: newsItems, error } = await supabase
    .from('news_items')
    .select('id, title, source_url')
    .is('image_url', null)
    .not('source_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching news:', error)
    process.exit(1)
  }

  console.log(`Found ${newsItems?.length || 0} news items without images\n`)

  let updated = 0
  let failed = 0

  for (const item of newsItems || []) {
    process.stdout.write(`Fetching: ${item.title.substring(0, 45)}... `)

    const result = await fetchOGImage(item.source_url)
    const imageUrl = result.imageUrl

    if (imageUrl) {
      const { error: updateError } = await supabase
        .from('news_items')
        .update({ image_url: imageUrl })
        .eq('id', item.id)

      if (!updateError) {
        updated++
        console.log('✓')
      } else {
        failed++
        console.log('✗ (update failed)')
      }
    } else {
      failed++
      console.log('✗ (no image found)')
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log('\n=========================')
  console.log(`Updated: ${updated}`)
  console.log(`Failed: ${failed}`)
  console.log('=========================\n')
}

main().catch(console.error)
