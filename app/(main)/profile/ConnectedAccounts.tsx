'use client'

import { useState, useTransition, useEffect } from 'react'
import { Gamepad2, Plus, X, Loader2, ExternalLink, Check, Clock, AlertCircle, RefreshCw, Library, Timer } from 'lucide-react'
import { type ConnectedAccount, type Provider, addManualAccount, disconnectAccount } from './actions'
import { useSearchParams } from 'next/navigation'
import {
  SteamIcon,
  XboxIcon,
  PlayStationIcon,
  EpicIcon,
  BattleNetIcon,
  RiotIcon
} from '@/components/ui/StoreLinkButtons'

const PROVIDER_ICONS: Record<Provider, React.ComponentType<{ className?: string }>> = {
  steam: SteamIcon,
  xbox: XboxIcon,
  psn: PlayStationIcon,
  epic: EpicIcon,
  battlenet: BattleNetIcon,
  riot: RiotIcon,
}

type ProviderInfo = {
  id: Provider
  name: string
  color: string
  hasOAuth: boolean
  hasLibrarySync: boolean
  description: string
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: 'steam',
    name: 'Steam',
    color: 'bg-[#1b2838]',
    hasOAuth: true,
    hasLibrarySync: true,
    description: 'Syncs games, playtime & last played'
  },
  {
    id: 'xbox',
    name: 'Xbox',
    color: 'bg-[#107c10]',
    hasOAuth: true,
    hasLibrarySync: true,
    description: 'Syncs games, playtime & achievements'
  },
  {
    id: 'psn',
    name: 'PlayStation',
    color: 'bg-[#003791]',
    hasOAuth: false,
    hasLibrarySync: false,
    description: 'Display only - Sony has no public API'
  },
  {
    id: 'epic',
    name: 'Epic Games',
    color: 'bg-[#313131]',
    hasOAuth: false,
    hasLibrarySync: false,
    description: 'Display only - No library API available'
  },
  {
    id: 'battlenet',
    name: 'Battle.net',
    color: 'bg-[#00aeff]',
    hasOAuth: false,
    hasLibrarySync: false,
    description: 'Display only - No library API available'
  },
  {
    id: 'riot',
    name: 'Riot Games',
    color: 'bg-[#d32936]',
    hasOAuth: false,
    hasLibrarySync: false,
    description: 'Display only - OAuth coming soon'
  },
]

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

type Props = {
  accounts: ConnectedAccount[]
}

