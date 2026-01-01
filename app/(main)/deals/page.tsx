'use client'

import { useState, useEffect } from 'react'
import { Tag, Loader2, Percent, Info, RefreshCw, Clock } from 'lucide-react'
import { DealCard } from '@/components/deals/DealCard'

type Deal = {
  id: string
  title: string
  salePrice: number
  normalPrice: number
  savings: number
  store: string
  storeIcon: string | null
  steamAppId: string | null
  thumb: string
  dealUrl: string
  isUserGame: boolean
  expiresIn: string | null
  isBookmarked: boolean
}

type DealsResult = {
  deals: Deal[]
  total: number
  source: string
  isPro: boolean
}

export default function DealsPage() {
  const [deals, setDeals] = useState<DealsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [minDiscount, setMinDiscount] = useState(40)

  useEffect(() => {
    fetchDeals()
  }, [minDiscount])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => fetchDeals(true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [minDiscount])

  const fetchDeals = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const response = await fetch(`/api/deals?limit=50&minDiscount=${minDiscount}`)
      const data = await response.json()

      if (response.ok) {
        setDeals(data)
      }
    } catch (err) {
      console.error('Failed to fetch deals:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const userDeals = deals?.deals.filter(d => d.isUserGame) || []
  const otherDeals = deals?.deals.filter(d => !d.isUserGame) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Games on Sale
        </h1>
        <p className="mt-1 text-muted-foreground">
          Best Steam deals with {minDiscount}%+ off
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Min discount:</span>
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {[20, 40, 60, 80].map((discount) => (
              <button
                key={discount}
                onClick={() => setMinDiscount(discount)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  minDiscount === discount
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {discount}%+
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => fetchDeals()}
          disabled={loading}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : deals && deals.deals.length > 0 ? (
        <>
          {/* Your Games on Sale */}
          {userDeals.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Tag className="h-5 w-5 text-primary" />
                Your Games on Sale
                <span className="text-sm font-normal text-muted-foreground">
                  ({userDeals.length})
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                {userDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    id={deal.id}
                    title={deal.title}
                    salePrice={deal.salePrice}
                    normalPrice={deal.normalPrice}
                    savings={deal.savings}
                    store={deal.store}
                    storeIcon={deal.storeIcon}
                    steamAppId={deal.steamAppId}
                    thumb={deal.thumb}
                    dealUrl={deal.dealUrl}
                    isUserGame={deal.isUserGame}
                    expiresIn={deal.expiresIn}
                    isBookmarked={deal.isBookmarked}
                    isPro={deals?.isPro}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Deals */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Percent className="h-5 w-5 text-green-400" />
              {userDeals.length > 0 ? 'Other Deals' : 'All Deals'}
              <span className="text-sm font-normal text-muted-foreground">
                ({otherDeals.length})
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
              {otherDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  id={deal.id}
                  title={deal.title}
                  salePrice={deal.salePrice}
                  normalPrice={deal.normalPrice}
                  savings={deal.savings}
                  store={deal.store}
                  storeIcon={deal.storeIcon}
                  steamAppId={deal.steamAppId}
                  thumb={deal.thumb}
                  dealUrl={deal.dealUrl}
                  isUserGame={deal.isUserGame}
                  expiresIn={deal.expiresIn}
                  isBookmarked={deal.isBookmarked}
                  isPro={deals?.isPro}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-20 text-center">
          <Percent className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No deals found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try lowering the minimum discount or check back later
          </p>
        </div>
      )}

      {/* Info Card */}
      <section className="rounded-xl border border-border bg-card/50 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-500/10 p-2">
            <Info className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">About Steam Deals</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Deals are fetched directly from Steam and refresh automatically. Games you follow
              are shown first. Prices and discounts may vary by region.
              {deals?.deals.some(d => d.expiresIn) && (
                <span className="flex items-center gap-1 mt-2 text-xs">
                  <Clock className="h-3 w-3" /> Sale timers show when deals expire
                </span>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
