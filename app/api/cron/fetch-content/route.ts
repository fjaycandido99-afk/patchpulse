import { NextResponse } from 'next/server'
import { fetchAllSteamPatches } from '@/lib/fetchers/steam-patches'
import { fetchAllGamingNews } from '@/lib/fetchers/gaming-news'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

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

  const results = {
    patches: { success: false, totalAdded: 0, error: null as string | null },
    news: { success: false, totalAdded: 0, error: null as string | null },
  }

  // Fetch Steam patches
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

  // Fetch gaming news
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
    patches: results.patches,
    news: results.news,
    totalAdded: results.patches.totalAdded + results.news.totalAdded,
  })
}
