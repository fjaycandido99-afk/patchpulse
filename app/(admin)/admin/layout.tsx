import Link from 'next/link'

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 border-b border-white/10 pb-3">
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/games">Games</NavLink>
        <NavLink href="/admin/patches">Patches</NavLink>
        <NavLink href="/admin/news">News</NavLink>
      </nav>
      {children}
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
    >
      {children}
    </Link>
  )
}
