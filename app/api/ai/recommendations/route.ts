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

    const context = {
      availableTime: time ? parseInt(time) : undefined,
      mood: mood as 'chill' | 'challenge' | 'story' | 'social' | 'any' | undefined,
    }

    const recommendations = await getPlayRecommendations(user.id, context)

    // Ensure we return a valid response structure
    return NextResponse.json({
      recommendations: Array.isArray(recommendations?.recommendations) ? recommendations.recommendations : [],
      message: recommendations?.message || 'Here are your recommendations',
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
