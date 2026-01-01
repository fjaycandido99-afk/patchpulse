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
    const refresh = searchParams.get('refresh') === 'true'

    // If not refreshing, try to get cached recommendations first
    if (!refresh) {
      const { data: cached } = await supabase
        .from('play_recommendations')
        .select(`
          id,
          game_id,
          reason,
          match_score,
          recommendation_type,
          context,
          factors,
          created_at,
          games:game_id (
            id,
            name,
            slug,
            cover_url
          )
        `)
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .gte('expires_at', new Date().toISOString())
        .order('match_score', { ascending: false })
        .limit(10)

      if (cached && cached.length > 0) {
        // Transform cached recommendations to match expected format
        // Filter out any recommendations where the game no longer exists
        const recommendations = cached
          .map(rec => {
            // Handle both array and single object from Supabase join
            type GameType = { id: string; name: string; slug: string; cover_url: string | null }
            const gamesData = rec.games as GameType | GameType[] | null
            const game = Array.isArray(gamesData) ? gamesData[0] : gamesData

            // Skip if game doesn't exist in database
            if (!game || !game.id) return null

            const context = rec.context as Record<string, unknown> || {}
            const factors = rec.factors as Record<string, unknown> || {}

            return {
              game_id: rec.game_id,
              game_name: game.name,
              slug: game.slug || rec.game_id,
              cover_url: game.cover_url || null,
              reason: rec.reason,
              match_score: rec.match_score,
              recommendation_type: rec.recommendation_type as 'return' | 'start' | 'finish' | 'discover',
              factors: Array.isArray(factors) ? factors : [],
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
          .filter(Boolean) // Remove null entries (games that don't exist)

        if (recommendations.length > 0) {
          // Deduplicate by game_id (keep first/highest scored)
          const seen = new Set<string>()
          const uniqueRecommendations = recommendations.filter(rec => {
            if (seen.has(rec.game_id)) return false
            seen.add(rec.game_id)
            return true
          })

          return NextResponse.json({
            recommendations: uniqueRecommendations,
            message: 'Your personalized recommendations',
            cached: true,
          })
        }
        // If all cached recommendations were filtered out, fall through to generate new ones
      }
    }

    // Generate fresh recommendations
    const context = {
      availableTime: time ? parseInt(time) : undefined,
      mood: mood as 'chill' | 'challenge' | 'story' | 'social' | 'any' | undefined,
      discoveryOnly,
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
