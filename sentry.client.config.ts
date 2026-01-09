import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance
  
  // Session replay for debugging (disabled to save quota)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === "production",
  
  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Network errors (user's connection)
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // User cancelled
    "AbortError",
    "The operation was aborted",
  ],
  
  beforeSend(event) {
    // Don't send errors from development
    if (process.env.NODE_ENV !== "production") {
      return null
    }
    return event
  },
})
