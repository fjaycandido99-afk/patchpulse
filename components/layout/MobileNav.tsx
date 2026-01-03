'use client'

import { Home, Newspaper, Library, User, Brain, Crown, Bookmark, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavBadge = {
  count?: number
  dot?: boolean
}

type NavItemConfig = {
  icon: typeof Home
  iconFilled?: typeof Home
  label: string
  href: string
  badge?: NavBadge
  isPro?: boolean
  guestHidden?: boolean
}

const navItems: NavItemConfig[] = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Newspaper, label: 'News', href: '/news' },
  { icon: Brain, label: 'Insights', href: '/insights', isPro: true },
  { icon: Library, label: 'Library', href: '/backlog' },
  { icon: Bookmark, label: 'Saved', href: '/bookmarks', isPro: true },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function MobileNav({ badges, isGuest = false }: { badges?: Record<string, NavBadge>; isGuest?: boolean }) {
  const items = navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            badge={badges?.[item.href] || item.badge}
          />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ icon: Icon, label, href, badge, isPro }: NavItemConfig) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={`
        relative flex flex-col items-center gap-1 px-3 py-3
        transition-all duration-200 touch-feedback
        ${isActive
          ? 'text-primary nav-glow'
          : 'text-muted-foreground hover:text-foreground active:text-foreground'
        }
      `}
    >
      {/* Icon with glow effect when active */}
      <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
        <Icon
          className={`h-6 w-6 transition-all duration-200 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`}
        />

        {/* Pro indicator - small crown */}
        {isPro && (
          <span className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-primary/80 to-violet-500/80 border border-primary/50">
            <Crown className="w-2.5 h-2.5 text-white" />
          </span>
        )}

        {/* Badge (number) */}
        {badge && (badge.count || badge.dot) && !isPro && (
          <span
            className={`
              absolute -top-1 -right-1.5 flex items-center justify-center
              min-w-[16px] h-4 rounded-full text-[10px] font-bold
              bg-red-500 text-white border-2 border-background
              ${badge.dot && !badge.count ? 'w-2 h-2 min-w-0' : 'px-1'}
            `}
          >
            {badge.count && badge.count > 0 ? (badge.count > 99 ? '99+' : badge.count) : null}
          </span>
        )}
      </div>

      {/* Label */}
      <span
        className={`
          text-[10px] font-semibold tracking-wide uppercase
          transition-all duration-200
          ${isActive ? 'opacity-100' : 'opacity-70'}
        `}
      >
        {label}
      </span>

      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  )
}

