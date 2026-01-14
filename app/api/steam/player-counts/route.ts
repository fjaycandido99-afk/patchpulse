import { NextResponse } from 'next/server'
import { getSteamPlayerCounts, formatPlayerCount } from '@/lib/fetchers/steam-stats'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: Request) {
  // Rate limit: 30 requests per minute (calls external Steam API)
  const rateLimit = checkRateLimit(request, RATE_LIMITS.standard)
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit)
  }

  const { searchParams } = new URL(request.url)
  const appIdsParam = searchParams.get('appIds')

  if (!appIdsParam) {
    return NextResponse.json({ error: 'appIds parameter required' }, { status: 400 })
  }

  const appIds = appIdsParam
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id))

  if (appIds.length === 0) {
    return NextResponse.json({ error: 'No valid appIds provided' }, { status: 400 })
  }

  // Limit to 20 games at a time to avoid rate limiting
  const limitedAppIds = appIds.slice(0, 20)

  try {
    const counts = await getSteamPlayerCounts(limitedAppIds)

    // Convert Map to object for JSON response
    const result: Record<string, { count: number; formatted: string }> = {}
    for (const [appId, count] of counts) {
      result[appId.toString()] = {
        count,
        formatted: formatPlayerCount(count),
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error fetching player counts:', error)
    return NextResponse.json({ error: 'Failed to fetch player counts' }, { status: 500 })
  }
}
