import { NextResponse } from 'next/server'
import { fetchAllSteamPatches } from '@/lib/fetchers/steam-patches'
import { fetchAllBattlenetPatches } from '@/lib/fetchers/battlenet-patches'
import { fetchAllEpicPatches } from '@/lib/fetchers/epic-patches'
import { fetchAllRiotPatches } from '@/lib/fetchers/riot-patches'
import { fetchAllRedditPatches } from '@/lib/fetchers/reddit-patches'
import { fetchAllGamingNews } from '@/lib/fetchers/gaming-news'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

type PatchResult = {
  success: boolean
  totalAdded: number
  gamesChecked?: number
  error: string | null
}

export async function GET(req: Request) {
  // Debug logging - remove after confirming crons work
  console.log('[CRON] fetch-content hit at', new Date().toISOString())
  console.log('[CRON] x-vercel-cron header:', req.headers.get('x-vercel-cron'))
  console.log('[CRON] authorization header exists:', !!req.headers.get('authorization'))

  if (!verifyCronAuth(req)) {
    console.log('[CRON] fetch-content UNAUTHORIZED')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[CRON] fetch-content AUTHORIZED - starting fetch')

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
