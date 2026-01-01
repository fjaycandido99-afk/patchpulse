import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserNewsDigest } from '@/lib/ai/news-digest'
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
    const type = searchParams.get('type') as 'daily' | 'weekly' || 'daily'
    const refresh = searchParams.get('refresh') === 'true'

    const digest = await getUserNewsDigest(user.id, type, refresh)

    // Ensure we always return a valid response
    return NextResponse.json({
      summary: digest?.summary || 'No news to summarize',
      highlights: digest?.highlights || [],
      game_updates: digest?.game_updates || {},
      total_news: digest?.total_news || 0,
    })
  } catch (error) {
    console.error('Digest error:', error)
    return NextResponse.json(
      { error: 'Failed to generate news digest' },
      { status: 500 }
    )
  }
}
