'use client'

import { useState, useEffect } from 'react'
import { Loader2, Percent } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { DealsCarousel } from '@/components/deals/DealsCarousel'

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

type DealsSectionProps = {
  initialDeals?: Deal[]
  isPro?: boolean
}

export function DealsSection({ initialDeals, isPro = true }: DealsSectionProps) {
  const [deals, setDeals] = useState<DealsResult | null>(
    initialDeals ? { deals: initialDeals, total: initialDeals.length, source: 'Steam', isPro } : null
  )
  const [dealsLoading, setDealsLoading] = useState(!initialDeals)
  const [minDiscount, setMinDiscount] = useState(20)

  // Only fetch on mount if no initial deals provided
  useEffect(() => {
    if (!initialDeals) {
      fetchDeals()
    }
  }, [])

  // Fetch when discount filter changes (if user changes it)
  useEffect(() => {
    // Only refetch if filter changed from default and we have initial deals
    if (minDiscount !== 20) {
      fetchDeals()
    }
  }, [minDiscount])

  // Auto-refresh deals every 5 minutes (silent)
  useEffect(() => {
    const interval = setInterval(() => fetchDeals(true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [minDiscount])

  const fetchDeals = async (silent = false) => {
    if (!silent) setDealsLoading(true)
    try {
      const response = await fetch(`/api/deals?limit=100&minDiscount=${minDiscount}`)
      const data = await response.json()

      if (response.ok) {
        setDeals(data)
      }
    } catch (err) {
      console.error('Failed to fetch deals:', err)
    } finally {
      if (!silent) setDealsLoading(false)
    }
  }

  return (
    <section>
      <SectionHeader title="Games on Sale" href="/deals" />

      {/* Discount Filter */}
      <div className="flex items-center gap-2 mt-3 mb-3">
        <span className="text-xs text-muted-foreground">Min discount:</span>
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {[20, 40, 60, 80].map((discount) => (
            <button
              key={discount}
              onClick={() => setMinDiscount(discount)}
              className={`px-2 py-0.5 rounded-md text-xs transition-colors ${
                minDiscount === discount
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {discount}%+
            </button>
          ))}
        </div>
        {deals && (
          <span className="text-xs text-muted-foreground ml-auto">
            {deals.deals.length} deals
          </span>
        )}
      </div>

      <div>
        {dealsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : deals && deals.deals.length > 0 ? (
          <DealsCarousel deals={deals.deals} autoPlayInterval={4000} isPro={deals.isPro} />
        ) : (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <Percent className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No deals found at the moment</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Try lowering the minimum discount</p>
          </div>
        )}
      </div>
    </section>
  )
}