export function ConnectedAccounts({ accounts }: Props) {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [addingProvider, setAddingProvider] = useState<Provider | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [syncingProvider, setSyncingProvider] = useState<Provider | null>(null)

  // Check for sync status from URL params
  useEffect(() => {
    const steamStatus = searchParams.get('steam')
    const xboxStatus = searchParams.get('xbox')
    const riotStatus = searchParams.get('riot')
    const steamCount = searchParams.get('count')
    const xboxCount = searchParams.get('count')
    const followed = searchParams.get('followed')
    const hasLol = searchParams.get('lol')
    const hasValorant = searchParams.get('valorant')
    const error = searchParams.get('error')

    if (steamStatus === 'synced') {
      setMessage({
        type: 'success',
        text: `Steam synced! ${steamCount || 0} games imported${followed ? `, ${followed} auto-followed` : ''}`
      })
    } else if (xboxStatus === 'synced') {
      setMessage({
        type: 'success',
        text: `Xbox synced! ${xboxCount || 0} games imported`
      })
    } else if (riotStatus === 'synced') {
      const games = []
      if (hasLol === 'true') games.push('LoL')
      if (hasValorant === 'true') games.push('Valorant')
      setMessage({
        type: 'success',
        text: games.length > 0
          ? `Riot synced! ${games.join(' & ')} stats imported`
          : 'Riot connected! No game stats found'
      })
    } else if (error) {
      const errorMessages: Record<string, string> = {
        steam_not_connected: 'Steam account not connected',
        steam_sync_failed: 'Failed to sync Steam library',
        steam_api_not_configured: 'Steam API not configured',
        xbox_not_connected: 'Xbox account not connected',
        xbox_sync_failed: 'Failed to sync Xbox library',
        xbox_reauth_required: 'Xbox re-authentication required',
        xbox_auth_denied: 'Xbox authentication was denied',
        xbox_auth_failed: 'Xbox authentication failed',
        riot_not_configured: 'Riot API not configured',
        riot_not_connected: 'Riot account not connected',
        riot_sync_failed: 'Failed to sync Riot stats',
        riot_auth_denied: 'Riot authentication was denied',
        riot_auth_failed: 'Riot authentication failed',
        riot_auth_error: 'Riot authentication error',
        riot_api_not_configured: 'Riot API key not configured',
      }
      setMessage({
        type: 'error',
        text: errorMessages[error] || 'An error occurred'
      })
    }
  }, [searchParams])

  const connectedProviders = new Set(accounts.map((a) => a.provider))

  const handleConnect = (provider: Provider) => {
    if (provider === 'steam') {
      window.location.href = '/api/auth/steam/start'
    } else if (provider === 'xbox') {
      window.location.href = '/api/auth/xbox/start'
    } else {
      setAddingProvider(provider)
      setInputValue('')
      setMessage(null)
    }
  }

  const handleSync = (provider: Provider) => {
    setSyncingProvider(provider)
    window.location.href = `/api/sync/${provider}`
  }

  const handleAddManual = () => {
    if (!addingProvider || !inputValue.trim()) return

    startTransition(async () => {
      const result = await addManualAccount(addingProvider, inputValue)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Account added!' })
        setAddingProvider(null)
        setInputValue('')
      }
    })
  }

  const handleDisconnect = (provider: Provider) => {
    if (!confirm(`Disconnect ${PROVIDERS.find((p) => p.id === provider)?.name}?`)) return

    startTransition(async () => {
      const result = await disconnectAccount(provider)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  // Separate by sync capability
  const syncableProviders = PROVIDERS.filter(p => p.hasLibrarySync)
  const displayOnlyProviders = PROVIDERS.filter(p => !p.hasLibrarySync)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Connected Accounts</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your gaming accounts to import your library and track playtime.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Full Sync Providers (Steam & Xbox) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Library className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Full Library Sync</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {syncableProviders.map((provider) => {
            const account = accounts.find((a) => a.provider === provider.id)
            const isConnected = !!account
            const isSyncing = syncingProvider === provider.id

            return (
              <div
                key={provider.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isConnected
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`relative h-12 w-12 rounded-xl ${provider.color} flex items-center justify-center`}>
                      {(() => {
                        const Icon = PROVIDER_ICONS[provider.id]
                        return <Icon className="h-6 w-6 text-white" />
                      })()}
                      {isConnected && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{provider.name}</p>
                      {isConnected ? (
                        <p className="text-sm text-green-400">{account.display_name}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
                      )}
                    </div>
                  </div>

                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={isPending}
                      className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Disconnect"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Connect
                    </button>
                  )}
                </div>

                {/* Sync controls for connected accounts */}
                {isConnected && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        {account.last_sync_at ? (
                          <span>Last synced {getRelativeTime(account.last_sync_at)}</span>
                        ) : (
                          <span>Never synced</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleSync(provider.id)}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {isSyncing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </div>

                    {/* What gets synced */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-400">
                        Games
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-cyan-500/10 text-cyan-400">
                        Playtime
                      </span>
                      {provider.id === 'xbox' && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/10 text-purple-400">
                          Achievements
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/10 text-amber-400">
                        Last Played
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Display Only Providers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Display Only</h3>
          <span className="text-xs text-muted-foreground">(No library sync available)</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {displayOnlyProviders.map((provider) => {
            const account = accounts.find((a) => a.provider === provider.id)
            const isConnected = !!account

            return (
              <div
                key={provider.id}
                className={`rounded-xl border p-3 transition-colors ${
                  isConnected
                    ? 'border-border bg-card/50'
                    : 'border-border/50 bg-card/30 hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-9 w-9 rounded-lg ${provider.color} flex items-center justify-center opacity-80`}>
                      {(() => {
                        const Icon = PROVIDER_ICONS[provider.id]
                        return <Icon className="h-4 w-4 text-white" />
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{provider.name}</p>
                      {isConnected ? (
                        <p className="text-xs text-muted-foreground">{account.display_name}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/70">Not connected</p>
                      )}
                    </div>
                  </div>

                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={isPending}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={isPending}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>

                {/* Manual input */}
                {addingProvider === provider.id && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Your ${provider.name} username`}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddManual}
                        disabled={isPending || !inputValue.trim()}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Save'}
                      </button>
                      <button
                        onClick={() => setAddingProvider(null)}
                        className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground/60 mt-3">
          These platforms don&apos;t provide public APIs for library access. Your username will be displayed on your profile as a badge.
        </p>
      </div>
    </div>
  )
}
