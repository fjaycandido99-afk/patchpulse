'use client'

import { useState, useTransition } from 'react'
import { Gamepad2, Plus, X, Loader2, ExternalLink } from 'lucide-react'
import { type ConnectedAccount, type Provider, addManualAccount, disconnectAccount } from './actions'

const PROVIDERS: { id: Provider; name: string; color: string; hasOAuth: boolean }[] = [
  { id: 'steam', name: 'Steam', color: 'bg-[#1b2838]', hasOAuth: true },
  { id: 'xbox', name: 'Xbox', color: 'bg-[#107c10]', hasOAuth: false },
  { id: 'psn', name: 'PlayStation', color: 'bg-[#003791]', hasOAuth: false },
  { id: 'epic', name: 'Epic Games', color: 'bg-[#313131]', hasOAuth: false },
  { id: 'battlenet', name: 'Battle.net', color: 'bg-[#00aeff]', hasOAuth: false },
  { id: 'riot', name: 'Riot Games', color: 'bg-[#d32936]', hasOAuth: false },
]

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
      // Redirect to Steam OAuth
      window.location.href = '/api/auth/steam/start'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Connected Accounts</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Connect your gaming accounts to import your library and track playtime.
      </p>

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

      <div className="grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const account = accounts.find((a) => a.provider === provider.id)
          const isConnected = !!account

          return (
            <div
              key={provider.id}
              className={`rounded-lg border p-4 ${
                isConnected ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">
                      {provider.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    {isConnected ? (
                      <p className="text-sm text-green-400">{account.display_name}</p>
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
                    {provider.hasOAuth ? (
                      <>
                        <ExternalLink className="h-3 w-3" />
                        Connect
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        Add
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Manual input for non-OAuth providers */}
              {addingProvider === provider.id && !provider.hasOAuth && (
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

              {/* Steam import button */}
              {provider.id === 'steam' && isConnected && (
                <div className="mt-3 pt-3 border-t border-border">
                  <a
                    href="/api/sync/steam"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Loader2 className="h-3 w-3" />
                    Import Library
                  </a>
                  {account.last_sync_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last synced: {new Date(account.last_sync_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
