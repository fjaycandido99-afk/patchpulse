import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCronAuth } from '@/lib/cron-auth'
import { fetchRedditDeals, fetchEpicFreeGames } from '@/lib/fetchers/reddit-deals'

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


export async function GET(req: Request) {
  console.log('[CRON] fetch-deals hit at', new Date().toISOString())

  if (!verifyCronAuth(req)) {
    console.log('[CRON] fetch-deals UNAUTHORIZED')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Fetch deals from CheapShark API - gets deals from multiple stores
    // Enhanced with more sources for better coverage
    const urls = [
      // Steam deals - multiple sorting options for variety
      'https://www.cheapshark.com/api/1.0/deals?storeID=1&onSale=1&pageSize=60&sortBy=Savings',
      'https://www.cheapshark.com/api/1.0/deals?storeID=1&onSale=1&pageSize=40&sortBy=Recent',
      'https://www.cheapshark.com/api/1.0/deals?storeID=1&onSale=1&pageSize=30&sortBy=DealRating',
      // Epic Games deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=25&onSale=1&pageSize=40&sortBy=Savings',
      'https://www.cheapshark.com/api/1.0/deals?storeID=25&onSale=1&pageSize=20&sortBy=Recent',
      // GOG deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=7&onSale=1&pageSize=40&sortBy=Savings',
      'https://www.cheapshark.com/api/1.0/deals?storeID=7&onSale=1&pageSize=20&sortBy=Recent',
      // Humble Store deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=11&onSale=1&pageSize=30&sortBy=Savings',
      // Fanatical deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=15&onSale=1&pageSize=30&sortBy=Savings',
      // GreenManGaming deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=3&onSale=1&pageSize=30&sortBy=Savings',
      // GameBillet deals
      'https://www.cheapshark.com/api/1.0/deals?storeID=23&onSale=1&pageSize=20&sortBy=Savings',
      // Top rated deals across all stores
      'https://www.cheapshark.com/api/1.0/deals?onSale=1&pageSize=40&sortBy=DealRating&metacritic=70',
      // Recent deals across all stores
      'https://www.cheapshark.com/api/1.0/deals?onSale=1&pageSize=40&sortBy=Recent',
      // Free games (100% off) - highly valued
      'https://www.cheapshark.com/api/1.0/deals?onSale=1&pageSize=30&upperPrice=0',
    ]

    const allDeals: Map<string, CheapSharkDeal> = new Map()

    // Fetch all URLs in parallel with timeout
    const fetchResults = await Promise.allSettled(
      urls.map(url =>
        Promise.race([
          fetch(url, {
            headers: { 'User-Agent': 'PatchPulse/1.0 (https://patchpulse.app)' },
          }).then(async res => {
            if (!res.ok) return []
            return res.json() as Promise<CheapSharkDeal[]>
          }),
          // 10 second timeout per request
          new Promise<CheapSharkDeal[]>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ])
      )
    )

    // Process results
    fetchResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const deals = result.value
        deals.forEach(deal => {
          const existing = allDeals.get(deal.gameID)
          if (!existing || parseFloat(deal.savings) > parseFloat(existing.savings)) {
            allDeals.set(deal.gameID, deal)
          }
        })
        console.log(`[CRON] Fetched ${deals.length} deals from source ${i + 1}`)
      }
    })

    const cheapSharkDeals = Array.from(allDeals.values())
    console.log(`[CRON] Total unique deals: ${cheapSharkDeals.length}`)

    // Transform deals for database
    const deals = cheapSharkDeals
      .filter(deal => {
        const savings = parseFloat(deal.savings)
        const salePrice = parseFloat(deal.salePrice)
        // At least 15% off, OR free games (always include)
        return savings >= 15 || salePrice === 0
      })
      .map(deal => {
        const storeName = STORE_NAMES[deal.storeID] || 'Unknown'
        const steamId = deal.steamAppID

        // Build deal URL based on store
        // Use CheapShark redirect for all stores - it redirects to the correct game page
        // Only use direct Steam URL when we have the app ID for better UX
        let dealUrl = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`
        if (deal.storeID === '1' && steamId) {
          // Direct Steam link for better experience
          dealUrl = `https://store.steampowered.com/app/${steamId}`
        }
        // For all other stores (Epic, GOG, Humble, Fanatical, etc.),
        // CheapShark redirect handles the correct game page

        return {
          id: deal.gameID,
          title: deal.title,
          sale_price: parseFloat(deal.salePrice),
          normal_price: parseFloat(deal.normalPrice),
          discount_percent: Math.round(parseFloat(deal.savings)),
          thumb_url: deal.thumb,
          header_url: steamId
            ? `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/header.jpg`
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

    // Delete CheapShark deals that are no longer on sale
    // Don't delete Reddit/Epic deals as they have different lifecycles
    const { data: existingDeals } = await supabase
      .from('deals')
      .select('id')

    const existingIds = existingDeals?.map(d => d.id) || []
    const idsToDelete = existingIds.filter(id =>
      !currentDealIds.includes(id) &&
      !id.startsWith('reddit_') &&
      !id.startsWith('epic_free_')
    )

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

    console.log(`[CRON] Upserted ${deals.length} CheapShark deals, deleted ${deletedCount} ended deals`)

    // === FETCH ADDITIONAL DEAL SOURCES ===
    let redditDealsCount = 0
    let epicFreeCount = 0

    // Fetch Reddit r/GameDeals
    try {
      const redditResult = await fetchRedditDeals()
      if (redditResult.success) {
        redditDealsCount = redditResult.addedCount
        console.log(`[CRON] Added ${redditDealsCount} deals from Reddit`)
      }
    } catch (e) {
      console.error('[CRON] Failed to fetch Reddit deals:', e)
    }

    // Fetch Epic Games free games
    try {
      const epicResult = await fetchEpicFreeGames()
      if (epicResult.success) {
        epicFreeCount = epicResult.addedCount
        console.log(`[CRON] Added ${epicFreeCount} Epic free games`)
      }
    } catch (e) {
      console.error('[CRON] Failed to fetch Epic free games:', e)
    }

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
      sources: {
        cheapshark: { fetched: cheapSharkDeals.length, upserted: deals.length },
        reddit: { added: redditDealsCount },
        epic_free: { added: epicFreeCount },
      },
      total_upserted: deals.length + redditDealsCount + epicFreeCount,
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
