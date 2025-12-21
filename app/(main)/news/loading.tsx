function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/50 ${className ?? ''}`}
    />
  )
}

function FilterBarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Dropdowns row */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      {/* Topic chips */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-18 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  )
}

function NewsCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-10 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      {/* Filters */}
      <FilterBarSkeleton />

      {/* News cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  )
}
