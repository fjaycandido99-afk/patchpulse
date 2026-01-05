import { NextResponse } from 'next/server'
import { fetchAllGameVideos } from '@/lib/youtube/api'
import { verifyCronAuth } from '@/lib/cron-auth'

// Vercel Cron: Run daily at 5 AM UTC
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function GET(request: Request) {
  // Verify cron authentication
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('Starting video fetch cron job...')

  try {
    const result = await fetchAllGameVideos()

    console.log(`Video fetch complete: ${result.totalAdded} videos added from ${result.gamesChecked} games`)

    return NextResponse.json({
      success: true,
      message: `Fetched videos for ${result.gamesChecked} games`,
      totalAdded: result.totalAdded,
      gamesChecked: result.gamesChecked,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Video fetch cron error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: String(error) },
      { status: 500 }
    )
  }
}
