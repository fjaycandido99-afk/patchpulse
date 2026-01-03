'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gamepad2, ExternalLink, Tag, Newspaper, FileText, SlidersHorizontal, X, Check, Sparkles } from 'lucide-react'
import { MediaCard } from '@/components/media/MediaCard'
import { formatDate } from '@/lib/dates'

type BookmarkedPatch = {
  id: string
  patch: {
    id: string
    title: string
    published_at: string
    game: { name: string; cover_url: string | null } | null
  }
}

type BookmarkedNews = {
  id: string
  news: {
    id: string
    title: string
    published_at: string
    image_url: string | null
    game: { name: string; cover_url: string | null } | null
  }
}

type BookmarkedDeal = {
  id: string
  metadata: {
    title: string
    salePrice: number
    normalPrice: number
    savings: number
    store: string
    thumb: string
    dealUrl: string
    steamAppId: string | null
    savedAt: string
  }
}

type BookmarkedRecommendation = {
  id: string
  metadata: {
    game_id: string
    game_name: string
    slug: string
    cover_url: string | null
    reason: string
    why_now: string | null
    recommendation_type: 'return' | 'start' | 'finish' | 'discover'
    savedAt: string
  }
}

type SavedContentProps = {
  deals: BookmarkedDeal[]
  patches: BookmarkedPatch[]
  news: BookmarkedNews[]
  recommendations?: BookmarkedRecommendation[]
}

type FilterType = 'all' | 'deals' | 'patches' | 'news' | 'recommendations'

export function SavedContent({ deals, patches, news, recommendations = [] }: SavedContentProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const totalCount = deals.length + patches.length + news.length + recommendations.length

  const filters: { id: FilterType; label: string; icon: typeof Tag; count: number }[] = [
    { id: 'all', label: 'All Saved', icon: Gamepad2, count: totalCount },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles, count: recommendations.length },
    { id: 'deals', label: 'Deals', icon: Tag, count: deals.length },
    { id: 'patches', label: 'Patches', icon: FileText, count: patches.length },
    { id: 'news', label: 'News', icon: Newspaper, count: news.length },
  ]

  const showRecommendations = filter === 'all' || filter === 'recommendations'
  const showDeals = filter === 'all' || filter === 'deals'
  const showPatches = filter === 'all' || filter === 'patches'
  const showNews = filter === 'all' || filter === 'news'

  const currentFilter = filters.find(f => f.id === filter)

  return (
    <div className="space-y-6">
      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter !== 'all'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-white/5 text-muted-foreground hover:text-foreground border border-white/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {currentFilter?.label || 'Filter'}
          {filter !== 'all' && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              1
            </span>
          )}
        </button>

        {/* Filter Dropdown */}
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Dropdown Panel */}
            <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#0b1220] shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <span className="font-semibold text-sm">Filter by Type</span>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Options */}
              <div className="p-2">
                {filters.map((f) => {
                  const Icon = f.icon
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setFilter(f.id)
                        setIsFilterOpen(false)
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        filter === f.id
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{f.label}</span>
                        {f.count > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs text-muted-foreground">
                            {f.count}
                          </span>
                        )}
                      </div>
                      {filter === f.id && <Check className="w-4 h-4" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Recommendations Section */}
        {showRecommendations && recommendations.length > 0 && (
          <section className="space-y-4">
            {filter === 'all' && (
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Saved Recommendations
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ({recommendations.length})
                </span>
              </h2>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((item) => {
                const typeLabels = {
                  return: { label: 'Return', color: 'bg-blue-500/20 text-blue-400' },
                  start: { label: 'Start', color: 'bg-green-500/20 text-green-400' },
                  finish: { label: 'Finish', color: 'bg-purple-500/20 text-purple-400' },
                  discover: { label: 'Discover', color: 'bg-amber-500/20 text-amber-400' },
                }
                const typeInfo = typeLabels[item.metadata.recommendation_type]

                return (
                  <Link
                    key={item.id}
                    href={`/games/${item.metadata.slug}`}
                    className="group flex gap-3 p-3 rounded-xl border border-border hover:border-primary/50 bg-card transition-all"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {item.metadata.cover_url ? (
                        <Image
                          src={item.metadata.cover_url}
                          alt={item.metadata.game_name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {item.metadata.game_name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {item.metadata.reason}
                      </p>
                      {item.metadata.why_now && (
                        <p className="text-xs text-primary mt-1 line-clamp-1">
                          {item.metadata.why_now}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Deals Section */}
        {showDeals && deals.length > 0 && (
          <section className="space-y-4">
            {filter === 'all' && (
              <h2 className="text-lg font-semibold">
                Saved Deals
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({deals.length})
                </span>
              </h2>
            )}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
              {deals.map((item) => {
                const headerImage = item.metadata.steamAppId
                  ? `https://cdn.akamai.steamstatic.com/steam/apps/${item.metadata.steamAppId}/header.jpg`
                  : item.metadata.thumb

                return (
                  <a
                    key={item.id}
                    href={item.metadata.dealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card"
                  >
                    <div className="relative aspect-[460/215] w-full overflow-hidden bg-muted">
                      {headerImage ? (
                        <Image
                          src={headerImage}
                          alt={item.metadata.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Gamepad2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 z-10 rounded-lg bg-green-500 px-2 py-1 text-sm font-bold text-white shadow-lg">
                        -{item.metadata.savings}%
                      </span>
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-lg">
                          {item.metadata.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 bg-card">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through">${item.metadata.normalPrice.toFixed(2)}</span>
                        <span className="text-lg font-bold text-green-400">${item.metadata.salePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs">{item.metadata.store}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}

        {/* Patches Section */}
        {showPatches && patches.length > 0 && (
          <section className="space-y-4">
            {filter === 'all' && (
              <h2 className="text-lg font-semibold">
                Saved Patches
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({patches.length})
                </span>
              </h2>
            )}
            <div className="space-y-2">
              {patches.map((item) => (
                <MediaCard
                  key={item.id}
                  href={`/patches/${item.patch.id}`}
                  title={item.patch.title}
                  imageUrl={item.patch.game?.cover_url}
                  variant="horizontal"
                  game={{ name: item.patch.game?.name || 'Unknown' }}
                  metaText={formatDate(item.patch.published_at)}
                />
              ))}
            </div>
          </section>
        )}

        {/* News Section */}
        {showNews && news.length > 0 && (
          <section className="space-y-4">
            {filter === 'all' && (
              <h2 className="text-lg font-semibold">
                Saved News
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({news.length})
                </span>
              </h2>
            )}
            <div className="space-y-2">
              {news.map((item) => (
                <MediaCard
                  key={item.id}
                  href={`/news/${item.news.id}`}
                  title={item.news.title}
                  imageUrl={item.news.image_url || item.news.game?.cover_url}
                  variant="horizontal"
                  game={{ name: item.news.game?.name || 'General' }}
                  metaText={formatDate(item.news.published_at)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state for filtered view */}
        {filter !== 'all' && (
          (filter === 'deals' && deals.length === 0) ||
          (filter === 'patches' && patches.length === 0) ||
          (filter === 'news' && news.length === 0) ||
          (filter === 'recommendations' && recommendations.length === 0)
        ) && (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-muted-foreground">No saved {filter} yet</p>
            <Link
              href={
                filter === 'deals' ? '/deals' :
                filter === 'patches' ? '/patches' :
                filter === 'recommendations' ? '/insights' :
                '/news'
              }
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              {filter === 'recommendations' ? 'Get recommendations' : `Browse ${filter}`}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
