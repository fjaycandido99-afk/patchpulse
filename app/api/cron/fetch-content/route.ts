import { NextResponse } from 'next/server'
import { fetchAllSteamPatches } from '@/lib/fetchers/steam-patches'
import { fetchAllBattlenetPatches } from '@/lib/fetchers/battlenet-patches'
import { fetchAllEpicPatches } from '@/lib/fetchers/epic-patches'
import { fetchAllRiotPatches } from '@/lib/fetchers/riot-patches'
import { fetchAllRedditPatches } from '@/lib/fetchers/reddit-patches'
import { fetchAllExternalPatches } from '@/lib/fetchers/patch-sources'
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
  console.log('[CRON] fetch-content hit at', new Date().toISOString())

  if (!verifyCronAuth(req)) {
    console.log('[CRON] fetch-content UNAUTHORIZED')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[CRON] fetch-content AUTHORIZED - starting parallel fetch')

  // Run ALL fetchers in parallel for speed
  const [steamResult, battlenetResult, epicResult, riotResult, redditResult, externalResult] = await Promise.allSettled([
    fetchAllSteamPatches(),
    fetchAllBattlenetPatches(),
    fetchAllEpicPatches(),
    fetchAllRiotPatches(),
    fetchAllRedditPatches(),
    fetchAllExternalPatches(),
  ])

  // Helper to extract result or error
  const extractResult = (result: PromiseSettledResult<any>, name: string): PatchResult => {
    if (result.status === 'fulfilled') {
      return {
        success: result.value.success,
        totalAdded: result.value.totalAdded || 0,
        gamesChecked: result.value.gamesChecked || result.value.sourcesChecked,
        error: result.value.errors?.join(', ') || null,
      }
    } else {
      console.error(`[CRON] ${name} failed:`, result.reason)
      return {
        success: false,
        totalAdded: 0,
        error: result.reason?.message || 'Unknown error',
      }
    }
  }

  const results = {
    patches: {
      steam: extractResult(steamResult, 'steam'),
      battlenet: extractResult(battlenetResult, 'battlenet'),
      epic: extractResult(epicResult, 'epic'),
      riot: extractResult(riotResult, 'riot'),
      reddit: extractResult(redditResult, 'reddit'),
      external: extractResult(externalResult, 'external'),
    },
  }

  // Calculate totals
  const totalPatchesAdded = Object.values(results.patches).reduce(
    (sum, source) => sum + source.totalAdded,
    0
  )

  console.log('[CRON] fetch-content complete, added:', totalPatchesAdded)

  return NextResponse.json({
    ok: true,
    patches: {
      ...results.patches,
      totalAdded: totalPatchesAdded,
    },
    totalAdded: totalPatchesAdded,
  })
}
