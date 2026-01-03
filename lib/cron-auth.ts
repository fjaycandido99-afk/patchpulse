/**
 * Shared authentication for cron endpoints
 * Verifies requests come from Vercel cron or have valid CRON_SECRET
 */
export function verifyCronAuth(req: Request): boolean {
  // Vercel automatically adds this header for scheduled cron jobs
  const vercelCron = req.headers.get('x-vercel-cron')
  if (vercelCron === '1') {
    return true
  }

  const cronSecretEnv = process.env.CRON_SECRET?.trim()

  // No secret configured = reject all non-Vercel requests
  if (!cronSecretEnv) {
    console.warn('[CRON AUTH] CRON_SECRET not configured')
    return false
  }

  // Check Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim()
    if (token === cronSecretEnv) {
      return true
    }
  }

  // Check x-cron-secret header
  const cronSecret = req.headers.get('x-cron-secret')?.trim()
  if (cronSecret === cronSecretEnv) {
    return true
  }

  // Check query param (for manual testing)
  const url = new URL(req.url)
  const querySecret = url.searchParams.get('secret')?.trim()
  if (querySecret === cronSecretEnv) {
    return true
  }

  return false
}
