import { createClient } from '@/lib/supabase/server'

export type Deal = {
  id: string
  title: string
  salePrice: number
  normalPrice: number
  savings: number
  store: string
  storeIcon: string | null
  steamAppId: string | null
  thumb: string
  dealUrl: string
  isUserGame: boolean
  expiresIn: string | null
  isBookmarked: boolean
}

export async function getDeals(userId?: string, minDiscount = 20): Promise<{ deals: Deal[]; isPro: boolean }> {
  const supabase = await createClient()

  // Get user's followed games if logged in (to prioritize their games)
  let userGameNames: string[] = []
  let userSteamAppIds: string[] = []
  let bookmarkedDealIds: Set<string> = new Set()

  if (userId) {
    const [followedResult, bookmarksResult] = await Promise.all([
      supabase
        .from('backlog_items')
        .select('games(name, steam_app_id)')
        .eq('user_id', userId)
        .limit(100),
      supabase
        .from('bookmarks')
        .select('entity_id')
        .eq('user_id', userId)
        .eq('entity_type', 'deal'),
    ])

    type GameInfo = { name: string; steam_app_id: string | null }
    followedResult.data?.forEach(f => {
      const game = f.games as unknown as GameInfo
      if (game?.name) userGameNames.push(game.name.toLowerCase())
      if (game?.steam_app_id) userSteamAppIds.push(game.steam_app_id)
    })

    bookmarksResult.data?.forEach(b => {
      bookmarkedDealIds.add(b.entity_id)
    })
  }

  // Fetch deals from database
  const { data: dbDeals, error } = await supabase
    .from('deals')
    .select('*')
    .gte('discount_percent', minDiscount)
    .order('discount_percent', { ascending: false })
    .limit(100)

  if (error || !dbDeals || dbDeals.length === 0) {
    return { deals: [], isPro: true }
  }

  // Transform deals for frontend
  const deals = dbDeals.map(item => {
    // Check if user owns/follows this game
    const isUserGame = userSteamAppIds.includes(item.id) ||
      userGameNames.some(name =>
        item.title.toLowerCase().includes(name) ||
        name.includes(item.title.toLowerCase())
      )

    // Calculate expiration
    let expiresIn: string | null = null
    if (item.expires_at) {
      const expirationDate = new Date(item.expires_at)
      const now = new Date()
      const hoursLeft = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      if (hoursLeft > 0) {
        if (hoursLeft < 24) {
          expiresIn = `${hoursLeft}h left`
        } else {
          const daysLeft = Math.floor(hoursLeft / 24)
          expiresIn = `${daysLeft}d left`
        }
      }
    }

    return {
      id: item.id,
      title: item.title,
      salePrice: item.sale_price,
      normalPrice: item.normal_price,
      savings: item.discount_percent,
      store: item.store || 'Steam',
      storeIcon: null,
      steamAppId: item.steam_app_id || null,
      thumb: item.header_url || item.thumb_url || '',
      dealUrl: item.deal_url,
      isUserGame,
      expiresIn,
      isBookmarked: bookmarkedDealIds.has(item.id),
    }
  })
  // Sort: user games first, then by discount
  .sort((a, b) => {
    if (a.isUserGame && !b.isUserGame) return -1
    if (!a.isUserGame && b.isUserGame) return 1
    return b.savings - a.savings
  })

  return { deals, isPro: true }
}
