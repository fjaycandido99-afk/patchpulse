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
  console.log('[CRON] x-vercel-cron header:', request.headers.get('x-vercel-cron'))
  console.log('[CRON] authorization header exists:', !!request.headers.get('authorization'))

  // Verify cron authentication
  if (!verifyCronAuth(request)) {
    console.log('[CRON] fetch-videos UNAUTHORIZED')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[CRON] fetch-videos AUTHORIZED - starting fetch')

  try {
    const result = await fetchAllGameVideos()

    console.log(`[CRON] Video fetch complete: ${result.totalAdded} videos added from ${result.gamesChecked} games`)

    return NextResponse.json({
      ok: true,
      success: true,
      message: `Fetched videos for ${result.gamesChecked} games`,
      totalAdded: result.totalAdded,
      gamesChecked: result.gamesChecked,
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
