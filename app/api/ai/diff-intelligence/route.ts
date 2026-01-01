import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'

type DiffStats = {
  buffs: number
  nerfs: number
  new_systems: number
  bug_fixes: number
  ignore_safe: boolean
}

type PatchWithDiff = {
  id: string
  title: string
  published_at: string
  impact_score: number
  summary_tldr: string | null
  ai_insight: string | null
  diff_stats: DiffStats | null
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Pro access
    const plan = await getUserPlan(user.id)
    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'Pro subscription required', upgrade: true },
        { status: 403 }
      )
    }

    // Get user's backlog/followed games
    const { data: userGames } = await supabase
      .from('backlog_items')
      .select('game_id')
      .eq('user_id', user.id)

    if (!userGames || userGames.length === 0) {
      return NextResponse.json({
        patches: [],
        summary: {
          total_buffs: 0,
          total_nerfs: 0,
          total_new_systems: 0,
          total_bug_fixes: 0,
          patches_safe_to_skip: 0,
          must_play_patches: 0,
        },
        message: 'Add games to your backlog to see patch intelligence!',
      })
    }

    const gameIds = userGames.map(g => g.game_id)

    // Get recent patches with diff_stats for these games (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: patches, error } = await supabase
      .from('patch_notes')
      .select(`
        id,
        title,
        published_at,
        impact_score,
        summary_tldr,
        ai_insight,
        diff_stats,
        games!inner(id, name, slug, cover_url)
      `)
      .in('game_id', gameIds)
      .gte('published_at', thirtyDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Diff intelligence error:', error)
      throw error
    }

    // Calculate aggregate stats
    let totalBuffs = 0
    let totalNerfs = 0
    let totalNewSystems = 0
    let totalBugFixes = 0
    let safeToSkip = 0
    let mustPlay = 0

    type GameInfo = { id: string; name: string; slug: string; cover_url: string | null }

    const formattedPatches: PatchWithDiff[] = (patches || []).map(p => {
      const game = p.games as unknown as GameInfo
      const diffStats = p.diff_stats as DiffStats | null

      if (diffStats) {
        totalBuffs += diffStats.buffs || 0
        totalNerfs += diffStats.nerfs || 0
        totalNewSystems += diffStats.new_systems || 0
        totalBugFixes += diffStats.bug_fixes || 0
        if (diffStats.ignore_safe) {
          safeToSkip++
        }
      }

      // Must-play = high impact OR significant buffs/nerfs OR new systems
      if (
        p.impact_score >= 7 ||
        (diffStats && (diffStats.buffs >= 3 || diffStats.nerfs >= 3 || diffStats.new_systems >= 2))
      ) {
        mustPlay++
      }

      return {
        id: p.id,
        title: p.title,
        published_at: p.published_at,
        impact_score: p.impact_score || 0,
        summary_tldr: p.summary_tldr,
        ai_insight: p.ai_insight,
        diff_stats: diffStats,
        game: {
          id: game.id,
          name: game.name,
          slug: game.slug,
          cover_url: game.cover_url,
        },
      }
    })

    // Generate message
    let message = ''
    if (mustPlay > 0) {
      message = `${mustPlay} patch${mustPlay > 1 ? 'es' : ''} require${mustPlay === 1 ? 's' : ''} attention — significant balance or content changes.`
    } else if (safeToSkip === formattedPatches.length && formattedPatches.length > 0) {
      message = "All recent patches are minor — safe to skip if you're short on time."
    } else if (formattedPatches.length > 0) {
      message = `${formattedPatches.length} patches analyzed. Mix of balance tweaks and bug fixes.`
    } else {
      message = 'No recent patches for your games.'
    }

    return NextResponse.json({
      patches: formattedPatches,
      summary: {
        total_buffs: totalBuffs,
        total_nerfs: totalNerfs,
        total_new_systems: totalNewSystems,
        total_bug_fixes: totalBugFixes,
        patches_safe_to_skip: safeToSkip,
        must_play_patches: mustPlay,
      },
      message,
    })
  } catch (error) {
    console.error('Diff intelligence error:', error)
    return NextResponse.json(
      { error: 'Failed to get diff intelligence' },
      { status: 500 }
    )
  }
}
