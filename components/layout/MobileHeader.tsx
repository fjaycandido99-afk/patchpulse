'use client'

import Link from 'next/link'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { SearchBar } from '@/components/layout/SearchBar'
import { ProfileAvatar } from '@/components/layout/ProfileAvatar'

type MobileHeaderProps = {
  isGuest: boolean
  notificationStats: { unread_count: number; high_priority_count: number }
  avatarUrl: string | null
  displayName: string | null
}

export function MobileHeader({
  isGuest,
  notificationStats,
  avatarUrl,
  displayName,
}: MobileHeaderProps) {
  const { showHeader } = useScrollDirection()

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 md:hidden bg-[rgba(9,9,11,0.98)] backdrop-blur-xl border-b border-white/10 transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="text-lg font-bold tracking-tight flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            PatchPulse
          </Link>
          {!isGuest && (
            <div className="flex items-center gap-1 ml-1">
              <NotificationBell initialStats={notificationStats} size="sm" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SearchBar className="w-auto" />
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            isGuest={isGuest}
            size="sm"
          />
        </div>
      </div>
    </header>
  )
}
