import Image from 'next/image'
import { getSeasonalEvents, getPendingEvents, getActiveEvents, getGamesForDropdown } from './actions'
import { ApproveButton, RejectButton } from './EventButtons'
import { CreateEventForm } from './CreateEventForm'
import { TriggerDiscoveryForm } from './TriggerDiscoveryForm'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function EventTypeTag({ type }: { type: string }) {
  const colors: Record<string, string> = {
    winter: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    halloween: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    summer: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    spring: 'bg-green-500/20 text-green-400 border-green-500/30',
    anniversary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    sale: 'bg-red-500/20 text-red-400 border-red-500/30',
    collaboration: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    update: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    launch: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    esports: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    custom: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  }

  const colorClass = colors[type] || colors.custom

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
      {type}
    </span>
  )
}

function ConfidenceBar({ score }: { score: number }) {
  const percentage = Math.round(score * 100)
  const colorClass = score >= 0.8 ? 'bg-green-500' : score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400">{percentage}%</span>
    </div>
  )
}

function EventCard({
  event,
  showActions = false,
}: {
  event: any
  showActions?: boolean
}) {
  const isActive = event.is_auto_approved || event.is_admin_approved
  const today = new Date().toISOString().split('T')[0]
  const isCurrentlyActive = isActive && event.start_date <= today && event.end_date >= today

  return (
    <div className={`rounded-lg border ${isCurrentlyActive ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'} p-4`}>
      <div className="flex gap-4">
        {/* Image preview */}
        <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-zinc-800">
          {event.cover_url || event.games?.cover_url ? (
            <Image
              src={event.cover_url || event.games?.cover_url}
              alt={event.event_name}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
              ?
            </div>
          )}
          {event.cover_url && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          )}
          {event.cover_url && (
            <span className="absolute bottom-1 left-1 text-[10px] text-white/80 font-medium">
              Seasonal
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-white truncate">{event.event_name}</h3>
              <p className="text-sm text-zinc-400 truncate">{event.games?.name || 'Unknown Game'}</p>
            </div>
            <EventTypeTag type={event.event_type} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
            <ConfidenceBar score={event.confidence_score} />
          </div>

          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-xs text-blue-400 hover:underline truncate block"
            >
              {event.source_url}
            </a>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-start gap-1">
            <ApproveButton eventId={event.id} />
            <RejectButton eventId={event.id} />
          </div>
        )}
      </div>

      {/* Status badges */}
      <div className="mt-3 flex items-center gap-2">
        {isCurrentlyActive && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            Currently Active
          </span>
        )}
        {event.is_auto_approved && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Auto-approved
          </span>
        )}
        {event.is_admin_approved && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Admin-approved
          </span>
        )}
      </div>
    </div>
  )
}

export default async function SeasonalAdminPage() {
  const [pendingEvents, activeEvents, allEvents, games] = await Promise.all([
    getPendingEvents(),
    getActiveEvents(),
    getSeasonalEvents(),
    getGamesForDropdown(),
  ])

  return (
    <div className="space-y-8">
      {/* Pending Review */}
      <section>
        <h1 className="text-xl font-semibold mb-4">
          Pending Review ({pendingEvents.length})
        </h1>

        {pendingEvents.length === 0 ? (
          <p className="text-sm text-zinc-500">No events pending review.</p>
        ) : (
          <div className="space-y-3">
            {pendingEvents.map((event) => (
              <EventCard key={event.id} event={event} showActions />
            ))}
          </div>
        )}
      </section>

      {/* Currently Active */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Currently Active ({activeEvents.length})
        </h2>

        {activeEvents.length === 0 ? (
          <p className="text-sm text-zinc-500">No seasonal events currently active.</p>
        ) : (
          <div className="space-y-3">
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Manual Creation */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Create Manual Event</h2>
        <CreateEventForm games={games} />
      </section>

      {/* Trigger Discovery */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Trigger Discovery Scan</h2>
        <TriggerDiscoveryForm games={games} />
      </section>

      {/* All Events */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          All Events ({allEvents.length})
        </h2>

        {allEvents.length === 0 ? (
          <p className="text-sm text-zinc-500">No seasonal events discovered yet.</p>
        ) : (
          <div className="space-y-3">
            {allEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
