import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchIgdbGame } from '@/lib/fetchers/igdb'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute max

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!

let accessToken: string | null = null

async function getAccessToken(): Promise<string> {
  if (accessToken) return accessToken

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )

  const data = await response.json()
  accessToken = data.access_token
  return accessToken!
}

async function searchGameReleaseDate(gameName: string): Promise<string | null> {
  try {
    const token = await getAccessToken()

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${gameName.replace(/"/g, '')}"; fields id, name, first_release_date; limit 3;`,
    })

    if (!response.ok) return null

    const games = await response.json()
    if (!games || games.length === 0) return null

    const lowerName = gameName.toLowerCase()
    const bestMatch = games.find((g: { name: string }) => g.name.toLowerCase() === lowerName) || games[0]

    if (bestMatch.first_release_date) {
      return new Date(bestMatch.first_release_date * 1000).toISOString()
    }
    return null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get games without release dates
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name')
    .is('release_date', null)
    .limit(20) // Process 20 at a time

  if (error || !games) {
    return NextResponse.json({ ok: false, error: error?.message || 'No games found' })
  }

  let updatedCount = 0

  for (const game of games) {
    const releaseDate = await searchGameReleaseDate(game.name)

    if (releaseDate) {
      const { error: updateError } = await supabase
        .from('games')
        .update({ release_date: releaseDate })
        .eq('id', game.id)

      if (!updateError) {
        updatedCount++
      }
    }

    // Rate limit
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  return NextResponse.json({
    ok: true,
    processed: games.length,
    updated: updatedCount,
  })
}
