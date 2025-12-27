#!/usr/bin/env npx tsx
/**
 * Backfill OG images for existing news items
 *
 * Run: npx tsx scripts/backfill-news-images.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Fetch OG image from a URL
async function fetchOGImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) return null

    const html = await response.text()

    // Extract OG image
    const patterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        let imageUrl = match[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')

        // Handle relative URLs
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl
        } else if (imageUrl.startsWith('/')) {
          const urlObj = new URL(url)
          imageUrl = `${urlObj.origin}${imageUrl}`
        }

        // Validate URL
        try {
          new URL(imageUrl)
          return imageUrl
        } catch {
          continue
        }
      }
    }

    return null
  } catch (error) {
    return null
  }
}

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

    const imageUrl = await fetchOGImage(item.source_url)

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
