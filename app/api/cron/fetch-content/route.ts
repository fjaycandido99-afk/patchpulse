import { NextResponse } from 'next/server'
import { fetchAllSteamPatches } from '@/lib/fetchers/steam-patches'
import { fetchAllBattlenetPatches } from '@/lib/fetchers/battlenet-patches'
import { fetchAllEpicPatches } from '@/lib/fetchers/epic-patches'
import { fetchAllRiotPatches } from '@/lib/fetchers/riot-patches'
import { fetchAllRedditPatches } from '@/lib/fetchers/reddit-patches'
import { fetchAllGamingNews } from '@/lib/fetchers/gaming-news'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

function verifyAuth(req: Request): boolean {
  const vercelCron = req.headers.get('x-vercel-cron')
  const cronSecret = req.headers.get('x-cron-secret')
  const authHeader = req.headers.get('authorization')

  // Debug logging
  console.log('[fetch-content] Auth check:', {
    hasVercelCron: vercelCron === '1',
    hasCronSecret: !!cronSecret,
    hasAuthHeader: !!authHeader,
  })

  // Vercel cron
  if (vercelCron === '1') return true
  // Manual call with CRON_SECRET
  if (process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) return true
  // Manual call with INTERNAL_API_SECRET
  const token = authHeader?.replace('Bearer ', '')
  if (process.env.INTERNAL_API_SECRET && token === process.env.INTERNAL_API_SECRET) return true
  return false
}

type PatchResult = {
  success: boolean
  totalAdded: number
  gamesChecked?: number
  error: string | null
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    patches: {
      steam: { success: false, totalAdded: 0, error: null } as PatchResult,
      battlenet: { success: false, totalAdded: 0, error: null } as PatchResult,
      epic: { success: false, totalAdded: 0, error: null } as PatchResult,
      riot: { success: false, totalAdded: 0, error: null } as PatchResult,
      reddit: { success: false, totalAdded: 0, error: null } as PatchResult,
    },
    news: { success: false, totalAdded: 0, error: null as string | null },
  }

  // Fetch Steam patches
  try {
    const patchResult = await fetchAllSteamPatches()
    results.patches.steam = {
      success: patchResult.success,
      totalAdded: patchResult.totalAdded || 0,
      gamesChecked: patchResult.gamesChecked,
      error: patchResult.errors?.join(', ') || null,
    }
  } catch (error) {
    results.patches.steam.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Fetch Battle.net patches
  try {
    const patchResult = await fetchAllBattlenetPatches()
    results.patches.battlenet = {
      success: patchResult.success,
      totalAdded: patchResult.totalAdded || 0,
      gamesChecked: patchResult.gamesChecked,
      error: patchResult.errors?.join(', ') || null,
    }
  } catch (error) {
    results.patches.battlenet.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Fetch Epic Games patches
  try {
    const patchResult = await fetchAllEpicPatches()
    results.patches.epic = {
      success: patchResult.success,
      totalAdded: patchResult.totalAdded || 0,
      gamesChecked: patchResult.gamesChecked,
      error: patchResult.errors?.join(', ') || null,
    }
  } catch (error) {
    results.patches.epic.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Fetch Riot Games patches
  try {
    const patchResult = await fetchAllRiotPatches()
    results.patches.riot = {
      success: patchResult.success,
      totalAdded: patchResult.totalAdded || 0,
      gamesChecked: patchResult.gamesChecked,
      error: patchResult.errors?.join(', ') || null,
    }
  } catch (error) {
    results.patches.riot.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Fetch Reddit patches
  try {
    const patchResult = await fetchAllRedditPatches()
    results.patches.reddit = {
      success: patchResult.success,
      totalAdded: patchResult.totalAdded || 0,
      gamesChecked: patchResult.gamesChecked,
      error: patchResult.errors?.join(', ') || null,
    }
  } catch (error) {
    results.patches.reddit.error = error instanceof Error ? error.message : 'Unknown error'
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

  // Calculate totals
  const totalPatchesAdded = Object.values(results.patches).reduce(
    (sum, source) => sum + source.totalAdded,
    0
  )

  return NextResponse.json({
    ok: true,
    patches: {
      ...results.patches,
      totalAdded: totalPatchesAdded,
    },
    news: results.news,
    totalAdded: totalPatchesAdded + results.news.totalAdded,
  })
}
