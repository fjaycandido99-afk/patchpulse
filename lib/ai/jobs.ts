'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type JobType = 'PATCH_SUMMARY' | 'NEWS_SUMMARY' | 'DISCOVER_SEASONAL' | 'RETURN_MATCH' | 'DISCOVER_RELEASES'

// Queue a new AI job
export async function queueAIJob(
  jobType: JobType,
  entityId: string
): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient()

  // Check if job already exists for this entity
  const { data: existing } = await supabase
    .from('ai_jobs')
    .select('id, status')
    .eq('job_type', jobType)
    .eq('entity_id', entityId)
    .in('status', ['pending', 'running'])
    .single()

  if (existing) {
    return { id: existing.id }
  }

  const { data, error } = await supabase
    .from('ai_jobs')
    .insert({
      job_type: jobType,
      entity_id: entityId,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to queue AI job:', error)
    return { error: 'Failed to queue AI job' }
  }

  return { id: data.id }
}
