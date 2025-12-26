import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { runNewsAI, runPatchAI, discoverPatchSourceUrl } from '@/lib/ai/provider'
import { fetchOGImage } from '@/lib/ai/og-image-fetcher'
import { discoverSeasonalArtwork } from '@/lib/ai/seasonal-discovery'
import { processReturnMatchesForPatch } from '@/lib/ai/return-matcher'
import { discoverUpcomingReleases } from '@/lib/ai/release-discovery'
import { createSeasonalEvent } from '@/lib/images/seasonal'

type JobRow = {
  id: string
  job_type: 'PATCH_SUMMARY' | 'NEWS_SUMMARY' | 'DISCOVER_SEASONAL' | 'RETURN_MATCH' | 'DISCOVER_RELEASES'
  entity_id: string
  attempts: number
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function sanitizeList(items: unknown, max = 10): string[] {
  if (!Array.isArray(items)) return []
  return items
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean)
    .slice(0, max)
}

export async function processAIJobsBatch(batchSize = 5) {
  const supabase = await createSupabaseServerClient()

  // 1) Fetch pending jobs
  const { data: jobs, error: jobsErr } = await supabase
    .from('ai_jobs')
    .select('id, job_type, entity_id, attempts')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize)

  if (jobsErr) throw jobsErr
  if (!jobs || jobs.length === 0) return { processed: 0 }

  let processed = 0

  for (const job of jobs as JobRow[]) {
    // 2) Lock job (best-effort; for MVP this is okay)
    const { error: lockErr } = await supabase
      .from('ai_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        attempts: job.attempts + 1,
      })
      .eq('id', job.id)
      .eq('status', 'pending') // prevent double-run

    if (lockErr) continue

    try {
      if (job.job_type === 'PATCH_SUMMARY') {
        await processPatchJob(supabase, job.entity_id)
      }

      if (job.job_type === 'NEWS_SUMMARY') {
        await processNewsJob(supabase, job.entity_id)
      }

      if (job.job_type === 'DISCOVER_SEASONAL') {
        await processSeasonalJob(supabase, job.entity_id)
      }

      if (job.job_type === 'RETURN_MATCH') {
        await processReturnMatchJob(job.entity_id)
      }

      if (job.job_type === 'DISCOVER_RELEASES') {
        await processReleaseDiscoveryJob(supabase, job.entity_id)
      }

      // 3) Mark done
      await supabase
        .from('ai_jobs')
        .update({ status: 'done', error_message: null, completed_at: new Date().toISOString() })
        .eq('id', job.id)

      processed += 1
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      const nextStatus = job.attempts + 1 >= 3 ? 'failed' : 'pending'

      await supabase
        .from('ai_jobs')
        .update({
          status: nextStatus,
          error_message: message.slice(0, 900),
        })
        .eq('id', job.id)
    }
  }

  return { processed }
}

async function processPatchJob(supabase: any, entityId: string) {
  const { data: patchRow, error: patchErr } = await supabase
    .from('patch_notes')
    .select('id, title, raw_text, source_url, published_at, game:games(name)')
    .eq('id', entityId)
    .single()

  if (patchErr || !patchRow) throw patchErr ?? new Error('Patch not found')

  const gameName = Array.isArray(patchRow.game)
    ? patchRow.game[0]?.name ?? 'Unknown Game'
    : patchRow.game?.name ?? 'Unknown Game'
  const rawText = patchRow.raw_text ?? ''

  if (!rawText.trim()) throw new Error('No raw text to process')

  const ai = await runPatchAI({
    gameName,
    patchTitle: patchRow.title,
    rawText,
  })

  const summary_tldr = (ai.summary_tldr ?? '').slice(0, 280)
  const ai_insight = (ai.ai_insight ?? '').slice(0, 120)
  const key_changes = ai.key_changes ?? []
  const tags = sanitizeList(ai.tags, 4)
  const impact_score = clampInt(Number(ai.impact_score ?? 5), 1, 10)

  // If source_url is missing, try to discover it with AI
  let discoveredSourceUrl: string | null = patchRow.source_url
  let sourceName: string | null = null

  if (!discoveredSourceUrl) {
    try {
      const sourceResult = await discoverPatchSourceUrl({
        gameName,
        patchTitle: patchRow.title,
        publishedDate: patchRow.published_at,
      })

      if (sourceResult.source_url && sourceResult.confidence >= 0.6) {
        discoveredSourceUrl = sourceResult.source_url
        sourceName = sourceResult.source_name
        console.log(`Discovered source URL for patch ${patchRow.title}: ${discoveredSourceUrl} (${sourceName})`)
      }
    } catch (err) {
      // Source URL discovery failed, not critical
      console.warn('Source URL discovery failed:', err)
    }
  }

  const { error: updErr } = await supabase
    .from('patch_notes')
    .update({
      summary_tldr,
      ai_insight: ai_insight || null,
      key_changes,
      tags,
      impact_score,
      ...(discoveredSourceUrl && !patchRow.source_url ? { source_url: discoveredSourceUrl } : {}),
    })
    .eq('id', patchRow.id)

  if (updErr) throw updErr

  // Queue a RETURN_MATCH job to check if this patch addresses anyone's pause reason
  await supabase
    .from('ai_jobs')
    .upsert(
      {
        job_type: 'RETURN_MATCH',
        entity_id: entityId, // patch_id
        status: 'pending',
      },
      {
        onConflict: 'job_type,entity_id',
        ignoreDuplicates: true,
      }
    )
}

