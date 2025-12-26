import Link from 'next/link'
import { Sparkles, CalendarDays } from 'lucide-react'

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 border-b border-white/10 pb-3 overflow-x-auto">
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/games">Games</NavLink>
        <NavLink href="/admin/patches">Patches</NavLink>
        <NavLink href="/admin/news">News</NavLink>
        <NavLink href="/admin/games/discovery" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Discovery
        </NavLink>
        <NavLink href="/admin/seasonal" icon={<CalendarDays className="w-3.5 h-3.5" />}>
          Seasonal
        </NavLink>
      </nav>
      {children}
    </div>
  )
}

function NavLink({
  href,
  children,
  icon
}: {
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 whitespace-nowrap"
    >
      {icon}
      {children}
    </Link>
  )
}
