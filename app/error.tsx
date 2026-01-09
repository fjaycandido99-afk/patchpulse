'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report error to Sentry
    Sentry.captureException(error)
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/home"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
