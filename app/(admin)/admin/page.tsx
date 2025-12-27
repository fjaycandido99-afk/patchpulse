import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>
        </div>
        <Link
          href="/home"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Back to app
        </Link>
      </header>

      <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          href="/admin/games"
          title="Games"
          description="Add and manage games in the database"
        />
        <AdminCard
          href="/admin/patches"
          title="Patch Notes"
          description="Create patch notes for games"
        />
        <AdminCard
          href="/admin/news"
          title="News"
          description="Publish news items and announcements"
        />
        <AdminCard
          href="/admin/ai"
          title="AI Processing"
          description="Manage AI job queue and processing"
        />
      </nav>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Tips</h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Add games first before creating patches or news for them</li>
          <li>• Use IGDB for cover images: images.igdb.com/igdb/image/upload/t_cover_big/[id].jpg</li>
          <li>• Impact scores: 1-4 Minor, 5-7 Medium, 8-10 Major</li>
          <li>• Mark unconfirmed information as rumors</li>
        </ul>
      </section>
    </div>
  )
}

function AdminCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/20"
    >
      <h3 className="font-semibold text-white group-hover:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-zinc-400">{description}</p>
    </Link>
  )
}
