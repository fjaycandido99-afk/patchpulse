function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/50 ${className ?? ''}`}
    />
  )
}

function FilterDropdownSkeleton() {
  return (
    <Skeleton className="h-10 w-32 rounded-lg" />
  )
}

function FilterChipSkeleton({ width }: { width: string }) {
  return (
    <Skeleton className={`h-9 rounded-lg ${width}`} />
  )
}

function PatchCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-12 rounded-md flex-shrink-0" />
      </div>
      <Skeleton className="h-3 w-28" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-1.5 pt-1">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
    </div>
  )
}

export default function PatchesLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-3">
        <FilterDropdownSkeleton />
        <FilterDropdownSkeleton />
        <FilterDropdownSkeleton />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChipSkeleton width="w-20" />
        <FilterChipSkeleton width="w-28" />
        <FilterChipSkeleton width="w-24" />
        <FilterChipSkeleton width="w-32" />
        <FilterChipSkeleton width="w-20" />
      </div>

      {/* Patch cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <PatchCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
