'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const errorMessages: Record<string, { title: string; description: string }> = {
    auth_error: {
      title: 'Authentication Error',
      description: message || 'Something went wrong during authentication.',
    },
    access_denied: {
      title: 'Access Denied',
      description: 'You do not have permission to access this resource.',
    },
    expired_token: {
      title: 'Link Expired',
      description: 'This verification link has expired. Please request a new one.',
    },
    invalid_request: {
      title: 'Invalid Request',
      description: 'The authentication request was invalid.',
    },
  }

  const errorInfo = errorMessages[error || 'auth_error'] || errorMessages.auth_error

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{errorInfo.title}</h1>
          <p className="text-muted-foreground">{errorInfo.description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
