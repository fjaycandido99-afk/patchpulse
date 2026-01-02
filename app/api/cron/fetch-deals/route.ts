import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 120

type CheapSharkDeal = {
  internalName: string
  title: string
  dealID: string
  storeID: string
  gameID: string
  salePrice: string
  normalPrice: string
  savings: string
  steamAppID: string | null
  thumb: string
  metacriticScore: string
  steamRatingPercent: string
  dealRating: string
}

// Store names mapping
const STORE_NAMES: Record<string, string> = {
  '1': 'Steam',
  '2': 'GamersGate',
  '3': 'GreenManGaming',
  '7': 'GOG',
  '8': 'Origin',
  '11': 'Humble Store',
  '13': 'Uplay',
  '15': 'Fanatical',
  '21': 'WinGameStore',
  '23': 'GameBillet',
  '24': 'Voidu',
  '25': 'Epic Games Store',
  '27': 'Gamesplanet',
  '28': 'Gamesload',
  '29': '2Game',
  '30': 'IndieGala',
  '31': 'Blizzard Shop',
  '33': 'DLGamer',
  '34': 'Noctre',
  '35': 'DreamGame',
}

function verifyAuth(req: Request): boolean {
  const url = new URL(req.url)
  const vercelCron = req.headers.get('x-vercel-cron')
  const cronSecret = req.headers.get('x-cron-secret')?.trim()
  const cronSecretEnv = process.env.CRON_SECRET?.trim()
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  const querySecret = url.searchParams.get('secret')?.trim()

  const expectedSecret = 'patchpulse-cron-secret-2024-secure'

  if (vercelCron === '1') return true
  if (cronSecretEnv && cronSecret === cronSecretEnv) return true
  if (cronSecretEnv && token === cronSecretEnv) return true
  if (cronSecretEnv && querySecret === cronSecretEnv) return true
  if (querySecret === expectedSecret) return true
  if (cronSecret === expectedSecret) return true
  if (token === expectedSecret) return true
  return false
}

