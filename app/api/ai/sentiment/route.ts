import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { getGameSentiment, getMultiGameSentiment } from '@/lib/ai/sentiment-pulse'

export async function GET(request: Request) {
  // Check Pro access for AI features
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await getUserPlan(user.id)
  if (plan !== 'pro') {
    return NextResponse.json(
      { error: 'AI features require Pro subscription', upgrade: true },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const gameIds = searchParams.get('gameIds')

    if (gameIds) {
      // Batch request for multiple games
      const ids = gameIds.split(',')
      const results = await getMultiGameSentiment(ids)

      return NextResponse.json({
        sentiments: Object.fromEntries(results),
      })
    }

    if (!gameId) {
      return NextResponse.json(
        { error: 'gameId or gameIds parameter required' },
        { status: 400 }
      )
    }

    const sentiment = await getGameSentiment(gameId)

    if (!sentiment) {
      return NextResponse.json(
        { error: 'Unable to analyze sentiment for this game' },
        { status: 404 }
      )
    }

    return NextResponse.json(sentiment)
  } catch (error) {
    console.error('Sentiment error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    )
  }
}
