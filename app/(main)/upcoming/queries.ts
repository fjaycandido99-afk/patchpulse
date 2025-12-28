import { createClient } from '@/lib/supabase/server'

export type UpcomingGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  hero_url: string | null
  release_date: string | null
  days_until: number | null
  genre: string | null
  is_live_service: boolean
  platforms: string[]
}

export type UpcomingData = {
  comingSoon: UpcomingGame[] // Next 30 days
  anticipated: UpcomingGame[] // Most followed/curated
  calendar: CalendarMonth[]
}

export type CalendarMonth = {
  month: string // "January 2025"
  games: UpcomingGame[]
}

export async function getUpcomingGames(options: {
  days?: 30 | 60 | 90 | 365
  limit?: number
} = {}): Promise<UpcomingData> {
  const { days = 365, limit = 100 } = options
  const supabase = await createClient()

  const today = new Date()
  const futureDate = new Date(today)
  futureDate.setDate(futureDate.getDate() + days)

  const todayStr = today.toISOString().split('T')[0]
  const futureStr = futureDate.toISOString().split('T')[0]

  // Get all upcoming games
  const { data } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, hero_url, release_date, genre, is_live_service, platforms')
    .gt('release_date', todayStr)
    .lte('release_date', futureStr)
    .order('release_date', { ascending: true })
    .limit(limit)

  const games: UpcomingGame[] = (data || []).map(game => {
    const releaseDate = game.release_date ? new Date(game.release_date) : null
    const daysUntil = releaseDate
      ? Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null
    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover_url: game.cover_url,
      hero_url: game.hero_url,
      release_date: game.release_date,
      days_until: daysUntil,
      genre: game.genre,
      is_live_service: game.is_live_service || false,
      platforms: game.platforms || [],
    }
  })

  // Coming Soon = next 30 days
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  const comingSoon = games.filter(g => {
    if (!g.release_date) return false
    const rd = new Date(g.release_date)
    return rd <= thirtyDaysFromNow
  })

  // Most Anticipated = games marked as mvp_eligible or with high interest
  // For now, just take first 10 as "anticipated" (can be enhanced later with follow counts)
  const anticipated = games.slice(0, 10)

  // Group by month for calendar view
  const calendar = groupByMonth(games)

  return {
    comingSoon,
    anticipated,
    calendar,
  }
}

function groupByMonth(games: UpcomingGame[]): CalendarMonth[] {
  const months = new Map<string, UpcomingGame[]>()

  for (const game of games) {
    if (!game.release_date) continue
    const date = new Date(game.release_date)
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    if (!months.has(monthKey)) {
      months.set(monthKey, [])
    }
    months.get(monthKey)!.push(game)
  }

  return Array.from(months.entries()).map(([month, games]) => ({
    month,
    games,
  }))
}

// Get count of upcoming games per time period
export async function getUpcomingCounts(): Promise<{
  next30: number
  next60: number
  next90: number
  thisYear: number
}> {
  const supabase = await createClient()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const get30 = new Date(today)
  get30.setDate(get30.getDate() + 30)
  const get60 = new Date(today)
  get60.setDate(get60.getDate() + 60)
  const get90 = new Date(today)
  get90.setDate(get90.getDate() + 90)
  const yearEnd = new Date(today.getFullYear(), 11, 31)

  const [{ count: count30 }, { count: count60 }, { count: count90 }, { count: countYear }] = await Promise.all([
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .gt('release_date', todayStr)
      .lte('release_date', get30.toISOString().split('T')[0]),
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .gt('release_date', todayStr)
      .lte('release_date', get60.toISOString().split('T')[0]),
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .gt('release_date', todayStr)
      .lte('release_date', get90.toISOString().split('T')[0]),
    supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .gt('release_date', todayStr)
      .lte('release_date', yearEnd.toISOString().split('T')[0]),
  ])

  return {
    next30: count30 || 0,
    next60: count60 || 0,
    next90: count90 || 0,
    thisYear: countYear || 0,
  }
}
