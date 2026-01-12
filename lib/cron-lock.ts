import { createAdminClient } from '@/lib/supabase/admin'

const DEFAULT_LOCK_DURATION_MINUTES = 10

/**
 * Acquire a lock for a cron job.
 * Returns true if lock was acquired, false if job is already running.
 */
export async function acquireCronLock(
  jobName: string,
  lockDurationMinutes = DEFAULT_LOCK_DURATION_MINUTES
): Promise<boolean> {
  const supabase = createAdminClient()
  const lockId = `${jobName}-${Date.now()}`

  try {
    // Clean up expired locks first
    await supabase
      .from('cron_locks')
      .delete()
      .lt('expires_at', new Date().toISOString())

    // Try to insert a new lock
    const expiresAt = new Date(Date.now() + lockDurationMinutes * 60 * 1000)
    const { error } = await supabase
      .from('cron_locks')
      .insert({
        job_name: jobName,
        locked_by: lockId,
        locked_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })

    if (error) {
      // Lock already exists (conflict on primary key)
      if (error.code === '23505') {
        console.log(`[CRON-LOCK] Job "${jobName}" is already running, skipping`)
        return false
      }
      console.error(`[CRON-LOCK] Error acquiring lock for "${jobName}":`, error)
      return false
    }

    console.log(`[CRON-LOCK] Acquired lock for "${jobName}", expires at ${expiresAt.toISOString()}`)
    return true
  } catch (err) {
    console.error(`[CRON-LOCK] Failed to acquire lock for "${jobName}":`, err)
    return false
  }
}

/**
 * Release a lock for a cron job.
 */
export async function releaseCronLock(jobName: string): Promise<void> {
  const supabase = createAdminClient()

  try {
    await supabase
      .from('cron_locks')
      .delete()
      .eq('job_name', jobName)

    console.log(`[CRON-LOCK] Released lock for "${jobName}"`)
  } catch (err) {
    console.error(`[CRON-LOCK] Failed to release lock for "${jobName}":`, err)
  }
}

/**
 * Wrapper to run a cron job with locking.
 * Automatically acquires and releases the lock.
 */
export async function withCronLock<T>(
  jobName: string,
  fn: () => Promise<T>,
  lockDurationMinutes = DEFAULT_LOCK_DURATION_MINUTES
): Promise<{ success: boolean; result?: T; skipped?: boolean }> {
  const acquired = await acquireCronLock(jobName, lockDurationMinutes)

  if (!acquired) {
    return { success: false, skipped: true }
  }

  try {
    const result = await fn()
    return { success: true, result }
  } finally {
    await releaseCronLock(jobName)
  }
}
