import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'

type DbDeal = {
  id: string
  title: string
  sale_price: number
  normal_price: number
  discount_percent: number
  thumb_url: string | null
  header_url: string | null
  deal_url: string
  expires_at: string | null
  steam_app_id: string | null
  store: string | null
  metacritic_score: number | null
  deal_rating: number | null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const minDiscount = parseInt(searchParams.get('minDiscount') || '20')
    const category = searchParams.get('category') || 'all' // all, bestseller, indie, aaa, free

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user's followed games if logged in (to prioritize their games)
    let userGameNames: string[] = []
    let userSteamAppIds: string[] = []
    let bookmarkedDealIds: Set<string> = new Set()
    let isPro = false

    if (user) {
      const [followedResult, bookmarksResult, plan] = await Promise.all([
        supabase
          .from('backlog_items')
          .select('games(name, steam_app_id)')
          .eq('user_id', user.id)
          .limit(100),
        supabase
          .from('bookmarks')
          .select('entity_id')
          .eq('user_id', user.id)
          .eq('entity_type', 'deal'),
        getUserPlan(user.id),
      ])

      isPro = plan === 'pro'

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

    // Fetch deals from database (populated by cron job)
    let query = supabase
      .from('deals')
      .select('*')
      .gte('discount_percent', minDiscount)

    // Apply category filters
    if (category === 'free') {
      query = query.eq('sale_price', 0)
    } else if (category === 'bestseller') {
      // Best sellers: high metacritic or deal rating
      query = query.or('metacritic_score.gte.75,deal_rating.gte.8')
    } else if (category === 'indie') {
      // Indie games: normal price under $30
      query = query.lt('normal_price', 30)
    } else if (category === 'aaa') {
      // AAA games: normal price $40 or more
      query = query.gte('normal_price', 40)
    }

    // Order by: free first, then by discount
    const { data: dbDeals, error } = await query
      .order('discount_percent', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database deals error:', error)
      throw error
    }

    if (!dbDeals || dbDeals.length === 0) {
      return NextResponse.json({
        deals: [],
        total: 0,
        source: 'Steam',
        isPro,
      })
    }

    // Transform deals for frontend
    const deals = (dbDeals as DbDeal[]).map(item => {
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

    return NextResponse.json({
      deals,
      total: deals.length,
      source: 'Steam',
      isPro,
    })
  } catch (error) {
    console.error('Deals API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals', deals: [], total: 0 },
      { status: 500 }
    )
  }
}
