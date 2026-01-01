'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { processAIJobsBatch } from './worker'

// Get AI job statistics
export async function getAIJobStats() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('ai_jobs')
      .select('status')

    if (error) {
      // Table might not exist
      if (error.code === '42P01') {
        return { error: 'ai_jobs table does not exist. Run the supabase-ai-jobs.sql script first.' }
      }
      return { error: error.message }
    }

    const stats = {
      pending: 0,
      running: 0,
      done: 0,
      failed: 0,
    }

    for (const job of data || []) {
      if (job.status in stats) {
        stats[job.status as keyof typeof stats]++
      }
    }

    return stats
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Queue AI jobs for all patches/news that have raw text but no AI summary
export async function queueAllPendingAIJobs() {
  try {
    const supabase = createAdminClient()

    let patchJobs = 0
    let newsJobs = 0

    // Find patches with raw_text but placeholder summary
    const { data: patches } = await supabase
      .from('patch_notes')
      .select('id, raw_text, summary_tldr')
      .or('summary_tldr.is.null,summary_tldr.eq.Processing...,summary_tldr.eq.AI summary pending...')
      .not('raw_text', 'is', null)

    if (patches && patches.length > 0) {
      for (const patch of patches) {
        if (patch.raw_text && patch.raw_text.trim()) {
          const { error } = await supabase
            .from('ai_jobs')
            .upsert({
              job_type: 'PATCH_SUMMARY',
              entity_id: patch.id,
              status: 'pending',
            }, {
              onConflict: 'job_type,entity_id',
              ignoreDuplicates: true,
            })

          if (!error) patchJobs++
        }
      }
    }

    // Find news with raw text (stored in summary) but no why_it_matters
    const { data: news } = await supabase
      .from('news_items')
      .select('id, summary, why_it_matters')
      .is('why_it_matters', null)
      .not('summary', 'is', null)

    if (news && news.length > 0) {
      for (const item of news) {
        if (item.summary && item.summary.length > 100) {
          // Only queue if summary looks like raw text (long enough)
          const { error } = await supabase
            .from('ai_jobs')
            .upsert({
              job_type: 'NEWS_SUMMARY',
              entity_id: item.id,
              status: 'pending',
            }, {
              onConflict: 'job_type,entity_id',
              ignoreDuplicates: true,
            })

          if (!error) newsJobs++
        }
      }
    }

    return { patchJobs, newsJobs }
  } catch (err) {
    // Check for table not existing
    if (err instanceof Error && err.message.includes('42P01')) {
      return { error: 'ai_jobs table does not exist. Run the supabase-ai-jobs.sql script first.' }
    }
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Manually trigger cron processing
export async function triggerCronManually() {
  try {
    const result = await processAIJobsBatch(5)
    return result
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Get recent failed jobs with error messages
export async function getFailedJobs() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('ai_jobs')
      .select('id, job_type, entity_id, error_message, attempts, created_at')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return { error: error.message }
    }

    return { jobs: data || [] }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Retry failed jobs by resetting them to pending
export async function retryFailedJobs() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('ai_jobs')
      .update({ status: 'pending', attempts: 0, error_message: null })
      .eq('status', 'failed')
      .select('id')

    if (error) {
      return { error: error.message }
    }

    return { retriedCount: data?.length || 0 }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Queue patches for diff_stats backfill
export async function backfillDiffStats(daysBack: number = 30, limit: number = 50) {
  try {
    const supabase = createAdminClient()

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    // Find patches that don't have diff_stats yet
    const { data: patches, error: fetchError } = await supabase
      .from('patch_notes')
      .select('id, title')
      .is('diff_stats', null)
      .not('raw_text', 'is', null)
      .gte('published_at', cutoffDate.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit)

    if (fetchError) {
      // Check if diff_stats column doesn't exist
      if (fetchError.message.includes('diff_stats')) {
        return { error: 'diff_stats column not found. Run the supabase-diff-stats-migration.sql script first.' }
      }
      return { error: fetchError.message }
    }

    if (!patches || patches.length === 0) {
      return { queued: 0, message: 'No patches need diff_stats backfill' }
    }

    // Queue AI jobs for these patches
    let queued = 0
    for (const patch of patches) {
      const { error: queueError } = await supabase
        .from('ai_jobs')
        .upsert(
          {
            job_type: 'PATCH_SUMMARY',
            entity_id: patch.id,
            status: 'pending',
          },
          {
            onConflict: 'job_type,entity_id',
            ignoreDuplicates: true,
          }
        )

      if (!queueError) {
        queued++
      }
    }

    return { queued, total: patches.length }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
