import { createClient } from '@/lib/supabase/server'

export type LatestPatchesStats = {
  total_today: number
  high_impact_count: number
}

export async function getLatestPatchesStats(): Promise<LatestPatchesStats> {
  const supabase = await createClient()

  // Get today's start timestamp
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  // Get patches published today
  const [{ count: totalToday }, { count: highImpactCount }] = await Promise.all([
    supabase
      .from('patch_notes')
      .select('id', { count: 'exact', head: true })
      .gte('published_at', todayIso),
    supabase
      .from('patch_notes')
      .select('id', { count: 'exact', head: true })
      .gte('published_at', todayIso)
      .gte('impact_score', 8),
  ])

  return {
    total_today: totalToday || 0,
    high_impact_count: highImpactCount || 0,
  }
}
