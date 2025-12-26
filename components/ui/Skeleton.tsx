'use client'

import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

export function HeroCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* Image area */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] w-full">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
        {/* Badges row */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-8 w-3/4 mb-2" />

        {/* Summary */}
        <Skeleton className="h-4 w-full max-w-2xl mb-1" />
        <Skeleton className="h-4 w-2/3 max-w-xl" />

        {/* Impact meters */}
        <div className="mt-4 p-3 rounded-lg bg-black/40 w-fit space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-44" />
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function MediaCardSkeleton({ variant = 'vertical' }: { variant?: 'vertical' | 'horizontal' }) {
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] w-28 flex-shrink-0 overflow-hidden rounded-xl sm:w-36">
          <Skeleton className="absolute inset-0 rounded-xl" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center py-1">
          {/* Badges */}
          <div className="mb-2 flex gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-5 w-3/4" />

          {/* Summary */}
          <Skeleton className="h-4 w-full mt-2" />

          {/* Meta */}
          <Skeleton className="h-3 w-1/2 mt-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="mb-2 flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-2/3" />

        {/* Summary */}
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-4/5 mt-1" />

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BacklogCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
      {/* Game image */}
      <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-24 mt-2" />
      </div>
    </div>
  )
}

export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function NavItemSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-3">
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-3 w-10" />
    </div>
  )
}

export function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MediaCardSkeleton />
        <MediaCardSkeleton />
      </div>
    </div>
  )
}

export function HomeFeedSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 page-enter">
      {/* For You badge */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Hero */}
      <HeroCardSkeleton />

      {/* Two column layout */}
      <div className="lg:flex lg:gap-8">
        <div className="flex-1 space-y-6 sm:space-y-8">
          {/* Patches section */}
          <SectionSkeleton />

          {/* News section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              <MediaCardSkeleton variant="horizontal" />
              <MediaCardSkeleton variant="horizontal" />
              <MediaCardSkeleton variant="horizontal" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
