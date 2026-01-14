/**
 * UTM Parameter Tracking for Ad Analytics
 * Captures and stores UTM parameters from ad campaigns
 */

export type UTMParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  fbclid?: string // Facebook click ID
  referrer?: string
  landing_page?: string
  timestamp?: string
}

const UTM_STORAGE_KEY = 'patchpulse-utm'

/**
 * Capture UTM parameters from URL and store them
 * Call this on landing page load
 */
export function captureUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)

  const utm: UTMParams = {}

  // Standard UTM params
  if (params.get('utm_source')) utm.utm_source = params.get('utm_source')!
  if (params.get('utm_medium')) utm.utm_medium = params.get('utm_medium')!
  if (params.get('utm_campaign')) utm.utm_campaign = params.get('utm_campaign')!
  if (params.get('utm_term')) utm.utm_term = params.get('utm_term')!
  if (params.get('utm_content')) utm.utm_content = params.get('utm_content')!

  // Facebook click ID
  if (params.get('fbclid')) utm.fbclid = params.get('fbclid')!

  // Only store if we have at least one UTM param or fbclid
  if (Object.keys(utm).length === 0) return null

  // Add metadata
  utm.referrer = document.referrer || undefined
  utm.landing_page = window.location.pathname
  utm.timestamp = new Date().toISOString()

  // Store in sessionStorage (persists until browser closes)
  sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm))

  return utm
}

/**
 * Get stored UTM params
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null

  const stored = sessionStorage.getItem(UTM_STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Clear stored UTM params (call after successful conversion)
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(UTM_STORAGE_KEY)
}

/**
 * Check if user came from an ad
 */
export function isFromAd(): boolean {
  const utm = getStoredUTMParams()
  if (!utm) return false

  return !!(utm.fbclid || utm.utm_source || utm.utm_medium)
}

/**
 * Get attribution source for analytics
 */
export function getAttributionSource(): string {
  const utm = getStoredUTMParams()
  if (!utm) return 'direct'

  if (utm.fbclid) return 'facebook_ads'
  if (utm.utm_source) return utm.utm_source
  if (utm.referrer) {
    try {
      const url = new URL(utm.referrer)
      return url.hostname
    } catch {
      return 'referral'
    }
  }

  return 'unknown'
}
