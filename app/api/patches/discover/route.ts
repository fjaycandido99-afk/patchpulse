import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Patch = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  impact_score: number
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
}

type DiscoverPatchesStats = {
  total_today: number
  high_impact_count: number
}

// GET /api/patches/discover - Fetch patches from games the user does NOT follow
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const statsOnly = searchParams.get('stats') === 'true'

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's followed game IDs
  let followedGameIds: string[] = []
  if (user) {
    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', user.id)
    followedGameIds = (userGames || []).map(ug => ug.game_id)
  }

  // Get today's start timestamp
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  if (statsOnly) {
    // Just return stats for unfollowed games
    let totalTodayQuery = supabase
      .from('patch_notes')
      .select('id', { count: 'exact', head: true })
      .gte('published_at', todayIso)

    let highImpactQuery = supabase
      .from('patch_notes')
      .select('id', { count: 'exact', head: true })
      .gte('published_at', todayIso)
      .gte('impact_score', 8)

    // Exclude followed games if user has any
    if (followedGameIds.length > 0) {
      totalTodayQuery = totalTodayQuery.not('game_id', 'in', `(${followedGameIds.join(',')})`)
      highImpactQuery = highImpactQuery.not('game_id', 'in', `(${followedGameIds.join(',')})`)
    }

    const [{ count: totalToday }, { count: highImpactCount }] = await Promise.all([
      totalTodayQuery,
      highImpactQuery,
    ])

    return NextResponse.json({
      total_today: totalToday || 0,
      high_impact_count: highImpactCount || 0,
    } satisfies DiscoverPatchesStats)
  }

  // Fetch patches from unfollowed games
  let query = supabase
    .from('patch_notes')
    .select(`
      id,
      title,
      published_at,
      summary_tldr,
      impact_score,
      games!inner(
        id,
        name,
        slug,
        cover_url
      )
    `)
    .order('published_at', { ascending: false })
    .limit(limit)

  // Exclude followed games if user has any
  if (followedGameIds.length > 0) {
    query = query.not('game_id', 'in', `(${followedGameIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching discover patches:', error)
    return NextResponse.json({ patches: [], stats: { total_today: 0, high_impact_count: 0 } })
  }

  const patches: Patch[] = (data || []).map((patch) => {
    const gameData = patch.games as unknown as {
      id: string
      name: string
      slug: string
      cover_url: string | null
    }
    return {
      id: patch.id,
      title: patch.title,
      published_at: patch.published_at,
      summary_tldr: patch.summary_tldr,
      impact_score: patch.impact_score,
      game: gameData,
    }
  })

  // Get stats for today (unfollowed games only)
  let totalTodayQuery = supabase
    .from('patch_notes')
    .select('id', { count: 'exact', head: true })
    .gte('published_at', todayIso)

  let highImpactQuery = supabase
    .from('patch_notes')
    .select('id', { count: 'exact', head: true })
    .gte('published_at', todayIso)
    .gte('impact_score', 8)

  if (followedGameIds.length > 0) {
    totalTodayQuery = totalTodayQuery.not('game_id', 'in', `(${followedGameIds.join(',')})`)
    highImpactQuery = highImpactQuery.not('game_id', 'in', `(${followedGameIds.join(',')})`)
  }

  const [{ count: totalToday }, { count: highImpactCount }] = await Promise.all([
    totalTodayQuery,
    highImpactQuery,
  ])

  return NextResponse.json({
    patches,
    stats: {
      total_today: totalToday || 0,
      high_impact_count: highImpactCount || 0,
    } satisfies DiscoverPatchesStats,
  })
}
