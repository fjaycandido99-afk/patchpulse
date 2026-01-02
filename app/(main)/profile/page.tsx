import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Shield, ChevronRight } from 'lucide-react'
import { ConnectedAccounts } from './ConnectedAccounts'
import { BiometricSettings } from '@/components/auth/BiometricSettings'
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

      {/* Security Settings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <BiometricSettings
          hasCredential={!!biometricCredential}
          lastUsedAt={biometricCredential?.last_used_at ?? null}
          deviceName={biometricCredential?.device_name ?? null}
        />
      </section>

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
