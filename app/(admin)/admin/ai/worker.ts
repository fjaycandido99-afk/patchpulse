import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { runNewsAI, runPatchAI } from '@/lib/ai/provider'

type JobRow = {
  id: string
  job_type: 'PATCH_SUMMARY' | 'NEWS_SUMMARY'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processPatchJob(supabase: any, entityId: string) {
  const { data: patchRow, error: patchErr } = await supabase
    .from('patch_notes')
    .select('id, title, raw_text, game:games(name)')
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
  const key_changes = ai.key_changes ?? []
  const tags = sanitizeList(ai.tags, 4)
  const impact_score = clampInt(Number(ai.impact_score ?? 5), 1, 10)

  const { error: updErr } = await supabase
    .from('patch_notes')
    .update({
      summary_tldr,
      key_changes,
      tags,
      impact_score,
    })
    .eq('id', patchRow.id)

  if (updErr) throw updErr
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processNewsJob(supabase: any, entityId: string) {
  const { data: newsRow, error: newsErr } = await supabase
    .from('news_items')
    .select('id, title, source_name, source_url, summary, game:games(name)')
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

  const { error: updErr } = await supabase
    .from('news_items')
    .update({
      summary,
      why_it_matters,
      topics,
      is_rumor,
    })
    .eq('id', newsRow.id)

  if (updErr) throw updErr
}
