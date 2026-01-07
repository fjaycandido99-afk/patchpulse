/**
 * Shared authentication for cron endpoints
 * Verifies requests come from Vercel cron or have valid CRON_SECRET
 */
export function verifyCronAuth(req: Request): boolean {
  // Vercel automatically adds this header for scheduled cron jobs
  const vercelCron = req.headers.get('x-vercel-cron')
  console.log('[CRON AUTH] x-vercel-cron header:', vercelCron)

  if (vercelCron === '1' || vercelCron === 'true') {
    console.log('[CRON AUTH] Authorized via Vercel cron header')
    return true
  }

  // Also check user-agent for Vercel cron
  const userAgent = req.headers.get('user-agent') || ''
  if (userAgent.includes('vercel-cron')) {
    console.log('[CRON AUTH] Authorized via user-agent')
    return true
  }

  const cronSecretEnv = process.env.CRON_SECRET?.trim()

  // No secret configured = allow all (for Vercel cron which doesn't use secret)
  if (!cronSecretEnv) {
    console.log('[CRON AUTH] No CRON_SECRET configured, checking if request looks like Vercel')
    // If we're in production on Vercel, assume cron requests are valid
    if (process.env.VERCEL === '1') {
      console.log('[CRON AUTH] Running on Vercel, allowing request')
      return true
    }
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