// Process return matching for a patch - check against all paused games
async function processReturnMatchJob(patchId: string) {
  const result = await processReturnMatchesForPatch(patchId)

  if (result.errors.length > 0) {
    console.warn(`Return match job had ${result.errors.length} errors:`, result.errors.slice(0, 3))
  }

  console.log(`Return match job created ${result.matchesCreated} suggestions for patch ${patchId}`)
}

async function processNewsJob(supabase: any, entityId: string) {
  const { data: newsRow, error: newsErr } = await supabase
    .from('news_items')
    .select('id, title, source_name, source_url, summary, image_url, game:games(name)')
    .eq('id', entityId)
    .single()

  if (newsErr || !newsRow) throw newsErr ?? new Error('News not found')

  // Raw text stored in summary field temporarily
  const rawText = (newsRow.summary ?? '').trim()
  if (!rawText) throw new Error('No raw text to process')

  const gameName = Array.isArray(newsRow.game)
    ? newsRow.game[0]?.name ?? null
    : newsRow.game?.name ?? null

  const ai = await runNewsAI({
    gameNameOrGeneral: gameName ?? 'General',
    title: newsRow.title,
    rawText,
    sourceName: newsRow.source_name,
    sourceUrl: newsRow.source_url,
  })

  const summary = (ai.summary ?? '').slice(0, 450)
  const why_it_matters = (ai.why_it_matters ?? '').slice(0, 300)
  const topics = sanitizeList(ai.topics, 3)
  const is_rumor = Boolean(ai.is_rumor)

  // Fetch OG image if we don't have one and have a source URL
  let imageUrl: string | null = newsRow.image_url
  if (!imageUrl && newsRow.source_url) {
    try {
      const ogResult = await fetchOGImage(newsRow.source_url)
      if (ogResult.imageUrl) {
        imageUrl = ogResult.imageUrl
        console.log(`Fetched OG image for news "${newsRow.title}": ${imageUrl}`)
      }
    } catch (err) {
      console.warn('Failed to fetch OG image:', err)
    }
  }

  const { error: updErr } = await supabase
    .from('news_items')
    .update({
      summary,
      why_it_matters,
      topics,
      is_rumor,
      ...(imageUrl && !newsRow.image_url ? { image_url: imageUrl } : {}),
    })
    .eq('id', newsRow.id)

  if (updErr) throw updErr
}

async function processSeasonalJob(supabase: any, entityId: string) {
  // entityId is the game_id for seasonal discovery
  const { data: gameRow, error: gameErr } = await supabase
    .from('games')
    .select('id, name, genre, is_live_service')
    .eq('id', entityId)
    .single()

  if (gameErr || !gameRow) throw gameErr ?? new Error('Game not found')

  // Run AI discovery
  const result = await discoverSeasonalArtwork({
    gameName: gameRow.name,
    gameId: gameRow.id,
    gameGenre: gameRow.genre,
    isLiveService: gameRow.is_live_service,
  })

  if (!result.found || result.events.length === 0) {
    // No events found, update discovery queue status
    await supabase
      .from('seasonal_discovery_queue')
      .update({
        status: 'not_found',
        search_results: result,
        last_attempt_at: new Date().toISOString(),
      })
      .eq('game_id', entityId)
      .eq('status', 'searching')

    return
  }

  // Create seasonal events for each discovered event
  let createdCount = 0
  for (const event of result.events) {
    // Skip low confidence events
    if (event.confidence < 0.5) continue

    try {
      const created = await createSeasonalEvent({
        gameId: entityId,
        eventName: event.eventName,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        coverUrl: event.coverUrl ?? undefined,
        logoUrl: event.logoUrl ?? undefined,
        heroUrl: event.heroUrl ?? undefined,
        brandColor: event.brandColor ?? undefined,
        sourceUrl: event.sourceUrl ?? undefined,
        confidenceScore: event.confidence,
      })

      if (created) createdCount++
    } catch {
      // Ignore duplicate events (unique constraint)
    }
  }

  // Update discovery queue
  await supabase
    .from('seasonal_discovery_queue')
    .update({
      status: createdCount > 0 ? 'found' : 'not_found',
      search_results: result,
      last_attempt_at: new Date().toISOString(),
    })
    .eq('game_id', entityId)
    .eq('status', 'searching')
}

async function processReleaseDiscoveryJob(supabase: any, entityId: string) {
  // entityId is the game_id for release discovery
  const { data: gameRow, error: gameErr } = await supabase
    .from('games')
    .select('id, name')
    .eq('id', entityId)
    .single()

  if (gameErr || !gameRow) throw gameErr ?? new Error('Game not found')

  // Run AI discovery
  const result = await discoverUpcomingReleases({
    gameName: gameRow.name,
    gameId: gameRow.id,
  })

  if (!result.success) {
    throw new Error(result.error || 'Failed to discover releases')
  }

  // Result is automatically saved to database by discoverUpcomingReleases
}
