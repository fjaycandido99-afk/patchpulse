'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Normalize store names from Reddit titles to match our app's naming
const STORE_NAME_MAP: Record<string, string> = {
  'steam': 'Steam',
  'epic': 'Epic Games Store',
  'epic games': 'Epic Games Store',
  'epic games store': 'Epic Games Store',
  'egs': 'Epic Games Store',
  'gog': 'GOG',
  'gog.com': 'GOG',
  'humble': 'Humble Store',
  'humble bundle': 'Humble Store',
  'humble store': 'Humble Store',
  'fanatical': 'Fanatical',
  'gmg': 'GreenManGaming',
  'green man gaming': 'GreenManGaming',
  'greenmangaming': 'GreenManGaming',
  'gamebillet': 'GameBillet',
  'gamesplanet': 'Gamesplanet',
  'indiegala': 'IndieGala',
  'itch.io': 'itch.io',
  'itch': 'itch.io',
  'ubisoft': 'Ubisoft Store',
  'uplay': 'Ubisoft Store',
  'origin': 'Origin',
  'ea': 'EA App',
  'amazon': 'Amazon',
  'prime gaming': 'Prime Gaming',
  'microsoft': 'Microsoft Store',
  'xbox': 'Xbox Store',
  'playstation': 'PlayStation Store',
  'psn': 'PlayStation Store',
  'nintendo': 'Nintendo eShop',
  'eshop': 'Nintendo eShop',
  'battle.net': 'Blizzard Shop',
  'blizzard': 'Blizzard Shop',
  'gamersgate': 'GamersGate',
  'voidu': 'Voidu',
  'wingamestore': 'WinGameStore',
  '2game': '2Game',
  'dlgamer': 'DLGamer',
  'dreamgame': 'DreamGame',
  'nuuvem': 'Nuuvem',
  'allyouplay': 'AllYouPlay',
}

function normalizeStoreName(store: string): string {
  const lower = store.toLowerCase().trim()
  return STORE_NAME_MAP[lower] || store // Return original if no mapping
}

type RedditPost = {
  data: {
    id: string
    title: string
    selftext: string
    url: string
    permalink: string
    created_utc: number
    link_flair_text?: string
    score: number
    domain: string
  }
}

// Parse deal info from r/GameDeals titles
// Typical format: "[Steam] Game Name ($X.XX / 75% off)"
function parseDealTitle(title: string): {
  store: string | null
  gameName: string | null
  salePrice: number | null
  discountPercent: number | null
} {
  const result = {
    store: null as string | null,
    gameName: null as string | null,
    salePrice: null as number | null,
    discountPercent: null as number | null,
  }

  // Extract store from brackets [Store]
  const storeMatch = title.match(/\[([^\]]+)\]/)
  if (storeMatch) {
    result.store = storeMatch[1]
  }

  // Extract price ($X.XX or Free)
  const priceMatch = title.match(/\$(\d+\.?\d*)|Free/i)
  if (priceMatch) {
    if (priceMatch[0].toLowerCase() === 'free') {
      result.salePrice = 0
    } else {
      result.salePrice = parseFloat(priceMatch[1])
    }
  }

  // Extract discount percent
  const discountMatch = title.match(/(\d+)%\s*off/i)
  if (discountMatch) {
    result.discountPercent = parseInt(discountMatch[1])
  }

  // Extract game name (between store bracket and price info)
  const titleWithoutStore = title.replace(/\[[^\]]+\]\s*/, '')
  const gameNameMatch = titleWithoutStore.match(/^([^($]+)/)
  if (gameNameMatch) {
    result.gameName = gameNameMatch[1].trim()
  }

  return result
}

