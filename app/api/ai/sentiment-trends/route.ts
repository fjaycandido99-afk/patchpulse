import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'

type GameSentiment = {
  game_id: string
  game_name: string
  game_slug: string
  cover_url: string | null
  trend: 'improving' | 'stable' | 'declining'
  trend_score: number // -100 to 100
  reason: string
  patch_activity: {
    last_7_days: number
    last_30_days: number
    avg_impact: number
  }
  last_patch: {
    title: string
    published_at: string
    impact_score: number
  } | null
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

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get user's backlog/followed games
    const { data: userGames } = await supabase
      .from('backlog_items')
      .select(`
        game_id,
        games!inner(id, name, slug, cover_url)
      `)
      .eq('user_id', user.id)

    if (!userGames || userGames.length === 0) {
      return NextResponse.json({
        games: [],
        summary: {
          improving: 0,
          stable: 0,
          declining: 0,
        },
        message: 'Add games to your backlog to track sentiment trends!',
      })
    }

    const gameIds = userGames.map(g => g.game_id)

    // Get all patches for these games in last 30 days
    const { data: patches } = await supabase
      .from('patch_notes')
      .select('game_id, title, published_at, impact_score')
      .in('game_id', gameIds)
      .gte('published_at', thirtyDaysAgo.toISOString())
      .order('published_at', { ascending: false })

    // Calculate sentiment for each game
    type GameInfo = { id: string; name: string; slug: string; cover_url: string | null }
    const gameSentiments: GameSentiment[] = []

    for (const item of userGames) {
      const game = item.games as unknown as GameInfo
      const gamePatches = patches?.filter(p => p.game_id === item.game_id) || []

      // Count patches by period
      const last7Days = gamePatches.filter(p => new Date(p.published_at) >= sevenDaysAgo)
      const prev7Days = gamePatches.filter(p => {
        const date = new Date(p.published_at)
        return date >= fourteenDaysAgo && date < sevenDaysAgo
      })
      const last30Days = gamePatches

      // Calculate average impact
      const avgImpact = last30Days.length > 0
        ? last30Days.reduce((sum, p) => sum + (p.impact_score || 5), 0) / last30Days.length
        : 0

      // Calculate trend score
      // Positive = more recent activity with higher impact
      // Negative = less activity or lower impact patches
      let trendScore = 0
      let trend: 'improving' | 'stable' | 'declining' = 'stable'
      let reason = ''

      if (last7Days.length > prev7Days.length) {
        // More patches recently = improving
        trendScore = Math.min(100, (last7Days.length - prev7Days.length) * 25 + avgImpact * 5)
        trend = 'improving'
        reason = `${last7Days.length} patch${last7Days.length > 1 ? 'es' : ''} this week — active development`
      } else if (last7Days.length < prev7Days.length && prev7Days.length > 0) {
        // Fewer patches recently = potentially declining
        trendScore = Math.max(-100, (last7Days.length - prev7Days.length) * 25)
        trend = 'declining'
        reason = 'Patch activity slowing down'
      } else if (last7Days.length > 0 && avgImpact >= 7) {
        // High-impact patches = improving
        trendScore = Math.min(100, avgImpact * 10)
        trend = 'improving'
        reason = 'High-impact updates recently'
      } else if (last30Days.length === 0) {
        // No patches = stable but quiet
        trendScore = 0
        trend = 'stable'
        reason = 'No recent patches — stable or inactive'
      } else {
        // Consistent patches = stable
        trendScore = 0
        trend = 'stable'
        reason = 'Consistent update cadence'
      }

      const lastPatch = gamePatches[0] || null

      gameSentiments.push({
        game_id: item.game_id,
        game_name: game.name,
        game_slug: game.slug,
        cover_url: game.cover_url,
        trend,
        trend_score: Math.round(trendScore),
        reason,
        patch_activity: {
          last_7_days: last7Days.length,
          last_30_days: last30Days.length,
          avg_impact: Math.round(avgImpact * 10) / 10,
        },
        last_patch: lastPatch ? {
          title: lastPatch.title,
          published_at: lastPatch.published_at,
          impact_score: lastPatch.impact_score || 5,
        } : null,
      })
    }

    // Sort by trend score (improving first)
    gameSentiments.sort((a, b) => b.trend_score - a.trend_score)

    // Calculate summary
    const improving = gameSentiments.filter(g => g.trend === 'improving').length
    const stable = gameSentiments.filter(g => g.trend === 'stable').length
    const declining = gameSentiments.filter(g => g.trend === 'declining').length

    // Generate message
    let message = ''
    if (improving > declining && improving > 0) {
      message = `${improving} of your games ${improving === 1 ? 'is' : 'are'} showing positive momentum. Good time to check in.`
    } else if (declining > improving && declining > 0) {
      message = `${declining} game${declining > 1 ? 's' : ''} slowing down on updates. Monitor before investing time.`
    } else if (stable === gameSentiments.length) {
      message = 'Your games are in a stable update phase. No major shifts detected.'
    } else {
      message = 'Mixed signals across your games. Check individual trends for details.'
    }

    return NextResponse.json({
      games: gameSentiments,
      summary: {
        improving,
        stable,
        declining,
      },
      message,
    })
  } catch (error) {
    console.error('Sentiment trends error:', error)
    return NextResponse.json(
      { error: 'Failed to get sentiment trends' },
      { status: 500 }
    )
  }
}