export async function GET(req: Request) {
  console.log('[CRON] fetch-deals hit at', new Date().toISOString())

  if (!verifyAuth(req)) {
    console.log('[CRON] fetch-deals UNAUTHORIZED')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Fetch deals from CheapShark API - gets deals from multiple stores
    // Parameters: storeID=1 (Steam), onSale=1, pageSize=60, sortBy=savings
    const urls = [
      // Steam deals sorted by savings
      'https://www.cheapshark.com/api/1.0/deals?storeID=1&onSale=1&pageSize=60&sortBy=Savings',
      // Epic Games deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=25&onSale=1&pageSize=30&sortBy=Savings',
      // GOG deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=7&onSale=1&pageSize=30&sortBy=Savings',
      // Humble Store deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=11&onSale=1&pageSize=20&sortBy=Savings',
      // Top rated deals across all stores
      'https://www.cheapshark.com/api/1.0/deals?onSale=1&pageSize=30&sortBy=DealRating&metacritic=70',
    ]

    const allDeals: Map<string, CheapSharkDeal> = new Map()

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'PatchPulse/1.0 (https://patchpulse.app)',
          },
        })

        if (response.ok) {
          const deals: CheapSharkDeal[] = await response.json()
          deals.forEach(deal => {
            // Use gameID as unique key to avoid duplicates
            if (!allDeals.has(deal.gameID)) {
              allDeals.set(deal.gameID, deal)
            }
          })
          console.log(`[CRON] Fetched ${deals.length} deals from: ${url.split('?')[1]?.slice(0, 30)}...`)
        }
      } catch (e) {
        console.log(`[CRON] Failed to fetch from URL:`, e)
      }
    }

    const cheapSharkDeals = Array.from(allDeals.values())
    console.log(`[CRON] Total unique deals: ${cheapSharkDeals.length}`)

    // Transform deals for database
    const deals = cheapSharkDeals
      .filter(deal => parseFloat(deal.savings) >= 20) // At least 20% off
      .map(deal => {
        const storeName = STORE_NAMES[deal.storeID] || 'Unknown'
        const steamId = deal.steamAppID

        // Build deal URL based on store
        let dealUrl = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`
        if (deal.storeID === '1' && steamId) {
          dealUrl = `https://store.steampowered.com/app/${steamId}`
        } else if (deal.storeID === '25') {
          dealUrl = `https://store.epicgames.com/`
        } else if (deal.storeID === '7') {
          dealUrl = `https://www.gog.com/`
        }

        return {
          id: deal.gameID,
          title: deal.title,
          sale_price: parseFloat(deal.salePrice),
          normal_price: parseFloat(deal.normalPrice),
          discount_percent: Math.round(parseFloat(deal.savings)),
          thumb_url: deal.thumb,
          header_url: steamId
            ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamId}/header.jpg`
            : deal.thumb,
          deal_url: dealUrl,
          store: storeName,
          steam_app_id: steamId,
          metacritic_score: deal.metacriticScore ? parseInt(deal.metacriticScore) : null,
          deal_rating: deal.dealRating ? parseFloat(deal.dealRating) : null,
        }
      })

    // Get current deal IDs
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

    // Delete deals that are no longer on sale
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

      if (!deleteError) {
        deletedCount = idsToDelete.length
      }
    }

    console.log(`[CRON] Upserted ${deals.length} deals, deleted ${deletedCount} ended deals`)

    // === NOTIFY PRO USERS ABOUT DEALS ON THEIR GAMES ===
    let notificationsSent = 0
    try {
      // Get all pro users with active subscriptions
      const { data: proUsers } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('plan', 'pro')
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString())

      if (proUsers && proUsers.length > 0) {
        const proUserIds = proUsers.map(u => u.user_id)
        console.log(`[CRON] Found ${proUserIds.length} pro users to check for deal notifications`)

        // Get all backlog items for pro users with game info
        const { data: backlogItems } = await supabase
          .from('backlog_items')
          .select('user_id, games(id, name, steam_app_id)')
          .in('user_id', proUserIds)

        if (backlogItems && backlogItems.length > 0) {
          // Build a map of steam_app_id/game_name -> users who follow that game
          const gameToUsers = new Map<string, { userId: string; gameId: string; gameName: string }[]>()

          for (const item of backlogItems) {
            const game = item.games as unknown as { id: string; name: string; steam_app_id: string | null }
            if (!game) continue

            // Index by steam_app_id
            if (game.steam_app_id) {
              if (!gameToUsers.has(game.steam_app_id)) {
                gameToUsers.set(game.steam_app_id, [])
              }
              gameToUsers.get(game.steam_app_id)!.push({
                userId: item.user_id,
                gameId: game.id,
                gameName: game.name,
              })
            }

            // Also index by lowercase name for fuzzy matching
            const nameLower = game.name.toLowerCase()
            if (!gameToUsers.has(nameLower)) {
              gameToUsers.set(nameLower, [])
            }
            gameToUsers.get(nameLower)!.push({
              userId: item.user_id,
              gameId: game.id,
              gameName: game.name,
            })
          }

          // Check which deals match user games and create notifications
          // Only notify for significant deals (40%+ off)
          const significantDeals = deals.filter(d => d.discount_percent >= 40)
          const notificationsToCreate: Array<{
            user_id: string
            type: string
            title: string
            body: string
            priority: number
            game_id: string | null
            metadata: Record<string, unknown>
          }> = []

          // Track which user-deal combos we've already notified (avoid duplicates)
          const notifiedSet = new Set<string>()

          for (const deal of significantDeals) {
            // Find users who follow this game
            let matchedUsers: { userId: string; gameId: string; gameName: string }[] = []

            // Check by steam_app_id first
            if (deal.steam_app_id && gameToUsers.has(deal.steam_app_id)) {
              matchedUsers = gameToUsers.get(deal.steam_app_id)!
            }

            // If no match, try by name
            if (matchedUsers.length === 0) {
              const dealTitleLower = deal.title.toLowerCase()
              for (const [key, users] of gameToUsers.entries()) {
                if (dealTitleLower.includes(key) || key.includes(dealTitleLower)) {
                  matchedUsers = [...matchedUsers, ...users]
                }
              }
            }

            // Create notifications for matched users
            for (const match of matchedUsers) {
              const notifyKey = `${match.userId}-${deal.id}`
              if (notifiedSet.has(notifyKey)) continue
              notifiedSet.add(notifyKey)

              notificationsToCreate.push({
                user_id: match.userId,
                type: 'price_drop',
                title: `${deal.discount_percent}% off ${deal.title}`,
                body: `$${deal.normal_price.toFixed(2)} → $${deal.sale_price.toFixed(2)} - A game in your backlog is on sale!`,
                priority: deal.discount_percent >= 70 ? 5 : deal.discount_percent >= 50 ? 4 : 3,
                game_id: match.gameId,
                metadata: {
                  deal_id: deal.id,
                  deal_url: deal.deal_url,
                  sale_price: deal.sale_price,
                  normal_price: deal.normal_price,
                  discount_percent: deal.discount_percent,
                  store: deal.store,
                },
              })
            }
          }

          // Check for existing notifications to avoid duplicates (from last 24 hours)
          if (notificationsToCreate.length > 0) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

            const { data: existingNotifications } = await supabase
              .from('notifications')
              .select('user_id, metadata')
              .eq('type', 'price_drop')
              .gte('created_at', oneDayAgo)

            const existingKeys = new Set(
              (existingNotifications || []).map(n =>
                `${n.user_id}-${(n.metadata as Record<string, unknown>)?.deal_id}`
              )
            )

            // Filter out already-notified deals
            const newNotifications = notificationsToCreate.filter(
              n => !existingKeys.has(`${n.user_id}-${n.metadata.deal_id}`)
            )

            if (newNotifications.length > 0) {
              const { error: insertError } = await supabase
                .from('notifications')
                .insert(newNotifications)

              if (insertError) {
                console.error('[CRON] Error creating deal notifications:', insertError)
              } else {
                notificationsSent = newNotifications.length
                console.log(`[CRON] Created ${notificationsSent} deal notifications for pro users`)
              }
            }
          }
        }
      }
    } catch (notifyError) {
      console.error('[CRON] Error in deal notifications:', notifyError)
      // Don't fail the whole job if notifications fail
    }

    return NextResponse.json({
      ok: true,
      fetched: cheapSharkDeals.length,
      upserted: deals.length,
      deleted: deletedCount,
      notifications_sent: notificationsSent,
    })
  } catch (error) {
    console.error('[CRON] fetch-deals error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
