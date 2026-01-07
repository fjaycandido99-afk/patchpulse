import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlayRecommendations } from '@/lib/ai/play-recommendations'
import { getUserPlan } from '@/lib/subscriptions/limits'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has Pro access for AI features
    const plan = await getUserPlan(user.id)
    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'AI features require Pro subscription', upgrade: true },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const time = searchParams.get('time')
    const mood = searchParams.get('mood')
    const discoveryOnly = searchParams.get('discoveryOnly') === 'true'
    const backlogOnly = searchParams.get('backlogOnly') === 'true'
    const refresh = searchParams.get('refresh') === 'true'

    // If not refreshing, ONLY return cached recommendations (never generate new ones)
    if (!refresh) {
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

      // Get saved recommendation game_ids to preserve
      const { data: savedRecs } = await supabase
        .from('bookmarks')
        .select('entity_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'recommendation')

      const savedGameIds = new Set(savedRecs?.map(r => r.entity_id) || [])

      // Get expired/stale recommendations for this user
      const { data: staleRecs } = await supabase
        .from('play_recommendations')
        .select('id, game_id')
        .eq('user_id', user.id)
        .or(`expires_at.is.null,expires_at.lt.${now.toISOString()},created_at.lt.${twentyFourHoursAgo}`)

      // Delete only non-saved stale recommendations
      const idsToDelete = staleRecs?.filter(r => !savedGameIds.has(r.game_id)).map(r => r.id) || []
      if (idsToDelete.length > 0) {
        await supabase
          .from('play_recommendations')
          .delete()
          .in('id', idsToDelete)
      }

      // Query recommendations with game data embedded in context (more reliable than join)
      const { data: cached } = await supabase
        .from('play_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .gte('created_at', twentyFourHoursAgo)
        .order('match_score', { ascending: false })
        .limit(10)

      console.log(`[Recommendations API] Found ${cached?.length || 0} cached records in database`)

      // Transform cached recommendations - use context for game data
      const recommendations = (cached || []).map(rec => {
        const context = rec.context as Record<string, unknown> || {}

        return {
          game_id: rec.game_id,
          game_name: (context.game_name as string) || 'Unknown Game',
          slug: (context.slug as string) || rec.game_id,
          cover_url: (context.cover_url as string) || null,
          reason: rec.reason,
          match_score: rec.match_score,
          recommendation_type: rec.recommendation_type as 'return' | 'start' | 'finish' | 'discover',
          factors: Array.isArray(rec.factors) ? rec.factors : [],
          why_now: (context.why_now as string) || null,
          what_youd_miss: (context.what_youd_miss as string) || null,
          momentum: (context.momentum as 'rising' | 'stable' | 'cooling') || 'stable',
          recent_patch: null,
          days_since_played: null,
          progress: 0,
          is_discovery: rec.recommendation_type === 'discover',
          follower_count: (context.follower_count as number) || undefined,
        }
      })

      // Deduplicate for response
      const seen = new Set<string>()
      const uniqueRecommendations = recommendations.filter(rec => {
        if (seen.has(rec.game_id)) return false
        seen.add(rec.game_id)
        return true
      })

      // Always return cached results (even if empty) - user must click button to generate new ones
      console.log(`[Recommendations API] Returning ${uniqueRecommendations.length} cached recommendations`)
      return NextResponse.json({
        recommendations: uniqueRecommendations,
        message: uniqueRecommendations.length > 0 ? 'Your recommendations' : 'Click the button to get recommendations',
        cached: true,
      })
    }

    // Only generate new recommendations when refresh=true (user clicked button)
    // Delete old recommendations before generating new ones
    await supabase
      .from('play_recommendations')
      .delete()
      .eq('user_id', user.id)

    // Generate fresh recommendations
    const context = {
      availableTime: time ? parseInt(time) : undefined,
      mood: mood as 'chill' | 'challenge' | 'story' | 'social' | 'any' | undefined,
      discoveryOnly,
      backlogOnly,
    }

    const recommendations = await getPlayRecommendations(user.id, context)

    // Ensure we return a valid response structure
    return NextResponse.json({
      recommendations: Array.isArray(recommendations?.recommendations) ? recommendations.recommendations : [],
      message: recommendations?.message || 'Here are your recommendations',
      cached: false,
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
