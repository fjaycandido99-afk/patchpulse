import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

type SteamSpecial = {
  id: number
  name: string
  discounted: boolean
  discount_percent: number
  original_price: number
  final_price: number
  large_capsule_image: string
  header_image: string
  discount_expiration?: number
}

type SteamFeaturedCategories = {
  specials: {
    items: SteamSpecial[]
  }
}

function verifyAuth(req: Request): boolean {
  const url = new URL(req.url)
  const vercelCron = req.headers.get('x-vercel-cron')
  const cronSecret = req.headers.get('x-cron-secret')?.trim()
  const cronSecretEnv = process.env.CRON_SECRET?.trim()
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  // Query param fallback for testing
  const querySecret = url.searchParams.get('secret')?.trim()

  if (vercelCron === '1') return true
  if (cronSecretEnv && cronSecret === cronSecretEnv) return true
  if (cronSecretEnv && token === cronSecretEnv) return true
  if (cronSecretEnv && querySecret === cronSecretEnv) return true
  return false
}

export async function GET(req: Request) {
  console.log('[CRON] fetch-deals hit at', new Date().toISOString())

  // Debug info
  const debugInfo = {
    vercelCron: req.headers.get('x-vercel-cron'),
    hasCronSecret: !!req.headers.get('x-cron-secret'),
    hasEnvSecret: !!process.env.CRON_SECRET,
    hasAuthHeader: !!req.headers.get('authorization'),
  }

  if (!verifyAuth(req)) {
    console.log('[CRON] fetch-deals UNAUTHORIZED', debugInfo)
    return NextResponse.json({ ok: false, error: 'Unauthorized', debug: debugInfo }, { status: 401 })
  }

  // Use service role client for insert/update/delete
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Fetch deals from Steam
    const response = await fetch(
      'https://store.steampowered.com/api/featuredcategories/?cc=us&l=en',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`)
    }

    const data: SteamFeaturedCategories = await response.json()
    const steamDeals = data.specials?.items || []

    console.log(`[CRON] Fetched ${steamDeals.length} deals from Steam`)

    // Transform deals for database
    const deals = steamDeals
      .filter(item => item.discounted && item.discount_percent >= 20)
      .map(item => ({
        id: item.id.toString(),
        title: item.name,
        sale_price: item.final_price / 100,
        normal_price: item.original_price / 100,
        discount_percent: item.discount_percent,
        thumb_url: item.large_capsule_image,
        header_url: item.header_image,
        deal_url: `https://store.steampowered.com/app/${item.id}`,
        expires_at: item.discount_expiration
          ? new Date(item.discount_expiration * 1000).toISOString()
          : null,
      }))

    // Get current deal IDs from Steam
    const currentDealIds = deals.map(d => d.id)

    // Upsert deals
    if (deals.length > 0) {
      const { error: upsertError } = await supabase
        .from('deals')
        .upsert(deals, { onConflict: 'id' })

      if (upsertError) {
        console.error('[CRON] Upsert error:', upsertError)
        throw upsertError
      }
    }

    // Delete deals that are no longer on sale (not in Steam's response)
    const { data: existingDeals } = await supabase
      .from('deals')
      .select('id')

    const existingIds = existingDeals?.map(d => d.id) || []
    const idsToDelete = existingIds.filter(id => !currentDealIds.includes(id))

    let deletedCount = 0
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        console.error('[CRON] Delete error:', deleteError)
      } else {
        deletedCount = idsToDelete.length
      }
    }

    // Also delete any expired deals (safety cleanup)
    const { error: expiredError } = await supabase
      .from('deals')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (expiredError) {
      console.error('[CRON] Expired cleanup error:', expiredError)
    }

    console.log(`[CRON] Upserted ${deals.length} deals, deleted ${deletedCount} ended deals`)

    return NextResponse.json({
      ok: true,
      fetched: steamDeals.length,
      upserted: deals.length,
      deleted: deletedCount,
    })
  } catch (error) {
    console.error('[CRON] fetch-deals error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
