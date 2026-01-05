'use client'

import { Home, Newspaper, Library, User, Sparkles, Brain, Crown, Bell, Gamepad2, Bookmark, LogIn, UserPlus, Video } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProBadge } from '@/components/ui/ProBadge'

export type SidebarCounts = {
  newPatchesToday: number
  newNewsToday: number
  unreadBacklog: number
  savedUpdates: number
}

type NotificationStats = {
  unread_count: number
  high_priority_count: number
}

type PatchesStats = {
  total_today: number
  high_impact_count: number
}

type DesktopSidebarProps = {
  counts?: SidebarCounts | null
  notificationStats?: NotificationStats
  patchesStats?: PatchesStats
  isGuest?: boolean
}

export function DesktopSidebar({ counts, notificationStats, patchesStats, isGuest = false }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div className="flex flex-col gap-y-5 border-r border-border bg-background px-6 py-8">
        <div className="flex items-center">
          <Link href="/home" className="flex h-10 items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">PatchPulse</h1>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-y-1">
          <NavItem
            icon={Home}
            label="Home"
            href="/home"
          />
          <NavItem
            icon={Newspaper}
            label="News"
            href="/news"
            badge={counts?.newNewsToday}
            badgeLabel="new"
            isLive={counts?.newNewsToday ? counts.newNewsToday > 0 : false}
          />
          <NavItem
            icon={Video}
            label="Videos"
            href="/videos"
          />
          <NavItem
            icon={Brain}
            label="Insights"
            href="/insights"
            isPro
          />
          <NavItem
            icon={Library}
            label="Library"
            href="/backlog"
            badge={counts?.unreadBacklog}
            badgeLabel="unread"
          />
          <NavItem
            icon={Bookmark}
            label="Saved"
            href="/bookmarks"
            badge={counts?.savedUpdates}
            badgeLabel="saved"
            isPro
          />
          <NavItem icon={User} label="Profile" href="/profile" />

          <div className="mt-4 pt-4 border-t border-border">
            <NavItem
              icon={Gamepad2}
              label="Patches"
              href="/patches"
              badge={patchesStats?.total_today}
              badgeLabel="today"
              isLive={patchesStats?.high_impact_count ? patchesStats.high_impact_count > 0 : false}
            />
            {!isGuest && (
              <NavItem
                icon={Bell}
                label="Notifications"
                href="/notifications"
                badge={notificationStats?.unread_count}
                badgeLabel="unread"
                isLive={notificationStats?.high_priority_count ? notificationStats.high_priority_count > 0 : false}
              />
            )}
          </div>
        </nav>
      </div>
    </aside>
  )
}

type NavItemProps = {
  icon: typeof Home
  label: string
  href: string
  badge?: number
  badgeLabel?: string
  isLive?: boolean
  isPro?: boolean
}

function NavItem({ icon: Icon, label, href, badge, badgeLabel, isLive, isPro }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  const showBadge = badge !== undefined && badge > 0

  return (
    <Link
      href={href}
      className={`group relative flex items-center justify-between gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-accent text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
      }`}
    >
      <div className="flex items-center gap-x-3">
        <Icon className={`h-5 w-5 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {isPro && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-primary text-[10px] font-medium">
            <Crown className="w-2.5 h-2.5" />
            Pro
          </span>
        )}
        {showBadge && (
          <>
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                isLive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-zinc-400'
              }`}
              title={`${badge} ${badgeLabel}`}
            >
              {badge}
            </span>
          </>
        )}
      </div>
    </Link>
  )
}
