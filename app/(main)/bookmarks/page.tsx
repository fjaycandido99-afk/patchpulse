import { cookies } from 'next/headers'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import { getBookmarkedPatches, getBookmarkedNews, getBookmarkedDeals, getBookmarkedRecommendations } from './queries'
import { createClient } from '@/lib/supabase/server'
import { isGuestModeFromCookies } from '@/lib/guest'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { redirect } from 'next/navigation'
import { ProUpgradeCTA } from '@/components/ui/ProUpgradeCTA'
import { SavedContent } from '@/components/bookmarks/SavedContent'

const FREE_SAVED_LIMIT = 10

export default async function BookmarksPage() {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // User is only a guest if they have the cookie AND are not logged in
  const isGuest = !user && hasGuestCookie

  if (!user && !isGuest) {
    redirect('/login')
  }

  let isPro = false

  // For authenticated users, check their plan
  if (user) {
    const plan = await getUserPlan(user.id)
    isPro = plan === 'pro'
  }

  // Guests are still locked out completely
  if (isGuest) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
          <p className="mt-1 text-muted-foreground">
            Your bookmarked patches and news
          </p>
        </div>

        <ProUpgradeCTA
          title="Create an Account to Save"
          description="Sign up for free to save patches, news, and deals."
          features={[
            'Save up to 10 items for free',
            'Bookmark important patches for later',
            'Save news articles to read anytime',
            'Upgrade to Pro for unlimited saves',
          ]}
        />
      </div>
    )
  }

  const [patches, news, deals, recommendations] = await Promise.all([
    getBookmarkedPatches(),
    getBookmarkedNews(),
    getBookmarkedDeals(),
    getBookmarkedRecommendations(),
  ])

  const totalSaved = patches.length + news.length + deals.length + recommendations.length
  const hasBookmarks = totalSaved > 0
  const isAtLimit = !isPro && totalSaved >= FREE_SAVED_LIMIT
  const remainingSlots = isPro ? Infinity : Math.max(0, FREE_SAVED_LIMIT - totalSaved)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
          <p className="mt-1 text-muted-foreground">
            Your bookmarked patches, news, and deals
          </p>
        </div>
        {!isPro && (
          <div className="text-right">
            <p className="text-sm font-medium">
              {totalSaved} / {FREE_SAVED_LIMIT} saved
            </p>
            <p className="text-xs text-muted-foreground">
              {isAtLimit ? 'Limit reached' : `${remainingSlots} slots left`}
            </p>
          </div>
        )}
      </div>

      {/* Upgrade banner for free users at/near limit */}
      {!isPro && totalSaved >= FREE_SAVED_LIMIT - 2 && (
        <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${
          isAtLimit
            ? 'border-amber-500/50 bg-amber-500/10'
            : 'border-primary/30 bg-primary/5'
        }`}>
          <div className="flex items-center gap-3">
            <Crown className={`w-5 h-5 ${isAtLimit ? 'text-amber-500' : 'text-primary'}`} />
            <div>
              <p className="font-medium text-sm">
                {isAtLimit ? 'You\'ve reached your save limit' : 'Almost at your save limit'}
              </p>
              <p className="text-xs text-muted-foreground">
                Upgrade to Pro for unlimited saves
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Upgrade
          </Link>
        </div>
      )}

      {!hasBookmarks ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No saved items yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bookmark patches, news, and deals to save them here for later
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/deals"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse Deals
            </Link>
            <Link
              href="/patches"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Browse Patches
            </Link>
            <Link
              href="/news"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Browse News
            </Link>
          </div>
        </div>
      ) : (
        <SavedContent deals={deals} patches={patches} news={news} recommendations={recommendations} />
      )}
    </div>
  )
}
