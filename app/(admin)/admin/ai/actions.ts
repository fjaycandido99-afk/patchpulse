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
      .or('summary_tldr.is.null,summary_tldr.eq.Processing...')
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
