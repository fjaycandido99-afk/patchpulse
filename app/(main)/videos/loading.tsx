import { Video } from 'lucide-react'

export default function VideosLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Video className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="h-7 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>

      {/* Trending skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-muted rounded animate-pulse" />
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="aspect-video rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>

      {/* Filter chips skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
