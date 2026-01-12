import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Shield, ChevronRight, User, UserPlus, LogIn, Sparkles } from 'lucide-react'
import { isGuestModeFromCookies } from '@/lib/guest'
import { ConnectedAccounts } from './ConnectedAccounts'
import { SecuritySection } from '@/components/profile/SecuritySection'
import { LogoutButton } from '@/components/auth/LogoutButton'
import {
  getConnectedAccounts,
  getProfileStats,
  getFollowedGames,
  getBacklogGames,
  getPlaytimeGames,
} from './actions'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { SubscriptionSection } from '@/components/subscription/SubscriptionSection'
import { getSubscriptionInfo } from '@/lib/subscriptions/limits'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)
  const isNativeApp = cookieStore.get('patchpulse-native-app')?.value === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // User is only a guest if they have the cookie AND are not logged in
  const isGuest = !user && hasGuestCookie

  // Redirect to login if not logged in and not a guest
  // Don't redirect native apps - they handle auth client-side
  if (!user && !isGuest && !isNativeApp) {
    redirect('/login')
  }

  // Show sign-in prompt for guests
  if (isGuest) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account settings and gaming preferences.
          </p>
        </div>

        {/* Guest profile card */}
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">You're browsing as a guest</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create an account to save your progress, follow games, and sync across devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>

        {/* Benefits of signing up */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Why create an account?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Follow your favorite games</p>
                <p className="text-muted-foreground text-xs">Get notified about patches and updates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Track your backlog</p>
                <p className="text-muted-foreground text-xs">Manage what you're playing and want to play</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Connect gaming accounts</p>
                <p className="text-muted-foreground text-xs">Sync with Steam, Xbox, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">4</span>
              </div>
              <div>
                <p className="font-medium">Sync across devices</p>
                <p className="text-muted-foreground text-xs">Access your library anywhere</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Legal</h2>
          <div className="space-y-1">
            <Link
              href="/privacy"
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </section>
      </div>
    )
  }

  // Native apps without server session - show minimal UI with logout option
  if (!user && isNativeApp) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account settings and gaming preferences.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-muted-foreground text-center mb-4">
            Session loading...
          </p>
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Legal</h2>
          <div className="space-y-1">
            <Link
              href="/privacy"
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </section>
      </div>
    )
  }

  // At this point, user must exist
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('avatar_url, display_name, bio, created_at')
    .eq('id', user.id)
    .single()

  // Get biometric credential info
  const { data: biometricCredential } = await supabase
    .from('webauthn_credentials')
    .select('device_name, last_used_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const [accounts, stats, subscriptionInfo, followedGames, backlogGames, playtimeGames] = await Promise.all([
    getConnectedAccounts(),
    getProfileStats(),
    getSubscriptionInfo(user.id),
    getFollowedGames(),
    getBacklogGames(),
    getPlaytimeGames(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and gaming preferences.
        </p>
        {/* Glow divider */}
        <div className="relative h-0.5 w-full overflow-visible mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        </div>
      </div>

      {/* Profile Header - Avatar, Name, Bio */}
      <ProfileHeader
        userId={user.id}
        email={user.email || ''}
        username={null}
        displayName={profile?.display_name || null}
        avatarUrl={profile?.avatar_url || null}
        bio={profile?.bio || null}
        memberSince={profile?.created_at || null}
      />

      {/* Gaming Stats */}
      {stats && (
        <ProfileStats
          followedCount={stats.followedCount}
          backlogCount={stats.backlogCount}
          playingCount={stats.playingCount}
          completedCount={stats.completedCount}
          pausedCount={stats.pausedCount}
          totalPlaytime={stats.totalPlaytime}
          followedGames={followedGames}
          backlogGames={backlogGames}
          playtimeGames={playtimeGames}
        />
      )}

      {/* Subscription */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
        <SubscriptionSection
          subscription={{
            plan: subscriptionInfo.plan,
            status: subscriptionInfo.status,
            provider: subscriptionInfo.provider,
            currentPeriodEnd: subscriptionInfo.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: subscriptionInfo.cancelAtPeriodEnd,
            usage: subscriptionInfo.usage,
            features: subscriptionInfo.features,
          }}
        />
      </section>

      {/* Connected Accounts */}
      <section className="rounded-xl border border-border bg-card p-6">
        <ConnectedAccounts accounts={accounts} />
      </section>

      {/* Security Settings - hidden on native iOS */}
      <SecuritySection
        hasCredential={!!biometricCredential}
        lastUsedAt={biometricCredential?.last_used_at ?? null}
        deviceName={biometricCredential?.device_name ?? null}
      />

      {/* Account Actions */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sign out of your account or switch to a different user.
        </p>
        <LogoutButton />
      </section>

      {/* Legal */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Legal</h2>
        <div className="space-y-1">
          <Link
            href="/privacy"
            className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span>Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span>Terms of Service</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </section>
    </div>
  )
}
