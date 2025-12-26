import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchOGImage } from '@/lib/ai/og-image-fetcher'

export const maxDuration = 300 // 5 minutes max for Vercel

/**
 * Backfill OG images for existing news items
 * GET /api/admin/backfill-news-images?limit=50
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  const supabase = await createClient()

  // Check if user is admin (optional - remove if not needed)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find news items with source_url but no image_url
  const { data: newsItems, error: fetchError } = await supabase
    .from('news_items')
    .select('id, title, source_url')
    .not('source_url', 'is', null)
    .is('image_url', null)
    .limit(limit)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!newsItems || newsItems.length === 0) {
    return NextResponse.json({
      message: 'No news items need backfilling',
      processed: 0,
      success: 0,
      failed: 0
    })
  }

  let success = 0
  let failed = 0
  const results: Array<{ id: string; title: string; imageUrl: string | null; error?: string }> = []

  // Process each news item
  for (const item of newsItems) {
    if (!item.source_url) continue

    try {
      const ogResult = await fetchOGImage(item.source_url)

      if (ogResult.imageUrl) {
        // Update the database
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ image_url: ogResult.imageUrl })
          .eq('id', item.id)

        if (updateError) {
          failed++
          results.push({ id: item.id, title: item.title, imageUrl: null, error: updateError.message })
        } else {
          success++
          results.push({ id: item.id, title: item.title, imageUrl: ogResult.imageUrl })
        }
      } else {
        // No image found
        results.push({ id: item.id, title: item.title, imageUrl: null, error: 'No OG image found' })
        failed++
      }
    } catch (err) {
      failed++
      results.push({
        id: item.id,
        title: item.title,
        imageUrl: null,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return NextResponse.json({
    message: `Backfill complete`,
    processed: newsItems.length,
    success,
    failed,
    results
  })
}
