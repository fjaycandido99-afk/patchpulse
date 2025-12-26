'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DevPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Not available in production</p>
      </div>
    )
  }

  const grantPro = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/dev/grant-pro', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage('Pro access granted! Redirecting to Insights...')
        setTimeout(() => router.push('/insights'), 1500)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to grant Pro access')
      }
    } catch {
      setStatus('error')
      setMessage('Request failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Development Tools</h1>

      <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full space-y-4">
        <h2 className="text-lg font-semibold">Grant Pro Access</h2>
        <p className="text-zinc-400 text-sm">
          Click below to grant your account Pro access for 365 days. This allows testing of AI features and unlimited limits.
        </p>

        <button
          onClick={grantPro}
          disabled={status === 'loading' || status === 'success'}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {status === 'loading' ? 'Granting...' : status === 'success' ? 'Granted!' : 'Grant Pro Access'}
        </button>

        {message && (
          <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="text-zinc-500 text-sm">
        Development only - this page is not accessible in production
      </div>
    </div>
  )
}
