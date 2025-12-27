'use client'

import { useState } from 'react'
import Link from 'next/link'
import { queueAllPendingAIJobs, getAIJobStats, triggerCronManually } from './actions'

export default function AIAdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    pending: number
    running: number
    done: number
    failed: number
  } | null>(null)

  async function handleBackfill() {
    setLoading(true)
    setMessage(null)
    try {
      const result = await queueAllPendingAIJobs()
      if ('error' in result) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage(`Queued ${result.patchJobs} patch jobs and ${result.newsJobs} news jobs`)
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    setLoading(false)
  }

  async function handleRefreshStats() {
    setLoading(true)
    try {
      const result = await getAIJobStats()
      if ('error' in result) {
        setMessage(`Error: ${result.error}`)
      } else {
        setStats(result)
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    setLoading(false)
  }

  async function handleTriggerCron() {
    setLoading(true)
    setMessage(null)
    try {
      const result = await triggerCronManually()
      if ('error' in result) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage(`Processed ${result.processed} jobs`)
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Processing</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage AI job queue and processing</p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Back to Admin
        </Link>
      </header>

      {message && (
        <div className={`rounded-lg p-4 ${message.startsWith('Error') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* Stats Section */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Job Statistics</h2>
          <button
            onClick={handleRefreshStats}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            Refresh
          </button>
        </div>
        {stats ? (
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Pending" value={stats.pending} color="yellow" />
            <StatCard label="Running" value={stats.running} color="blue" />
            <StatCard label="Done" value={stats.done} color="green" />
            <StatCard label="Failed" value={stats.failed} color="red" />
          </div>
        ) : (
          <p className="text-zinc-400 text-sm">Click refresh to load stats</p>
        )}
      </section>

      {/* Actions Section */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div>
              <h3 className="font-medium">Queue Pending Items</h3>
              <p className="text-sm text-zinc-400">
                Find patches/news with raw text that haven&apos;t been processed
              </p>
            </div>
            <button
              onClick={handleBackfill}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Queue Jobs'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div>
              <h3 className="font-medium">Process Queue Now</h3>
              <p className="text-sm text-zinc-400">
                Manually trigger AI processing (normally runs every 5 min)
              </p>
            </div>
            <button
              onClick={handleTriggerCron}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Process Now'}
            </button>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold mb-4">How AI Processing Works</h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>1. Patches/news are created with raw text via admin or scrapers</li>
          <li>2. AI jobs are queued automatically for new items</li>
          <li>3. Cron runs every 5 minutes to process pending jobs</li>
          <li>4. AI generates summaries, key changes, insights, and tags</li>
          <li>5. Failed jobs are retried up to 3 times</li>
        </ul>
      </section>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    yellow: 'bg-yellow-500/20 text-yellow-300',
    blue: 'bg-blue-500/20 text-blue-300',
    green: 'bg-green-500/20 text-green-300',
    red: 'bg-red-500/20 text-red-300',
  }

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  )
}
