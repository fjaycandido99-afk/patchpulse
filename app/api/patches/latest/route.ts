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

type LatestPatchesStats = {
  total_today: number
  high_impact_count: number
}

// GET /api/patches/latest - Fetch ALL latest patches (not filtered by followed games)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const statsOnly = searchParams.get('stats') === 'true'

  // Get today's start timestamp
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  if (statsOnly) {
    // Just return stats
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

    return NextResponse.json({
      total_today: totalToday || 0,
      high_impact_count: highImpactCount || 0,
    } satisfies LatestPatchesStats)
  }

  // Fetch latest patches with game info
  const { data, error } = await supabase
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

  if (error) {
    console.error('Error fetching latest patches:', error)
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

  // Get stats for today
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

  return NextResponse.json({
    patches,
    stats: {
      total_today: totalToday || 0,
      high_impact_count: highImpactCount || 0,
    } satisfies LatestPatchesStats,
  })
}
