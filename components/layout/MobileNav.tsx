'use client'

import { Home, FileText, Newspaper, Library, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around">
        <NavItem icon={Home} label="Home" href="/home" />
        <NavItem icon={FileText} label="Patches" href="/patches" />
        <NavItem icon={Newspaper} label="News" href="/news" />
        <NavItem icon={Library} label="Backlog" href="/backlog" />
        <NavItem icon={User} label="Profile" href="/profile" />
      </div>
    </nav>
  )
}

function NavItem({ icon: Icon, label, href }: { icon: typeof Home; label: string; href: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-3 py-3 transition-colors ${
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}
