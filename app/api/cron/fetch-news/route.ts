import { NextResponse } from 'next/server'
import { fetchAllGamingNews } from '@/lib/fetchers/gaming-news'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for news only

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await fetchAllGamingNews()

    return NextResponse.json({
      ok: true,
      ...result
    })
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
