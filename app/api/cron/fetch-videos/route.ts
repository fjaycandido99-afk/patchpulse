import { NextResponse } from 'next/server'
import { fetchAllGameVideos } from '@/lib/youtube/api'
import { verifyCronAuth } from '@/lib/cron-auth'

// Vercel Cron: Run every 6 hours
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function GET(request: Request) {
  // Debug logging
  console.log('[CRON] fetch-videos hit at', new Date().toISOString())

  // Allow manual trigger on Vercel without auth (for admin use)
  const url = new URL(request.url)
  const isManualTrigger = url.searchParams.get('manual') === 'true' && process.env.VERCEL === '1'

  // Verify cron authentication
  if (!isManualTrigger && !verifyCronAuth(request)) {
    console.log('[CRON] fetch-videos UNAUTHORIZED')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[CRON] fetch-videos AUTHORIZED - starting fetch')

  try {
    const result = await fetchAllGameVideos()

    // Log breakdown by category
    const breakdown = result.breakdown
    console.log(`[CRON] Video fetch complete: ${result.totalAdded} videos added`)
    console.log(`[CRON] Trailers: ${breakdown.trailers.added} (${breakdown.trailers.games.join(', ')})`)
    console.log(`[CRON] Clips: ${breakdown.clips.added} (${breakdown.clips.games.join(', ')})`)
    console.log(`[CRON] Gameplay: ${breakdown.gameplay.added} (${breakdown.gameplay.games.join(', ')})`)
    console.log(`[CRON] Esports: ${breakdown.esports.added} (${breakdown.esports.games.join(', ')})`)

    return NextResponse.json({
      ok: true,
      success: true,
      message: `Fetched ${result.totalAdded} videos`,
      totalAdded: result.totalAdded,
      breakdown: result.breakdown,
      errors: result.errors,
    })
  } catch (error) {
    console.error('[CRON] Video fetch error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch videos', details: String(error) },
      { status: 500 }
    )
  }
}
