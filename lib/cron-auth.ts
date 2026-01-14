/**
 * Shared authentication for cron endpoints
 * Verifies requests come from Vercel cron or have valid CRON_SECRET
 */
export function verifyCronAuth(req: Request): boolean {
  // Vercel automatically sets x-vercel-cron header to "1" for scheduled cron jobs
  // Only accept the exact value "1" - not any truthy value
  const vercelCron = req.headers.get('x-vercel-cron')
  if (vercelCron === '1') {
    return true
  }

  // Get CRON_SECRET from environment
  const cronSecretEnv = process.env.CRON_SECRET?.trim()
  if (!cronSecretEnv) {
    // No secret configured - deny all non-Vercel requests
    return false
  }

  // Check Authorization header (Bearer token) - preferred method
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim()
    if (token && token === cronSecretEnv) {
      return true
    }
  }

  // Check x-cron-secret header - alternative method
  const cronSecret = req.headers.get('x-cron-secret')?.trim()
  if (cronSecret && cronSecret === cronSecretEnv) {
    return true
  }

  // NOTE: Query param auth removed for security (secrets in URLs can be logged)
  // Use Authorization header or x-cron-secret header instead

  return false
}
