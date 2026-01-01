import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'

type GameHealth = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  state: 'active' | 'dormant' | 'resurfacing'
  reason: string
  last_patch_at: string | null
  last_news_at: string | null
  days_since_update: number | null
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
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Get user's backlog/followed games
    const { data: userGames } = await supabase
      .from('backlog_items')
      .select(`
        game_id,
        status,
        games!inner(id, name, slug, cover_url)
      `)
      .eq('user_id', user.id)
      .in('status', ['backlog', 'playing', 'paused'])

    if (!userGames || userGames.length === 0) {
      return NextResponse.json({
        active: { count: 0, games: [] },
        dormant: { count: 0, games: [] },
        resurfacing: { count: 0, games: [] },
        message: 'Add games to your backlog to track their health!',
        total: 0,
      })
    }

    const gameIds = userGames.map(g => g.game_id)

    // Get last patch date for each game
    const { data: patches } = await supabase
      .from('patch_notes')
      .select('game_id, published_at, title')
      .in('game_id', gameIds)
      .order('published_at', { ascending: false })

    // Get last news date for each game
    const { data: news } = await supabase
      .from('news_items')
      .select('game_id, published_at')
      .in('game_id', gameIds)
      .order('published_at', { ascending: false })

    // Build maps for last update dates
    const lastPatchMap = new Map<string, { date: string; title: string }>()
    const lastNewsMap = new Map<string, string>()

    patches?.forEach(p => {
      if (!lastPatchMap.has(p.game_id)) {
        lastPatchMap.set(p.game_id, { date: p.published_at, title: p.title || 'Update' })
      }
    })

    news?.forEach(n => {
      if (!lastNewsMap.has(n.game_id)) {
        lastNewsMap.set(n.game_id, n.published_at)
      }
    })

    // Classify each game
    type GameInfo = { id: string; name: string; slug: string; cover_url: string | null }
    const active: GameHealth[] = []
    const dormant: GameHealth[] = []
    const resurfacing: GameHealth[] = []

    for (const item of userGames) {
      const game = item.games as unknown as GameInfo
      const lastPatch = lastPatchMap.get(item.game_id)
      const lastNews = lastNewsMap.get(item.game_id)

      const lastPatchDate = lastPatch ? new Date(lastPatch.date) : null
      const lastNewsDate = lastNews ? new Date(lastNews) : null

      // Get the most recent update (patch or news)
      let lastUpdateDate: Date | null = null
      if (lastPatchDate && lastNewsDate) {
        lastUpdateDate = lastPatchDate > lastNewsDate ? lastPatchDate : lastNewsDate
      } else {
        lastUpdateDate = lastPatchDate || lastNewsDate
      }

      const daysSinceUpdate = lastUpdateDate
        ? Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24))
        : null

      const gameHealth: GameHealth = {
        id: item.game_id,
        name: game.name,
        slug: game.slug,
        cover_url: game.cover_url,
        state: 'dormant',
        reason: '',
        last_patch_at: lastPatch?.date || null,
        last_news_at: lastNews || null,
        days_since_update: daysSinceUpdate,
      }

      // Classification logic (from spec)
      // Active: last update within 30 days
      if (lastUpdateDate && lastUpdateDate >= thirtyDaysAgo) {
        gameHealth.state = 'active'
        if (lastPatchDate && lastPatchDate >= thirtyDaysAgo) {
          gameHealth.reason = `Patch ${daysSinceUpdate === 0 ? 'today' : daysSinceUpdate === 1 ? 'yesterday' : `${daysSinceUpdate}d ago`}: ${lastPatch?.title?.slice(0, 40) || 'Update'}`
        } else {
          gameHealth.reason = `News ${daysSinceUpdate}d ago`
        }
        active.push(gameHealth)
      }
      // Resurfacing: was dormant (>90 days) but got patch in last 14 days
      else if (
        lastPatchDate &&
        lastPatchDate >= fourteenDaysAgo &&
        (!lastUpdateDate || lastUpdateDate < ninetyDaysAgo || lastPatchDate >= fourteenDaysAgo)
      ) {
        // Check if there was a long gap before this patch
        const previousUpdateWasDormant = !lastNewsDate || lastNewsDate < ninetyDaysAgo
        if (previousUpdateWasDormant || daysSinceUpdate !== null && daysSinceUpdate <= 14) {
          gameHealth.state = 'resurfacing'
          gameHealth.reason = `Back after silence: ${lastPatch?.title?.slice(0, 35) || 'New patch'}`
          resurfacing.push(gameHealth)
          continue
        }
        // Otherwise it's active
        gameHealth.state = 'active'
        gameHealth.reason = lastPatch?.title?.slice(0, 40) || 'Recent update'
        active.push(gameHealth)
      }
      // Dormant: no updates in 90+ days (or never)
      else {
        gameHealth.state = 'dormant'
        if (daysSinceUpdate === null) {
          gameHealth.reason = 'No tracked updates'
        } else if (daysSinceUpdate > 365) {
          gameHealth.reason = `Last update over a year ago`
        } else {
          gameHealth.reason = `Last update ${daysSinceUpdate}d ago`
        }
        dormant.push(gameHealth)
      }
    }

    // Sort by recency within each category
    active.sort((a, b) => (a.days_since_update || 999) - (b.days_since_update || 999))
    resurfacing.sort((a, b) => (a.days_since_update || 999) - (b.days_since_update || 999))
    dormant.sort((a, b) => (a.days_since_update || 999) - (b.days_since_update || 999))

    // Generate dynamic message
    let message = ''
    if (resurfacing.length > 0) {
      const names = resurfacing.slice(0, 2).map(g => g.name).join(' and ')
      message = `${names} ${resurfacing.length === 1 ? 'is' : 'are'} waking up after a quiet period. Worth checking out.`
    } else if (active.length >= 3) {
      message = `${active.length} games are actively receiving updates — strong re-entry window.`
    } else if (active.length > 0) {
      message = `${active.length} ${active.length === 1 ? 'game has' : 'games have'} recent activity. Good time to jump in.`
    } else if (dormant.length === userGames.length) {
      message = 'Your backlog is quiet right now. Low pressure to catch up.'
    } else {
      message = 'Most of your backlog is stable. Check back after major updates.'
    }

    return NextResponse.json({
      active: { count: active.length, games: active },
      dormant: { count: dormant.length, games: dormant },
      resurfacing: { count: resurfacing.length, games: resurfacing },
      message,
      total: userGames.length,
    })
  } catch (error) {
    console.error('Backlog health error:', error)
    return NextResponse.json(
      { error: 'Failed to get backlog health' },
      { status: 500 }
    )
  }
}
