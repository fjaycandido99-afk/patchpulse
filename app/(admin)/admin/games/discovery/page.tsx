import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Check, X, Clock, Sparkles, Gamepad2 } from 'lucide-react'
import { approveDiscovery, rejectDiscovery } from './actions'

type DiscoveryQueueItem = {
  id: string
  search_query: string
  discovered_data: {
    name: string
    slug: string
    cover_url: string | null
    platforms: string[]
    genre: string | null
    developer: string | null
    release_date: string | null
  }
  confidence: number
  status: string
  created_at: string
  requested_by: string | null
}

export default async function GameDiscoveryQueuePage() {
  const supabase = await createClient()

  // Check admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/home')

  // Fetch pending discoveries
  const { data: pendingItems } = await supabase
    .from('game_discovery_queue')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch recent approved/rejected
  const { data: recentItems } = await supabase
    .from('game_discovery_queue')
    .select('*')
    .neq('status', 'pending_review')
    .order('reviewed_at', { ascending: false })
    .limit(20)

  const items = (pendingItems || []) as DiscoveryQueueItem[]
  const recent = (recentItems || []) as DiscoveryQueueItem[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Game Discovery Queue
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve AI-discovered games
        </p>
      </div>

      {/* Pending Reviews */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-400" />
          Pending Review
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
            {items.length}
          </span>
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No pending discoveries</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <DiscoveryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {recent.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-2">
            {recent.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.status === 'approved'
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.status === 'approved' ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                  <span className="font-medium">{item.discovered_data.name}</span>
                  <span className="text-xs text-muted-foreground">
                    "{item.search_query}"
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function DiscoveryCard({ item }: { item: DiscoveryQueueItem }) {
  const data = item.discovered_data
  const confidenceColor =
    item.confidence >= 0.7 ? 'text-green-400' :
    item.confidence >= 0.5 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex gap-4">
        {/* Cover */}
        <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {data.cover_url ? (
            <img
              src={data.cover_url}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg">{data.name}</h3>
              <p className="text-sm text-muted-foreground">/{data.slug}</p>
            </div>
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {Math.round(item.confidence * 100)}% confidence
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {data.platforms?.map((p) => (
              <span key={p} className="px-2 py-0.5 rounded bg-muted">{p}</span>
            ))}
            {data.genre && (
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary">{data.genre}</span>
            )}
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            {data.developer && <span>By {data.developer}</span>}
            {data.release_date && <span> • {data.release_date}</span>}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Searched: "{item.search_query}"
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <form action={approveDiscovery.bind(null, item.id)} className="flex-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 font-medium transition-colors"
          >
            <Check className="h-4 w-4" />
            Approve & Add
          </button>
        </form>
        <form action={async () => {
          'use server'
          const { rejectDiscovery } = await import('./actions')
          await rejectDiscovery(item.id)
        }} className="flex-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium transition-colors"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </form>
      </div>
    </div>
  )
}
