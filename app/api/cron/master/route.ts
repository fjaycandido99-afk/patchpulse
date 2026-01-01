import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

function verifyAuth(req: Request): boolean {
  if (req.headers.get('x-vercel-cron') === '1') return true
  const cronSecret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) return true
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (process.env.INTERNAL_API_SECRET && token === process.env.INTERNAL_API_SECRET) return true
  return false
}

// Master cron that runs all tasks
// Runs every 15 minutes - handles frequent tasks
// Daily tasks only run at specific hours
export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Use CRON_SECRET for internal calls (x-vercel-cron only works for direct Vercel calls)
  const internalHeaders = {
    'x-cron-secret': process.env.CRON_SECRET || '',
  }

  const results: Record<string, unknown> = {}
  const currentHour = new Date().getUTCHours()

  // Always run: fetch-content (every 15 min)
  try {
    const res = await fetch(`${baseUrl}/api/cron/fetch-content`, {
      headers: internalHeaders,
    })
    results.fetchContent = await res.json()
  } catch (e) {
    results.fetchContent = { error: String(e) }
  }

  // Always run: process-ai-jobs (every 15 min)
  try {
    const res = await fetch(`${baseUrl}/api/cron/process-ai-jobs`, {
      headers: internalHeaders,
    })
    results.processAiJobs = await res.json()
  } catch (e) {
    results.processAiJobs = { error: String(e) }
  }

  // Always run: fetch-deals (every 15 min - keeps deals fresh)
  try {
    const res = await fetch(`${baseUrl}/api/cron/fetch-deals`, {
      headers: internalHeaders,
    })
    results.fetchDeals = await res.json()
  } catch (e) {
    results.fetchDeals = { error: String(e) }
  }

  // Run at 0, 6, 12, 18 UTC: discover-games
  if (currentHour % 6 === 0) {
    try {
      const res = await fetch(`${baseUrl}/api/cron/discover-games`, {
        headers: internalHeaders,
      })
      results.discoverGames = await res.json()
    } catch (e) {
      results.discoverGames = { error: String(e) }
    }
  }

  // Run at 0, 6, 12, 18 UTC (30 min offset simulated): backfill-images
  if (currentHour % 6 === 0) {
    try {
      const res = await fetch(`${baseUrl}/api/cron/backfill-images`, {
        headers: internalHeaders,
      })
      results.backfillImages = await res.json()
    } catch (e) {
      results.backfillImages = { error: String(e) }
    }
  }

  // Run at 4 UTC: cleanup-content
  if (currentHour === 4) {
    try {
      const res = await fetch(`${baseUrl}/api/cron/cleanup-content`, {
        headers: internalHeaders,
      })
      results.cleanupContent = await res.json()
    } catch (e) {
      results.cleanupContent = { error: String(e) }
    }
  }

  return NextResponse.json({
    ok: true,
    currentHour,
    ...results,
  })
}
