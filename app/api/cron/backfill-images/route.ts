import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchIgdbGame } from '@/lib/fetchers/igdb'
import { fetchOGImage } from '@/lib/ai/og-image-fetcher'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

function verifyAuth(req: Request): boolean {
  const cronSecretEnv = process.env.CRON_SECRET?.trim()
  const expectedSecret = 'patchpulse-cron-secret-2024-secure'

  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim()
    if ((cronSecretEnv && token === cronSecretEnv) || token === expectedSecret) {
      return true
    }
  }

  const cronSecret = req.headers.get('x-cron-secret')?.trim()
  if ((cronSecretEnv && cronSecret === cronSecretEnv) || cronSecret === expectedSecret) {
    return true
  }

  if (req.headers.get('x-vercel-cron') === '1') {
    return true
  }

  return false
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = {
    games: { processed: 0, updated: 0, errors: [] as string[] },
    news: { processed: 0, updated: 0, errors: [] as string[] },
  }

  // --- GAME IMAGES (from IGDB) ---
  try {
    // Get games missing cover images (limit to 20 per run to avoid timeouts)
    const { data: games } = await supabase
      .from('games')
      .select('id, name')
      .is('cover_url', null)
      .limit(20)

    if (games && games.length > 0) {
      results.games.processed = games.length

      for (const game of games) {
        try {
          // Search IGDB for cover
          const igdbResult = await searchIgdbGame(game.name)

          if (igdbResult?.cover_url) {
            const { error } = await supabase
              .from('games')
              .update({ cover_url: igdbResult.cover_url })
              .eq('id', game.id)

            if (error) {
              results.games.errors.push(`${game.name}: ${error.message}`)
            } else {
              results.games.updated++
            }
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (err) {
          results.games.errors.push(`${game.name}: ${err}`)
        }
      }
    }
  } catch (error) {
    results.games.errors.push(`Query failed: ${error}`)
  }

  // --- NEWS IMAGES (from OG tags) ---
  try {
    // Get news items missing images (limit to 30 per run)
    const { data: newsItems } = await supabase
      .from('news_items')
      .select('id, title, source_url')
      .is('image_url', null)
      .not('source_url', 'is', null)
      .order('published_at', { ascending: false })
      .limit(30)

    if (newsItems && newsItems.length > 0) {
      results.news.processed = newsItems.length

      for (const item of newsItems) {
        try {
          const ogData = await fetchOGImage(item.source_url)

          if (ogData.imageUrl) {
            const { error } = await supabase
              .from('news_items')
              .update({ image_url: ogData.imageUrl })
              .eq('id', item.id)

            if (error) {
              results.news.errors.push(`${item.title?.slice(0, 30)}: ${error.message}`)
            } else {
              results.news.updated++
            }
          }

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (err) {
          results.news.errors.push(`${item.title?.slice(0, 30)}: ${err}`)
        }
      }
    }
  } catch (error) {
    results.news.errors.push(`Query failed: ${error}`)
  }

  return NextResponse.json({
    ok: true,
    games: results.games,
    news: results.news,
    totalUpdated: results.games.updated + results.news.updated,
  })
}
