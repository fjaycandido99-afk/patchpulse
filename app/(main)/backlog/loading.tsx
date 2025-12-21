function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/50 ${className ?? ''}`}
    />
  )
}

function AddToPanelSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-32 rounded-lg" />
      </div>
    </div>
  )
}

function BacklogCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

function BacklogSectionSkeleton({ count }: { count: number }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(count)].map((_, i) => (
          <BacklogCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}

function EmptySectionSkeleton() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-8" />
      </div>
      <Skeleton className="h-4 w-40" />
    </section>
  )
}

export default function BacklogLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Add to backlog panel */}
      <AddToPanelSkeleton />

      {/* Backlog sections */}
      <div className="space-y-8">
        {/* Playing - show 2 cards */}
        <BacklogSectionSkeleton count={2} />

        {/* Paused - show 1 card */}
        <BacklogSectionSkeleton count={1} />

        {/* Backlog - show 3 cards */}
        <BacklogSectionSkeleton count={3} />

        {/* Finished - empty */}
        <EmptySectionSkeleton />

        {/* Dropped - empty */}
        <EmptySectionSkeleton />
      </div>
    </div>
  )
}
