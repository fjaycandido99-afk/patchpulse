import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'

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

    // Get user's backlog games with recent activity
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get backlog items with game info
    const { data: backlogItems } = await supabase
      .from('backlog_items')
      .select(`
        game_id,
        last_played_at,
        status,
        games!inner(id, name, slug, cover_url)
      `)
      .eq('user_id', user.id)

    if (!backlogItems || backlogItems.length === 0) {
      return NextResponse.json({
        active: { count: 0, games: [] },
        dormant: { count: 0, games: [] },
        resurfacing: { count: 0, games: [] },
        insight: 'Add games to your backlog to track their health!',
      })
    }

    // Get recent patches for these games
    const gameIds = backlogItems.map(b => b.game_id)
    const { data: recentPatches } = await supabase
      .from('patch_notes')
      .select('game_id, published_at, impact_score, title')
      .in('game_id', gameIds)
      .gte('published_at', thirtyDaysAgo.toISOString())
      .order('published_at', { ascending: false })

    // Get recent news for these games
    const { data: recentNews } = await supabase
      .from('news_items')
      .select('game_id, published_at')
      .in('game_id', gameIds)
      .gte('published_at', thirtyDaysAgo.toISOString())

    // Calculate activity scores
    type GameInfo = { id: string; name: string; slug: string; cover_url: string | null }
    const gameActivity: Record<string, {
      patchCount: number
      newsCount: number
      recentMajorPatch: boolean
      latestPatchTitle: string | null
      game: GameInfo
      lastPlayed: string | null
    }> = {}

    for (const item of backlogItems) {
      const game = item.games as unknown as GameInfo
      gameActivity[item.game_id] = {
        patchCount: 0,
        newsCount: 0,
        recentMajorPatch: false,
        latestPatchTitle: null,
        game,
        lastPlayed: item.last_played_at,
      }
    }

    // Count patches and identify major updates
    for (const patch of recentPatches || []) {
      if (gameActivity[patch.game_id]) {
        gameActivity[patch.game_id].patchCount++
        if (patch.impact_score >= 7) {
          gameActivity[patch.game_id].recentMajorPatch = true
        }
        if (!gameActivity[patch.game_id].latestPatchTitle) {
          gameActivity[patch.game_id].latestPatchTitle = patch.title
        }
      }
    }

    // Count news
    for (const news of recentNews || []) {
      if (gameActivity[news.game_id]) {
        gameActivity[news.game_id].newsCount++
      }
    }

    // Categorize games
    type GameSummary = {
      id: string
      name: string
      slug: string
      cover_url: string | null
      momentum: 'rising' | 'stable' | 'cooling'
      reason?: string
    }

    const active: GameSummary[] = []
    const dormant: GameSummary[] = []
    const resurfacing: GameSummary[] = []

    for (const [gameId, activity] of Object.entries(gameActivity)) {
      const { patchCount, newsCount, recentMajorPatch, latestPatchTitle, game, lastPlayed } = activity
      const totalActivity = patchCount + newsCount

      // Determine momentum
      let momentum: 'rising' | 'stable' | 'cooling' = 'stable'
      if (totalActivity >= 3 || recentMajorPatch) {
        momentum = 'rising'
      } else if (totalActivity === 0) {
        momentum = 'cooling'
      }

      const gameSummary: GameSummary = {
        id: gameId,
        name: game.name,
        slug: game.slug,
        cover_url: game.cover_url,
        momentum,
      }

      // Categorize
      if (totalActivity >= 2) {
        // Active - has recent activity
        if (recentMajorPatch && latestPatchTitle) {
          gameSummary.reason = `Major update: ${latestPatchTitle.slice(0, 40)}...`
        } else {
          gameSummary.reason = `${patchCount} patches, ${newsCount} news items this month`
        }
        active.push(gameSummary)
      } else if (totalActivity === 0 && !lastPlayed) {
        // Dormant - no activity and never played
        gameSummary.reason = 'No recent updates'
        dormant.push(gameSummary)
      } else if (totalActivity >= 1 && momentum === 'rising') {
        // Resurfacing - was quiet but now has activity
        if (latestPatchTitle) {
          gameSummary.reason = latestPatchTitle.slice(0, 50)
        } else {
          gameSummary.reason = 'New activity detected'
        }
        resurfacing.push(gameSummary)
      } else {
        // Dormant
        dormant.push(gameSummary)
      }
    }

    // Generate insight
    let insight = ''
    if (resurfacing.length > 0) {
      insight = `${resurfacing.length} of your backlogged games ${resurfacing.length === 1 ? 'is' : 'are'} becoming active again due to recent updates.`
    } else if (active.length > 0) {
      insight = `${active.length} ${active.length === 1 ? 'game is' : 'games are'} actively receiving updates. Good time to jump in!`
    } else {
      insight = 'Your backlog is quiet. Check back after major updates.'
    }

    return NextResponse.json({
      active: { count: active.length, games: active.slice(0, 5) },
      dormant: { count: dormant.length, games: dormant.slice(0, 5) },
      resurfacing: { count: resurfacing.length, games: resurfacing.slice(0, 5) },
      insight,
    })
  } catch (error) {
    console.error('Backlog health error:', error)
    return NextResponse.json(
      { error: 'Failed to get backlog health' },
      { status: 500 }
    )
  }
}