// Fetch deals from r/GameDeals
export async function fetchRedditDeals(): Promise<{
  success: boolean
  addedCount: number
  error?: string
}> {
  try {
    // Fetch hot posts from r/GameDeals
    const response = await fetch(
      'https://www.reddit.com/r/GameDeals/hot.json?limit=50',
      {
        headers: {
          'User-Agent': 'PatchPulse/1.0 (Gaming Deal Tracker)',
        },
      }
    )

    if (!response.ok) {
      return { success: false, addedCount: 0, error: `Reddit API returned ${response.status}` }
    }

    const data = await response.json()
    const posts: RedditPost[] = data?.data?.children || []
    const supabase = createAdminClient()
    let addedCount = 0

    for (const post of posts) {
      const { title, url, permalink, created_utc, link_flair_text, score, domain } = post.data

      // Skip low-score posts (likely not good deals)
      if (score < 50) continue

      // Skip expired deals
      if (link_flair_text?.toLowerCase().includes('expired')) continue

      // Parse deal info from title
      const dealInfo = parseDealTitle(title)

      // Skip if we can't parse essential info
      if (!dealInfo.gameName || !dealInfo.store) continue

      // Only include deals with significant discount (30%+) or free
      if (dealInfo.salePrice !== 0 && (!dealInfo.discountPercent || dealInfo.discountPercent < 30)) {
        continue
      }

      // Generate a unique ID based on the Reddit post
      const dealId = `reddit_${post.data.id}`

      // Check if deal already exists
      const { data: existing } = await supabase
        .from('deals')
        .select('id')
        .eq('id', dealId)
        .single()

      if (existing) continue

      // Determine the deal URL
      let dealUrl = url
      if (domain === 'self.GameDeals' || domain.includes('reddit')) {
        dealUrl = `https://www.reddit.com${permalink}`
      }

      // Normalize store name to match app's naming convention
      const storeName = normalizeStoreName(dealInfo.store)

      // Create deal entry
      const { error } = await supabase
        .from('deals')
        .upsert({
          id: dealId,
          title: dealInfo.gameName,
          sale_price: dealInfo.salePrice ?? 0,
          normal_price: dealInfo.salePrice && dealInfo.discountPercent
            ? dealInfo.salePrice / (1 - dealInfo.discountPercent / 100)
            : 0,
          discount_percent: dealInfo.discountPercent ?? (dealInfo.salePrice === 0 ? 100 : 0),
          thumb_url: null,
          header_url: null,
          deal_url: dealUrl,
          store: storeName,
          steam_app_id: null,
          metacritic_score: null,
          deal_rating: score / 100, // Normalize Reddit score
        }, { onConflict: 'id' })

      if (!error) {
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    return {
      success: false,
      addedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Fetch free games from Epic Games Store
export async function fetchEpicFreeGames(): Promise<{
  success: boolean
  addedCount: number
  error?: string
}> {
  try {
    // Epic Games free games API endpoint
    const response = await fetch(
      'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US',
      {
        headers: {
          'User-Agent': 'PatchPulse/1.0',
        },
      }
    )

    if (!response.ok) {
      return { success: false, addedCount: 0, error: `Epic API returned ${response.status}` }
    }

    const data = await response.json()
    const games = data?.data?.Catalog?.searchStore?.elements || []
    const supabase = createAdminClient()
    let addedCount = 0

    for (const game of games) {
      // Check if game is currently free
      const promotions = game.promotions?.promotionalOffers?.[0]?.promotionalOffers || []
      const isFree = promotions.some((promo: { discountSetting?: { discountPercentage?: number } }) =>
        promo.discountSetting?.discountPercentage === 0
      )

      if (!isFree) continue

      const dealId = `epic_free_${game.id}`
      const title = game.title || 'Unknown Game'

      // Check if deal already exists
      const { data: existing } = await supabase
        .from('deals')
        .select('id')
        .eq('id', dealId)
        .single()

      if (existing) continue

      // Get image URL
      const keyImage = game.keyImages?.find((img: { type: string }) =>
        img.type === 'OfferImageWide' || img.type === 'DieselStoreFrontWide'
      ) || game.keyImages?.[0]

      // Build Epic store URL
      const slug = game.catalogNs?.mappings?.[0]?.pageSlug || game.productSlug || game.urlSlug
      const dealUrl = slug
        ? `https://store.epicgames.com/en-US/p/${slug}`
        : 'https://store.epicgames.com/en-US/free-games'

      // Get original price
      const originalPrice = game.price?.totalPrice?.originalPrice || 0
      const normalPrice = originalPrice / 100 // Price is in cents

      const { error } = await supabase
        .from('deals')
        .upsert({
          id: dealId,
          title,
          sale_price: 0,
          normal_price: normalPrice,
          discount_percent: 100,
          thumb_url: keyImage?.url || null,
          header_url: keyImage?.url || null,
          deal_url: dealUrl,
          store: 'Epic Games Store',
          steam_app_id: null,
          metacritic_score: null,
          deal_rating: 10, // Free games are always great deals
        }, { onConflict: 'id' })

      if (!error) {
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    return {
      success: false,
      addedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
