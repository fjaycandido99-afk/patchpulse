'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gamepad2, ExternalLink, Tag, Newspaper, FileText } from 'lucide-react'
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

type SavedContentProps = {
  deals: BookmarkedDeal[]
  patches: BookmarkedPatch[]
  news: BookmarkedNews[]
}

type FilterType = 'all' | 'deals' | 'patches' | 'news'

export function SavedContent({ deals, patches, news }: SavedContentProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filters: { id: FilterType; label: string; icon: typeof Tag; count: number }[] = [
    { id: 'all', label: 'All', icon: Gamepad2, count: deals.length + patches.length + news.length },
    { id: 'deals', label: 'Deals', icon: Tag, count: deals.length },
    { id: 'patches', label: 'Patches', icon: FileText, count: patches.length },
    { id: 'news', label: 'News', icon: Newspaper, count: news.length },
  ]

  const showDeals = filter === 'all' || filter === 'deals'
  const showPatches = filter === 'all' || filter === 'patches'
  const showNews = filter === 'all' || filter === 'news'

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
            {f.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === f.id ? 'bg-white/20' : 'bg-background'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
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
          (filter === 'news' && news.length === 0)
        ) && (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-muted-foreground">No saved {filter} yet</p>
            <Link
              href={filter === 'deals' ? '/deals' : filter === 'patches' ? '/patches' : '/news'}
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Browse {filter}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
