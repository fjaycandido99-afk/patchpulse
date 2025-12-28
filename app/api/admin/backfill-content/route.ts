import { NextResponse } from 'next/server'
import { fetchAllSteamPatches } from '@/lib/fetchers/steam-patches'
import { fetchAllGamingNews } from '@/lib/fetchers/gaming-news'

export const maxDuration = 300 // 5 minutes max

function verifyAuth(req: Request): boolean {
  // Vercel cron
  if (req.headers.get('x-vercel-cron') === '1') return true
  // Manual call with secret
  const secret = req.headers.get('x-cron-secret')
  return !!process.env.CRON_SECRET && secret === process.env.CRON_SECRET
}

/**
 * Backfill patches and news from the last 3 days
 * GET /api/admin/backfill-content
 *
 * This fetches historical content to populate the database
 */
export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    patches: { success: false, totalAdded: 0, error: null as string | null },
    news: { success: false, totalAdded: 0, error: null as string | null },
  }

  // Fetch Steam patches (RSS feeds include last several days by default)
  try {
    const patchResult = await fetchAllSteamPatches()
    results.patches = {
      success: patchResult.success,
      totalAdded: patchResult.totalAdded || 0,
      error: patchResult.errors?.join(', ') || null,
    }
  } catch (error) {
    results.patches.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Fetch gaming news (RSS feeds include last several days by default)
  try {
    const newsResult = await fetchAllGamingNews()
    results.news = {
      success: newsResult.success,
      totalAdded: newsResult.totalAdded || 0,
      error: newsResult.errors?.join(', ') || null,
    }
  } catch (error) {
    results.news.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json({
    ok: true,
    message: 'Backfill complete - fetched recent patches and news from RSS feeds',
    patches: results.patches,
    news: results.news,
    totalAdded: results.patches.totalAdded + results.news.totalAdded,
  })
}
