import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { isGuestModeFromCookies } from '@/lib/guest'
import { MobileNav } from '@/components/layout/MobileNav'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
import { SearchBar } from '@/components/layout/SearchBar'
import { ProfileAvatar } from '@/components/layout/ProfileAvatar'
import { GuestBanner } from '@/components/auth/GuestBanner'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { LatestPatchesBell } from '@/components/patches/LatestPatchesBell'
import { ToastProvider } from '@/components/notifications/ToastProvider'
import { ToastUIProvider } from '@/components/ui/toast'
import { SpotlightProvider } from '@/components/games'
import { DealSpotlightProvider } from '@/components/deals/DealSpotlightProvider'
import { GuestProvider } from '@/components/auth/GuestProvider'
import { getSidebarCounts } from '@/lib/sidebar-data'
import { getNotificationStats } from '@/lib/notifications'
import { getLatestPatchesStats } from '@/lib/patches-stats'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getSession()
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  // User is only a guest if they have the guest cookie AND are not logged in
  // Logged-in users are never guests, even if they have a leftover guest cookie
  const isGuest = !user && hasGuestCookie

  // If not logged in and not a guest, redirect to login
  if (!user && !isGuest) {
    redirect('/login')
  }

  let userProfile = {
    displayName: null as string | null,
    avatarUrl: null as string | null,
  }
  let sidebarCounts = null
  let notificationStats = { unread_count: 0, high_priority_count: 0 }
  let patchesStats = { total_today: 0, high_impact_count: 0 }

  // For authenticated users, fetch profile and stats
  if (user) {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed, display_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (error || !profile || !profile.onboarding_completed) {
      redirect('/onboarding')
    }

    userProfile = {
      displayName: profile.display_name as string | null,
      avatarUrl: profile.avatar_url as string | null,
    }

    // Fetch sidebar counts and notification stats for live indicators
    const [counts, notifStats, patchStats] = await Promise.all([
      getSidebarCounts(),
      getNotificationStats(),
      getLatestPatchesStats(),
    ])
    sidebarCounts = counts
    notificationStats = notifStats
    patchesStats = patchStats
  }

  // Convert sidebar counts to mobile nav badges
  const navBadges: Record<string, { count?: number; dot?: boolean }> = {}
  if (sidebarCounts?.newPatchesToday && sidebarCounts.newPatchesToday > 0) {
    navBadges['/patches'] = { count: sidebarCounts.newPatchesToday }
  }
  if (sidebarCounts?.newNewsToday && sidebarCounts.newNewsToday > 0) {
    navBadges['/news'] = { count: sidebarCounts.newNewsToday }
  }
  if (sidebarCounts?.unreadBacklog && sidebarCounts.unreadBacklog > 0) {
    navBadges['/backlog'] = { dot: true }
  }

  // For guests, use a placeholder ID
  const userId = user?.id || 'guest'

  return (
    <GuestProvider initialIsGuest={isGuest}>
      <ToastProvider userId={userId}>
        <ToastUIProvider>
        <SpotlightProvider>
        <DealSpotlightProvider>
          <div className="flex min-h-screen">
            <DesktopSidebar counts={sidebarCounts} notificationStats={notificationStats} patchesStats={patchesStats} isGuest={isGuest} />

          <main className="flex-1 pb-20 md:ml-64 md:pb-0">
            {/* Guest banner - shown at top for guest users */}
            {isGuest && <GuestBanner />}

            {/* Mobile header with search - Apple Music/App Store style, fixed for edge-to-edge */}
            <header className="fixed inset-x-0 top-0 z-40 md:hidden bg-[rgba(10,15,30,0.85)] backdrop-blur-xl border-b border-white/10" style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href="/home" className="text-lg font-bold tracking-tight flex-shrink-0 hover:opacity-80 transition-opacity">
                    PatchPulse
                  </Link>
                  {!isGuest && (
                    <div className="flex items-center gap-1 ml-1">
                      <LatestPatchesBell initialStats={patchesStats} size="sm" />
                      <NotificationBell initialStats={notificationStats} size="sm" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <SearchBar className="w-auto" />
                  <ProfileAvatar
                    avatarUrl={userProfile.avatarUrl}
                    displayName={userProfile.displayName}
                    isGuest={isGuest}
                    size="sm"
                  />
                </div>
              </div>
            </header>

            {/* Desktop search in header area */}
            <header className="hidden md:block sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-white/10">
              <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-end gap-4">
                  <SearchBar className="w-72" />
                  <ProfileAvatar
                    avatarUrl={userProfile.avatarUrl}
                    displayName={userProfile.displayName}
                    isGuest={isGuest}
                    size="md"
                  />
                </div>
              </div>
            </header>

            <div className="mx-auto h-full max-w-7xl px-4 pt-16 pb-6 md:pt-6 sm:px-6 lg:px-8 w-full overflow-hidden">
              {children}
            </div>
          </main>

            <MobileNav badges={navBadges} isGuest={isGuest} />
            <ScrollToTop />
          </div>
        </DealSpotlightProvider>
        </SpotlightProvider>
        </ToastUIProvider>
      </ToastProvider>
    </GuestProvider>
  )
}
