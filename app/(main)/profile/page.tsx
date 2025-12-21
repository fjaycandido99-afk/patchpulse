import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConnectedAccounts } from './ConnectedAccounts'
import { getConnectedAccounts, getLibraryStats } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  const [accounts, stats] = await Promise.all([
    getConnectedAccounts(),
    getLibraryStats(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and connected gaming platforms.
        </p>
      </div>

      {/* User Info */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {(profile?.username || user.email)?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {profile?.username || user.email?.split('@')[0]}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {profile?.created_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {stats && stats.totalGames > 0 && (
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{stats.totalGames}</p>
              <p className="text-sm text-muted-foreground">Games in Library</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(stats.totalPlaytime / 60)}h
              </p>
              <p className="text-sm text-muted-foreground">Total Playtime</p>
            </div>
            {Object.keys(stats.byProvider).length > 0 && (
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.byProvider).length}</p>
                <p className="text-sm text-muted-foreground">Platforms</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Connected Accounts */}
      <section className="rounded-lg border border-border bg-card p-6">
        <ConnectedAccounts accounts={accounts} />
      </section>
    </div>
  )
}
