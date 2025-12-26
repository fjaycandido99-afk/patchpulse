'use client'

import { useState, useTransition } from 'react'
import { Gamepad2, Plus, X, Loader2, ExternalLink, Check, Clock, AlertCircle } from 'lucide-react'
import { type ConnectedAccount, type Provider, addManualAccount, disconnectAccount } from './actions'

const PROVIDERS: { id: Provider; name: string; color: string; hasOAuth: boolean }[] = [
  { id: 'steam', name: 'Steam', color: 'bg-[#1b2838]', hasOAuth: true },
  { id: 'xbox', name: 'Xbox', color: 'bg-[#107c10]', hasOAuth: true },
  { id: 'psn', name: 'PlayStation', color: 'bg-[#003791]', hasOAuth: false },
  { id: 'epic', name: 'Epic Games', color: 'bg-[#313131]', hasOAuth: false },
  { id: 'battlenet', name: 'Battle.net', color: 'bg-[#00aeff]', hasOAuth: false },
  { id: 'riot', name: 'Riot Games', color: 'bg-[#d32936]', hasOAuth: false },
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
  const [isPending, startTransition] = useTransition()
  const [addingProvider, setAddingProvider] = useState<Provider | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  // Separate OAuth and manual providers
  const oauthProviders = PROVIDERS.filter(p => p.hasOAuth)
  const manualProviders = PROVIDERS.filter(p => !p.hasOAuth)

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
          className={`rounded-lg px-4 py-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* OAuth Providers - Full sync support */}
      <div className="grid gap-3 sm:grid-cols-2">
        {oauthProviders.map((provider) => {
          const account = accounts.find((a) => a.provider === provider.id)
          const isConnected = !!account

          return (
            <div
              key={provider.id}
              className={`rounded-lg border p-4 transition-colors ${
                isConnected
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`relative h-10 w-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">
                      {provider.name.slice(0, 2).toUpperCase()}
                    </span>
                    {/* Status indicator */}
                    {isConnected && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    {isConnected ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-green-400">{account.display_name}</span>
                        {account.last_sync_at && (
                          <span className="text-xs text-muted-foreground">
                            · {getRelativeTime(account.last_sync_at)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
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
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Connect
                  </button>
                )}
              </div>

              {/* Library import button for OAuth providers */}
              {isConnected && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                  <a
                    href={`/api/sync/${provider.id}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Clock className="h-3 w-3" />
                    Sync Library
                  </a>
                  {account.last_sync_at && (
                    <span className="text-xs text-muted-foreground">
                      Last sync: {getRelativeTime(account.last_sync_at)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Manual Providers - Username only */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Some platforms require manual linking due to API limitations
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {manualProviders.map((provider) => {
            const account = accounts.find((a) => a.provider === provider.id)
            const isConnected = !!account

            return (
              <div
                key={provider.id}
                className={`rounded-lg border p-4 transition-colors ${
                  isConnected
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`relative h-10 w-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                      <span className="text-xs font-bold text-white">
                        {provider.name.slice(0, 2).toUpperCase()}
                      </span>
                      {/* Status indicator */}
                      {isConnected && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      {isConnected ? (
                        <span className="text-sm text-green-400">{account.display_name}</span>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not connected</p>
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
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  )}
                </div>

                {/* Manual input */}
                {addingProvider === provider.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Enter your ${provider.name} username`}
                      className="input flex-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleAddManual}
                      disabled={isPending || !inputValue.trim()}
                      className="btn-primary px-3 py-1.5 text-sm"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </button>
                    <button
                      onClick={() => setAddingProvider(null)}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
