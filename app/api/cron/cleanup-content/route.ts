import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

function verifyAuth(req: Request): boolean {
  if (req.headers.get('x-vercel-cron') === '1') return true
  const secret = req.headers.get('x-cron-secret')
  return !!process.env.CRON_SECRET && secret === process.env.CRON_SECRET
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
    // Delete old patches that are NOT bookmarked
    // First get bookmarked patch IDs
    const { data: bookmarkedPatches } = await supabase
      .from('bookmarks')
      .select('patch_id')
      .not('patch_id', 'is', null)

    const bookmarkedPatchIds = bookmarkedPatches?.map(b => b.patch_id) || []

    // Delete old patches not in bookmarks
    let patchQuery = supabase
      .from('patch_notes')
      .delete()
      .lt('created_at', cutoffDate)

    if (bookmarkedPatchIds.length > 0) {
      patchQuery = patchQuery.not('id', 'in', `(${bookmarkedPatchIds.join(',')})`)
    }

    const { count: patchesDeleted } = await patchQuery.select('id', { count: 'exact', head: true })

    // Actually delete
    await supabase
      .from('patch_notes')
      .delete()
      .lt('created_at', cutoffDate)
      .not('id', 'in', bookmarkedPatchIds.length > 0 ? `(${bookmarkedPatchIds.join(',')})` : '()')

    results.patches.deleted = patchesDeleted || 0
    results.patches.kept = bookmarkedPatchIds.length

    // Delete old news that are NOT bookmarked
    const { data: bookmarkedNews } = await supabase
      .from('bookmarks')
      .select('news_id')
      .not('news_id', 'is', null)

    const bookmarkedNewsIds = bookmarkedNews?.map(b => b.news_id) || []

    // Count before delete
    const { count: newsToDelete } = await supabase
      .from('news_items')
      .select('id', { count: 'exact', head: true })
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

    results.news.deleted = (newsToDelete || 0) - bookmarkedNewsIds.length
    results.news.kept = bookmarkedNewsIds.length

    // Also clean up old notifications (older than 7 days, read ones only)
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
