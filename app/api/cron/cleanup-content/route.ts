import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

function verifyAuth(req: Request): boolean {
  // Vercel cron
  if (req.headers.get('x-vercel-cron') === '1') return true
  // Manual call with CRON_SECRET
  const cronSecret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) return true
  // Manual call with INTERNAL_API_SECRET
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (process.env.INTERNAL_API_SECRET && token === process.env.INTERNAL_API_SECRET) return true
  return false
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const cutoffDate = threeDaysAgo.toISOString()

  const results = {
    patches: { deleted: 0, kept: 0 },
    news: { deleted: 0, kept: 0 },
  }

  try {
    // Get bookmarked patch IDs to preserve
    const { data: bookmarkedPatches } = await supabase
      .from('bookmarks')
      .select('patch_id')
      .not('patch_id', 'is', null)

    const bookmarkedPatchIds = (bookmarkedPatches?.map(b => b.patch_id).filter(Boolean) || []) as string[]

    // Count patches to delete
    const { count: patchCount } = await supabase
      .from('patch_notes')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffDate)

    // Delete old patches not in bookmarks
    if (bookmarkedPatchIds.length > 0) {
      await supabase
        .from('patch_notes')
        .delete()
        .lt('created_at', cutoffDate)
        .not('id', 'in', `(${bookmarkedPatchIds.join(',')})`)
    } else {
      await supabase
        .from('patch_notes')
        .delete()
        .lt('created_at', cutoffDate)
    }

    results.patches.deleted = patchCount || 0
    results.patches.kept = bookmarkedPatchIds.length

    // Get bookmarked news IDs to preserve
    const { data: bookmarkedNews } = await supabase
      .from('bookmarks')
      .select('news_id')
      .not('news_id', 'is', null)

    const bookmarkedNewsIds = (bookmarkedNews?.map(b => b.news_id).filter(Boolean) || []) as string[]

    // Count news to delete
    const { count: newsCount } = await supabase
      .from('news_items')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffDate)

    // Delete old news not in bookmarks
    if (bookmarkedNewsIds.length > 0) {
      await supabase
        .from('news_items')
        .delete()
        .lt('created_at', cutoffDate)
        .not('id', 'in', `(${bookmarkedNewsIds.join(',')})`)
    } else {
      await supabase
        .from('news_items')
        .delete()
        .lt('created_at', cutoffDate)
    }

    results.news.deleted = newsCount || 0
    results.news.kept = bookmarkedNewsIds.length

    // Clean up old read notifications (older than 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    await supabase
      .from('notifications')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString())
      .eq('is_read', true)

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    cutoffDate,
    ...results,
  })
}
