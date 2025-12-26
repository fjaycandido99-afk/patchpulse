import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { MobileNav } from '@/components/layout/MobileNav'
import { DesktopSidebar } from '@/components/layout/DesktopSidebar'
import { SearchBar } from '@/components/layout/SearchBar'
import { ProfileAvatar } from '@/components/layout/ProfileAvatar'
import { getSidebarCounts } from '@/lib/sidebar-data'

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

  // Fetch sidebar counts for live indicators
  const sidebarCounts = await getSidebarCounts()

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
    <div className="flex min-h-screen">
      <DesktopSidebar counts={sidebarCounts} />

      <main className="flex-1 pb-20 md:ml-64 md:pb-0">
        {/* Mobile header with search */}
        <header className="sticky top-0 z-40 md:hidden bg-background border-b border-white/10">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <Link href="/home" className="text-lg font-bold tracking-tight flex-shrink-0 hover:opacity-80 transition-opacity">
                PatchPulse
              </Link>
              <button
                className="relative p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
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

        <div className="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <MobileNav badges={navBadges} />
    </div>
  )
}
