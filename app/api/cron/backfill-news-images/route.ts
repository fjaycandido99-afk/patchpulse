import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchOGImage } from '@/lib/ai/og-image-fetcher'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute max

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get news items without images (limit to avoid timeout)
  const { data: newsWithoutImages, error } = await supabase
    .from('news_items')
    .select('id, source_url')
    .is('image_url', null)
    .not('source_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20) // Process 20 at a time

  if (error || !newsWithoutImages) {
    return NextResponse.json({ ok: false, error: error?.message || 'No items found' })
  }

  let updatedCount = 0

  for (const news of newsWithoutImages) {
    if (!news.source_url) continue

    try {
      const ogData = await fetchOGImage(news.source_url)

      if (ogData.imageUrl) {
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ image_url: ogData.imageUrl })
          .eq('id', news.id)

        if (!updateError) {
          updatedCount++
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch OG image for news ${news.id}:`, e)
    }
  }

  return NextResponse.json({
    ok: true,
    processed: newsWithoutImages.length,
    updated: updatedCount,
  })
}
