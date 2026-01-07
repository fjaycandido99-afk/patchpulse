import { NextResponse } from 'next/server'
import { fetchAllGamingNews } from '@/lib/fetchers/gaming-news'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for news only

export async function GET(req: Request) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  console.log(`[FETCH-NEWS] ========== Starting at ${timestamp} ==========`)

  // Allow manual trigger on Vercel without auth (for admin use)
  const url = new URL(req.url)
  const isManualTrigger = url.searchParams.get('manual') === 'true' && process.env.VERCEL === '1'

  console.log(`[FETCH-NEWS] Manual trigger: ${isManualTrigger}`)

  if (!isManualTrigger && !verifyCronAuth(req)) {
    console.log('[FETCH-NEWS] Auth FAILED - returning 401')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[FETCH-NEWS] Auth successful, fetching news...')

  try {
    const result = await fetchAllGamingNews()

    const totalTime = Date.now() - startTime
    console.log(`[FETCH-NEWS] ========== Completed in ${totalTime}ms ==========`)
    console.log(`[FETCH-NEWS] Result: ${result.totalAdded} added, ${result.sourcesChecked} sources checked`)

    return NextResponse.json({
      ok: true,
      totalTimeMs: totalTime,
      ...result
    })
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[FETCH-NEWS] FAILED after ${totalTime}ms:`, error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
