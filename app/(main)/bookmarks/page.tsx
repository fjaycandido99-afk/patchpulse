import Link from 'next/link'
import { getBookmarkedPatches, getBookmarkedNews, getBookmarkedDeals } from './queries'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { redirect } from 'next/navigation'
import { ProUpgradeCTA } from '@/components/ui/ProUpgradeCTA'
import { SavedContent } from '@/components/bookmarks/SavedContent'

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const plan = await getUserPlan(user.id)
  const isPro = plan === 'pro'

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
          <p className="mt-1 text-muted-foreground">
            Your bookmarked patches and news
          </p>
        </div>

        <ProUpgradeCTA
          title="Unlock Saved Items"
          description="Save patches, news articles, and deals with Pro."
          features={[
            'Bookmark important patches for later',
            'Save news articles to read anytime',
            'Track game deals you want to buy',
            'Never miss critical updates',
          ]}
        />
      </div>
    )
  }

  const [patches, news, deals] = await Promise.all([
    getBookmarkedPatches(),
    getBookmarkedNews(),
    getBookmarkedDeals(),
  ])

  const hasBookmarks = patches.length > 0 || news.length > 0 || deals.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
        <p className="mt-1 text-muted-foreground">
          Your bookmarked patches, news, and deals
        </p>
      </div>

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
        <SavedContent deals={deals} patches={patches} news={news} />
      )}
    </div>
  )
}
