import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { isGuestModeFromCookies } from '@/lib/guest'
import { MobileNav } from '@/components/layout/MobileNav'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
import { SearchBar } from '@/components/layout/SearchBar'
import { ProfileAvatar } from '@/components/layout/ProfileAvatar'
import { GuestBanner } from '@/components/auth/GuestBanner'
import { ToastProvider } from '@/components/notifications/ToastProvider'
import { ToastUIProvider } from '@/components/ui/toast'
import { SpotlightProvider } from '@/components/games'
import { DealSpotlightProvider } from '@/components/deals/DealSpotlightProvider'
import { GuestProvider } from '@/components/auth/GuestProvider'
import { getSidebarCounts } from '@/lib/sidebar-data'
import { getNotificationStats } from '@/lib/notifications'
import { getLatestPatchesStats } from '@/lib/patches-stats'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { MainContent } from '@/components/layout/MainContent'
import { KeyboardShortcuts, KeyboardHint } from '@/components/keyboard'
import { PushNotificationInit } from '@/components/notifications/PushNotificationInit'
import { OneSignalInit } from '@/components/notifications/OneSignalInit'
import { StartupNotifications } from '@/components/notifications/StartupNotifications'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { NativeAuthGuard } from '@/components/auth/NativeAuthGuard'
import { SessionKeeper } from '@/components/auth/SessionKeeper'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getSession()
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  // Check if this is a native app (middleware sets this cookie)
  const isNativeApp = cookieStore.get('patchpulse-native-app')?.value === 'true'

  // User is only a guest if they have the guest cookie AND are not logged in
  // Logged-in users are never guests, even if they have a leftover guest cookie
  const isGuest = !user && hasGuestCookie

  // If not logged in and not a guest, redirect to login (unless native app)
  // Native apps will handle auth client-side via NativeAuthGuard
  if (!user && !isGuest && !isNativeApp) {
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
    <NativeAuthGuard>
      <SessionKeeper />
      <GuestProvider initialIsGuest={isGuest}>
        <ToastProvider userId={userId}>
          <ToastUIProvider>
          <SpotlightProvider>
          <DealSpotlightProvider>
            <div className="flex min-h-screen">
              <DesktopSidebar counts={sidebarCounts} notificationStats={notificationStats} patchesStats={patchesStats} isGuest={isGuest} />

            <main className="flex-1 pb-24 md:ml-64 md:pb-0 overflow-x-hidden">
              {/* Guest banner - shown at top for guest users */}
              {isGuest && <GuestBanner />}

              {/* Mobile header with search - hides on scroll */}
              <MobileHeader
                isGuest={isGuest}
                notificationStats={notificationStats}
                avatarUrl={userProfile.avatarUrl}
                displayName={userProfile.displayName}
              />

              {/* Desktop search in header area - transparent to show hero behind */}
              <header className="hidden md:block sticky top-0 z-40 bg-transparent backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-end gap-3">
                    <SearchBar />
                    <ProfileAvatar
                      avatarUrl={userProfile.avatarUrl}
                      displayName={userProfile.displayName}
                      isGuest={isGuest}
                      size="md"
                    />
                  </div>
                </div>
              </header>

              <MainContent>
                {children}
              </MainContent>
            </main>

              <MobileNav badges={navBadges} isGuest={isGuest} />
              <ScrollToTop />
              <KeyboardShortcuts />
              <KeyboardHint />
              <PushNotificationInit />
              <OneSignalInit userId={userId} />
              <StartupNotifications />
              <OfflineIndicator />
            </div>
          </DealSpotlightProvider>
          </SpotlightProvider>
          </ToastUIProvider>
        </ToastProvider>
      </GuestProvider>
    </NativeAuthGuard>
  )
}
