/**
 * Simple in-memory rate limiter for API routes
 * Note: This works per-instance in serverless. For distributed rate limiting,
 * use Upstash Redis or similar service.
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

// In-memory store (per serverless instance)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000 // 1 minute
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

type RateLimitConfig = {
  limit: number        // Max requests
  windowMs: number     // Time window in milliseconds
  identifier?: string  // Custom identifier (default: IP)
}

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a request
 * @param req - The incoming request
 * @param config - Rate limit configuration
 * @returns Result with success status and limit info
 */
export function checkRateLimit(
  req: Request,
  config: RateLimitConfig
): RateLimitResult {
  cleanup()

  const { limit, windowMs, identifier } = config
  const now = Date.now()

  // Get identifier (IP address or custom)
  const ip = identifier || getClientIP(req) || 'unknown'
  const key = `ratelimit:${ip}`

  // Get or create entry
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new window
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit

  return {
    success,
    limit,
    remaining,
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP from request headers
 */
function getClientIP(req: Request): string | null {
  // Vercel/Cloudflare headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return null
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toString(),
  }
}

/**
 * Create a rate-limited response (429 Too Many Requests)
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...rateLimitHeaders(result),
        'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
      },
    }
  )
}

// Preset configurations for common use cases
export const RATE_LIMITS = {
  // Strict: 10 requests per minute (for expensive operations)
  strict: { limit: 10, windowMs: 60000 },

  // Standard: 30 requests per minute
  standard: { limit: 30, windowMs: 60000 },

  // Relaxed: 60 requests per minute
  relaxed: { limit: 60, windowMs: 60000 },

  // Search: 20 requests per minute
  search: { limit: 20, windowMs: 60000 },

  // Auth: 5 attempts per minute
  auth: { limit: 5, windowMs: 60000 },
} as const
