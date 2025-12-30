import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { MobileNav } from '@/components/layout/MobileNav'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
import { SearchBar } from '@/components/layout/SearchBar'
import { ProfileAvatar } from '@/components/layout/ProfileAvatar'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { LatestPatchesBell } from '@/components/patches/LatestPatchesBell'
import { ToastProvider } from '@/components/notifications/ToastProvider'
import { SpotlightProvider } from '@/components/games'
import { getSidebarCounts } from '@/lib/sidebar-data'
import { getNotificationStats } from '@/lib/notifications'
import { getLatestPatchesStats } from '@/lib/patches-stats'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getSession()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('onboarding_completed, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (error || !profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  const userProfile = {
    displayName: profile.display_name as string | null,
    avatarUrl: profile.avatar_url as string | null,
  }

  // Fetch sidebar counts and notification stats for live indicators
  const [sidebarCounts, notificationStats, patchesStats] = await Promise.all([
    getSidebarCounts(),
    getNotificationStats(),
    getLatestPatchesStats(),
  ])

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

  return (
    <ToastProvider userId={user.id}>
      <SpotlightProvider>
        <div className="flex min-h-screen">
          <DesktopSidebar counts={sidebarCounts} notificationStats={notificationStats} />

        <main className="flex-1 pb-20 md:ml-64 md:pb-0">
          {/* Mobile header with search - Apple Music/App Store style, fixed for edge-to-edge */}
          <header className="fixed inset-x-0 top-0 z-40 md:hidden bg-[rgba(10,15,30,0.85)] backdrop-blur-xl border-b border-white/10" style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}>
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex items-center gap-1">
                <Link href="/home" className="text-lg font-bold tracking-tight flex-shrink-0 hover:opacity-80 transition-opacity">
                  PatchPulse
                </Link>
                <LatestPatchesBell initialStats={patchesStats} size="sm" />
                <NotificationBell initialStats={notificationStats} size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <SearchBar className="w-auto" />
                <ProfileAvatar
                  avatarUrl={userProfile.avatarUrl}
                  displayName={userProfile.displayName}
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
                  size="md"
                />
              </div>
            </div>
          </header>

          <div className="mx-auto h-full max-w-7xl px-4 pt-16 pb-6 md:pt-6 sm:px-6 lg:px-8 w-full overflow-hidden">
            {children}
          </div>
        </main>

          <MobileNav badges={navBadges} />
        </div>
      </SpotlightProvider>
    </ToastProvider>
  )
}
