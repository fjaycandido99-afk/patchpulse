import { NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 300

// Master cron that runs all tasks
// Runs every 15 minutes - handles frequent tasks
// Daily tasks only run at specific hours
export async function GET(req: Request) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  console.log(`[MASTER CRON] ========== Starting at ${timestamp} ==========`)

  // Allow manual trigger on Vercel without auth (for admin use)
  const url = new URL(req.url)
  const isManualTrigger = url.searchParams.get('manual') === 'true' && process.env.VERCEL === '1'

  if (!isManualTrigger && !verifyCronAuth(req)) {
    console.log('[MASTER CRON] Auth failed - returning 401')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[MASTER CRON] Auth successful')

  // Use production URL for internal calls, not deployment-specific URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  console.log(`[MASTER CRON] Base URL: ${baseUrl}`)

  // Use CRON_SECRET for internal calls (x-vercel-cron only works for direct Vercel calls)
  const internalHeaders = {
    'x-cron-secret': process.env.CRON_SECRET || '',
  }

  const results: Record<string, unknown> = {}
  const timings: Record<string, number> = {}
  const currentHour = new Date().getUTCHours()

  console.log(`[MASTER CRON] Current UTC hour: ${currentHour}`)

  // Always run: fetch-content (every 15 min)
  console.log('[MASTER CRON] Running fetch-content...')
  let taskStart = Date.now()
  try {
    const res = await fetch(`${baseUrl}/api/cron/fetch-content`, {
      headers: internalHeaders,
    })
    results.fetchContent = await res.json()
    timings.fetchContent = Date.now() - taskStart
    console.log(`[MASTER CRON] fetch-content completed in ${timings.fetchContent}ms:`, JSON.stringify(results.fetchContent).slice(0, 200))
  } catch (e) {
    results.fetchContent = { error: String(e) }
    console.error('[MASTER CRON] fetch-content FAILED:', e)
  }

  // Always run: process-ai-jobs (every 15 min)
  console.log('[MASTER CRON] Running process-ai-jobs...')
  taskStart = Date.now()
  try {
    const res = await fetch(`${baseUrl}/api/cron/process-ai-jobs`, {
      headers: internalHeaders,
    })
    results.processAiJobs = await res.json()
    timings.processAiJobs = Date.now() - taskStart
    console.log(`[MASTER CRON] process-ai-jobs completed in ${timings.processAiJobs}ms:`, JSON.stringify(results.processAiJobs).slice(0, 200))
  } catch (e) {
    results.processAiJobs = { error: String(e) }
    console.error('[MASTER CRON] process-ai-jobs FAILED:', e)
  }

  // Always run: fetch-deals (every 15 min - keeps deals fresh)
  console.log('[MASTER CRON] Running fetch-deals...')
  taskStart = Date.now()
  try {
    const res = await fetch(`${baseUrl}/api/cron/fetch-deals`, {
      headers: internalHeaders,
    })
    results.fetchDeals = await res.json()
    timings.fetchDeals = Date.now() - taskStart
    console.log(`[MASTER CRON] fetch-deals completed in ${timings.fetchDeals}ms:`, JSON.stringify(results.fetchDeals).slice(0, 200))
  } catch (e) {
    results.fetchDeals = { error: String(e) }
    console.error('[MASTER CRON] fetch-deals FAILED:', e)
  }

  // Always run: fetch-news (keeps news fresh)
  console.log('[MASTER CRON] Running fetch-news...')
  taskStart = Date.now()
  try {
    const res = await fetch(`${baseUrl}/api/cron/fetch-news`, {
      headers: internalHeaders,
    })
    results.fetchNews = await res.json()
    timings.fetchNews = Date.now() - taskStart
    console.log(`[MASTER CRON] fetch-news completed in ${timings.fetchNews}ms:`, JSON.stringify(results.fetchNews).slice(0, 200))
  } catch (e) {
    results.fetchNews = { error: String(e) }
    console.error('[MASTER CRON] fetch-news FAILED:', e)
  }

  // Always run: process-notifications (smart notification queue processing)
  console.log('[MASTER CRON] Running process-notifications...')
  taskStart = Date.now()
  try {
    const res = await fetch(`${baseUrl}/api/cron/process-notifications`, {
      headers: internalHeaders,
    })
    results.processNotifications = await res.json()
    timings.processNotifications = Date.now() - taskStart
    console.log(`[MASTER CRON] process-notifications completed in ${timings.processNotifications}ms:`, JSON.stringify(results.processNotifications).slice(0, 200))
  } catch (e) {
    results.processNotifications = { error: String(e) }
    console.error('[MASTER CRON] process-notifications FAILED:', e)
  }

  // Run at 0, 6, 12, 18 UTC: discover-games
  if (currentHour % 6 === 0) {
    console.log('[MASTER CRON] Running discover-games (6-hour task)...')
    taskStart = Date.now()
    try {
      const res = await fetch(`${baseUrl}/api/cron/discover-games`, {
        headers: internalHeaders,
      })
      results.discoverGames = await res.json()
      timings.discoverGames = Date.now() - taskStart
      console.log(`[MASTER CRON] discover-games completed in ${timings.discoverGames}ms`)
    } catch (e) {
      results.discoverGames = { error: String(e) }
      console.error('[MASTER CRON] discover-games FAILED:', e)
    }
  }

  // Run at 0, 6, 12, 18 UTC (30 min offset simulated): backfill-images
  if (currentHour % 6 === 0) {
    console.log('[MASTER CRON] Running backfill-images (6-hour task)...')
    taskStart = Date.now()
    try {
      const res = await fetch(`${baseUrl}/api/cron/backfill-images`, {
        headers: internalHeaders,
      })
      results.backfillImages = await res.json()
      timings.backfillImages = Date.now() - taskStart
      console.log(`[MASTER CRON] backfill-images completed in ${timings.backfillImages}ms`)
    } catch (e) {
      results.backfillImages = { error: String(e) }
      console.error('[MASTER CRON] backfill-images FAILED:', e)
    }

    // Run fetch-videos at same 6-hour intervals
    console.log('[MASTER CRON] Running fetch-videos (6-hour task)...')
    taskStart = Date.now()
    try {
      const res = await fetch(`${baseUrl}/api/cron/fetch-videos`, {
        headers: internalHeaders,
      })
      results.fetchVideos = await res.json()
      timings.fetchVideos = Date.now() - taskStart
      console.log(`[MASTER CRON] fetch-videos completed in ${timings.fetchVideos}ms:`, JSON.stringify(results.fetchVideos).slice(0, 200))
    } catch (e) {
      results.fetchVideos = { error: String(e) }
      console.error('[MASTER CRON] fetch-videos FAILED:', e)
    }
  }

  // Run at 4 UTC: cleanup-content
  if (currentHour === 4) {
    console.log('[MASTER CRON] Running cleanup-content (daily task)...')
    taskStart = Date.now()
    try {
      const res = await fetch(`${baseUrl}/api/cron/cleanup-content`, {
        headers: internalHeaders,
      })
      results.cleanupContent = await res.json()
      timings.cleanupContent = Date.now() - taskStart
      console.log(`[MASTER CRON] cleanup-content completed in ${timings.cleanupContent}ms`)
    } catch (e) {
      results.cleanupContent = { error: String(e) }
      console.error('[MASTER CRON] cleanup-content FAILED:', e)
    }
  }

  // Run at 3 UTC: sync-libraries (daily sync of Steam/Xbox libraries)
  if (currentHour === 3) {
    console.log('[MASTER CRON] Running sync-libraries (daily task)...')
    taskStart = Date.now()
    try {
      const res = await fetch(`${baseUrl}/api/cron/sync-libraries`, {
        headers: internalHeaders,
      })
      results.syncLibraries = await res.json()
      timings.syncLibraries = Date.now() - taskStart
      console.log(`[MASTER CRON] sync-libraries completed in ${timings.syncLibraries}ms:`, JSON.stringify(results.syncLibraries).slice(0, 200))
    } catch (e) {
      results.syncLibraries = { error: String(e) }
      console.error('[MASTER CRON] sync-libraries FAILED:', e)
    }
  }

  const totalTime = Date.now() - startTime
  console.log(`[MASTER CRON] ========== Completed in ${totalTime}ms ==========`)
  console.log('[MASTER CRON] Results summary:', JSON.stringify({ timings, tasksRun: Object.keys(results) }))

  return NextResponse.json({
    ok: true,
    currentHour,
    totalTimeMs: totalTime,
    timings,
    ...results,
  })
}
