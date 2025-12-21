'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Error</h1>
          <p className="text-zinc-400 max-w-md">
            Something went wrong in the admin panel. This could be a configuration issue.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="btn-primary px-6"
          >
            Try again
          </button>
          <a
            href="/admin"
            className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Admin dashboard
          </a>
        </div>

        {error.digest && (
          <p className="text-xs text-zinc-600">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
