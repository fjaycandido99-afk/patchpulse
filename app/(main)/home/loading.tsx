function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/50 ${className ?? ''}`}
    />
  )
}

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
      <div className="p-6 sm:p-8 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4 sm:h-10" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

function MediaCardSkeleton() {
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
        <div className="flex gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

function HorizontalCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-3 sm:p-4">
      <Skeleton className="h-20 w-16 flex-shrink-0 rounded-md sm:h-24 sm:w-20" />
      <div className="flex-1 space-y-2 py-1">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

function BacklogCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-24 w-20 flex-shrink-0 rounded-lg" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

function ReleaseRadarSkeleton() {
  return (
    <div className="space-y-3">
      <SectionHeaderSkeleton />
      <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-0"
          >
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomeLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero skeleton */}
      <section>
        <HeroSkeleton />
      </section>

      <div className="lg:flex lg:gap-8">
        <div className="flex-1 space-y-6 sm:space-y-8">
          {/* Biggest Changes section */}
          <section className="space-y-3">
            <SectionHeaderSkeleton />
            <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide sm:mx-0 sm:px-0 sm:overflow-visible">
              <div className="flex gap-4 sm:grid sm:grid-cols-2 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-72 flex-shrink-0 sm:w-auto">
                    <MediaCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest Headlines section */}
          <section className="space-y-3">
            <SectionHeaderSkeleton />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <HorizontalCardSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Continue Playing section */}
          <section className="space-y-3">
            <SectionHeaderSkeleton />
            <BacklogCardSkeleton />
          </section>

          {/* Mobile Release Radar */}
          <div className="lg:hidden">
            <ReleaseRadarSkeleton />
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-6">
            <ReleaseRadarSkeleton />
          </div>
        </aside>
      </div>
    </div>
  )
}
