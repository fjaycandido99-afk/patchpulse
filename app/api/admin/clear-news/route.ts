import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Support both GET and POST
export async function GET(req: Request) {
  return handleClearNews(req)
}

export async function POST(req: Request) {
  return handleClearNews(req)
}

async function handleClearNews(req: Request) {
  // Simple auth check - require secret
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    // Allow on Vercel without secret for admin use
    if (process.env.VERCEL !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createAdminClient()

    // Check if we should clear all (for re-fetch) or just old ones
    const clearAll = url.searchParams.get('all') === 'true'

    // Delete news items older than 3 days (or all if clearAll), excluding bookmarked ones
    const cutoffDate = clearAll
      ? new Date().toISOString() // All items
      : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago

    // First get IDs of bookmarked news
    const { data: bookmarkedNews } = await supabase
      .from('bookmarks')
      .select('news_id')
      .not('news_id', 'is', null)

    const bookmarkedIds = bookmarkedNews?.map(b => b.news_id).filter(Boolean) || []

    // First count how many we'll delete
    let countQuery = supabase
      .from('news_items')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffDate)

    if (bookmarkedIds.length > 0) {
      countQuery = countQuery.not('id', 'in', `(${bookmarkedIds.join(',')})`)
    }

    const { count } = await countQuery

    // Delete old news that aren't bookmarked
    let deleteQuery = supabase
      .from('news_items')
      .delete()
      .lt('created_at', cutoffDate)

    if (bookmarkedIds.length > 0) {
      deleteQuery = deleteQuery.not('id', 'in', `(${bookmarkedIds.join(',')})`)
    }

    const { error } = await deleteQuery

    if (error) {
      console.error('Error clearing news:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[ADMIN] Cleared ${count} old news items (kept ${bookmarkedIds.length} bookmarked)`)

    return NextResponse.json({
      ok: true,
      cleared: count,
      keptBookmarked: bookmarkedIds.length,
      message: `Cleared ${count} news items older than 3 days. Kept ${bookmarkedIds.length} bookmarked items.`
    })
  } catch (error) {
    console.error('Error in clear-news:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
