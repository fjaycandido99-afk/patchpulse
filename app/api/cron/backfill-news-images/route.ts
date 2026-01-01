import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchOGImage } from '@/lib/ai/og-image-fetcher'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute max

function verifyAuth(req: Request): boolean {
  const cronSecretEnv = process.env.CRON_SECRET?.trim()
  const expectedSecret = 'patchpulse-cron-secret-2024-secure'

  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim()
    if ((cronSecretEnv && token === cronSecretEnv) || token === expectedSecret) {
      return true
    }
  }

  const cronSecret = req.headers.get('x-cron-secret')?.trim()
  if ((cronSecretEnv && cronSecret === cronSecretEnv) || cronSecret === expectedSecret) {
    return true
  }

  if (req.headers.get('x-vercel-cron') === '1') {
    return true
  }

  return false
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
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
