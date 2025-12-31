import { createClient } from '@/lib/supabase/server'

export type LatestPatchesStats = {
  total_today: number
  high_impact_count: number
}

// Returns stats for patches from games the user does NOT follow (discover feed)
export async function getLatestPatchesStats(): Promise<LatestPatchesStats> {
  const supabase = await createClient()

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

  // Build queries for unfollowed games only
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

  return {
    total_today: totalToday || 0,
    high_impact_count: highImpactCount || 0,
  }
}
