'use client'

import { useState } from 'react'
import { Home, Newspaper, Library, Brain, Crown, Bookmark, Video, Menu, X, Gamepad2, CalendarDays, ChevronRight, Tag, CalendarClock } from 'lucide-react'
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
  { icon: Video, label: 'Videos', href: '/videos' },
  { icon: Library, label: 'Library', href: '/backlog' },
]

const menuItems: NavItemConfig[] = [
  { icon: Brain, label: 'Insights', href: '/insights' },
  { icon: Bookmark, label: 'Saved', href: '/bookmarks' },
  { icon: Tag, label: 'Deals', href: '/deals', isPro: true },
  { icon: Gamepad2, label: 'Patches', href: '/patches' },
  { icon: CalendarClock, label: 'Upcoming', href: '/upcoming' },
  { icon: CalendarDays, label: 'Releases', href: '/releases' },
]

export function MobileNav({ badges, isGuest = false }: { badges?: Record<string, NavBadge>; isGuest?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if current page is in menu items
  const isMenuItemActive = menuItems.some(item =>
    pathname === item.href || pathname.startsWith(item.href + '/')
  )

  return (
    <>
      {/* Menu Drawer Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Drawer - only render when open */}
      {isMenuOpen && (
        <div className="fixed bottom-0 inset-x-0 z-[60] md:hidden animate-in slide-in-from-bottom duration-300">
          <div className="bg-background border-t border-white/10 rounded-t-3xl safe-area-pb">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Menu header */}
          <div className="flex items-center justify-between px-6 pb-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu items */}
          <div className="px-4 pb-6 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setIsMenuOpen(false)
                    window.dispatchEvent(new CustomEvent('closeSearch'))
                  }}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-white/5 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isPro && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 text-primary text-[10px] font-medium">
                        <Crown className="w-2.5 h-2.5" />
                        Pro
                      </span>
                    )}
                    {badges?.[item.href]?.count && badges[item.href].count! > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                        {badges[item.href].count! > 99 ? '99+' : badges[item.href].count}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
          </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Always fixed at bottom */}
      <nav className="fixed bottom-0 inset-x-0 z-50 glass-nav md:hidden safe-area-pb">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              badge={badges?.[item.href] || item.badge}
            />
          ))}
          {/* Menu button */}
          <button
            onClick={() => {
              setIsMenuOpen(true)
              window.dispatchEvent(new CustomEvent('closeSearch'))
            }}
            className={`
              relative flex flex-col items-center gap-1 px-3 py-3
              transition-all duration-200 touch-feedback
              ${isMenuItemActive
                ? 'text-primary nav-glow'
                : 'text-muted-foreground hover:text-foreground active:text-foreground'
              }
            `}
          >
            <div className={`relative transition-transform duration-200 ${isMenuItemActive ? 'scale-110' : ''}`}>
              <Menu className={`h-6 w-6 transition-all duration-200 ${isMenuItemActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
            </div>
            <span className={`text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 ${isMenuItemActive ? 'opacity-100' : 'opacity-70'}`}>
              More
            </span>
            {isMenuItemActive && (
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  )
}

function NavItem({ icon: Icon, label, href, badge, isPro }: NavItemConfig) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  const handleClick = () => {
    // Dispatch event to close search overlay if open
    window.dispatchEvent(new CustomEvent('closeSearch'))
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
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

