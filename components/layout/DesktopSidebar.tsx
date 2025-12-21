'use client'

import { Home, FileText, Newspaper, Library, Bookmark, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DesktopSidebar() {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div className="flex flex-col gap-y-5 border-r border-border bg-background px-6 py-8">
        <div className="flex h-10 items-center">
          <h1 className="text-xl font-bold">PatchPulse</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-y-1">
          <NavItem icon={Home} label="Home" href="/home" />
          <NavItem icon={FileText} label="Patches" href="/patches" />
          <NavItem icon={Newspaper} label="News" href="/news" />
          <NavItem icon={Library} label="Backlog" href="/backlog" />
          <NavItem icon={Bookmark} label="Saved" href="/bookmarks" />
          <NavItem icon={User} label="Profile" href="/profile" />
        </nav>
      </div>
    </aside>
  )
}

function NavItem({ icon: Icon, label, href }: { icon: typeof Home; label: string; href: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}
