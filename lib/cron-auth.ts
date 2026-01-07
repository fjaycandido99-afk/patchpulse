/**
 * Shared authentication for cron endpoints
 * Verifies requests come from Vercel cron or have valid CRON_SECRET
 */
export function verifyCronAuth(req: Request): boolean {
  // Vercel automatically adds this header for scheduled cron jobs
  const vercelCron = req.headers.get('x-vercel-cron')
  console.log('[CRON AUTH] x-vercel-cron header:', vercelCron)

  // Check x-vercel-cron header (any truthy value)
  if (vercelCron && vercelCron !== '0' && vercelCron !== 'false') {
    console.log('[CRON AUTH] Authorized via Vercel cron header')
    return true
  }

  // Also check user-agent for Vercel cron
  const userAgent = req.headers.get('user-agent') || ''
  if (userAgent.toLowerCase().includes('vercel')) {
    console.log('[CRON AUTH] Authorized via user-agent containing vercel')
    return true
  }

  // On Vercel production, allow requests that look like internal cron calls
  if (process.env.VERCEL === '1' && process.env.NODE_ENV === 'production') {
    // Check if it's a serverless function calling another (internal request)
    const host = req.headers.get('host') || ''
    if (host.includes('vercel.app') || host.includes('patchpulse')) {
      console.log('[CRON AUTH] Authorized as internal Vercel request')
      return true
    }
  }

  const cronSecretEnv = process.env.CRON_SECRET?.trim()

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
