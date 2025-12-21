'use client'

import { useState, useTransition } from 'react'
import { searchGames, saveOnboarding } from './actions'
import { X, Search } from 'lucide-react'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  platforms: string[]
}

const PLATFORMS = ['PC', 'PS5', 'Xbox', 'Switch', 'Mobile']

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [selectedGames, setSelectedGames] = useState<Game[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [playstyle, setPlaystyle] = useState<'casual' | 'competitive'>('casual')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, startSearchTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()

  async function handleSearch(query: string) {
    setSearchQuery(query)
    setError(null)

    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    startSearchTransition(async () => {
      const result = await searchGames(query)
      if (result.error) {
        setError(result.error)
      } else {
        setSearchResults(result.games)
      }
    })
  }

  function handleSelectGame(game: Game) {
    if (!selectedGames.find((g) => g.id === game.id)) {
      setSelectedGames([...selectedGames, game])
      setSearchQuery('')
      setSearchResults([])
    }
  }

  function handleRemoveGame(gameId: string) {
    setSelectedGames(selectedGames.filter((g) => g.id !== gameId))
  }

  function handleTogglePlatform(platform: string) {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter((p) => p !== platform))
    } else {
      setPlatforms([...platforms, platform])
    }
  }

  function handleNextStep() {
    setError(null)
    if (selectedGames.length < 3) {
      setError('Please select at least 3 games')
      return
    }
    setStep(2)
  }

  function handleFinish() {
    setError(null)

    if (platforms.length === 0) {
      setError('Please select at least one platform')
      return
    }

    startSaveTransition(async () => {
      const result = await saveOnboarding({
        selectedGameIds: selectedGames.map((g) => g.id),
        preferred_platforms: platforms,
        playstyle,
        notifications_enabled: notificationsEnabled,
      })

      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to PatchPulse</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {step} of 2: {step === 1 ? 'Select your games' : 'Set your preferences'}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium">
                Search games
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for games..."
                  className="block w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {isSearching && (
                <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
              )}

              {searchResults.length > 0 && (
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-card">
                  {searchResults.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{game.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {game.platforms.join(', ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">
                Selected games ({selectedGames.length}/3 minimum)
              </label>
              {selectedGames.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No games selected yet. Search and select at least 3 games.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm"
                    >
                      <span>{game.name}</span>
                      <button
                        onClick={() => handleRemoveGame(game.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              disabled={selectedGames.length < 3}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium">
                What platforms do you play on?
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handleTogglePlatform(platform)}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                      platforms.includes(platform)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input bg-background hover:bg-accent'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Playstyle</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlaystyle('casual')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    playstyle === 'casual'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-background hover:bg-accent'
                  }`}
                >
                  Casual
                </button>
                <button
                  onClick={() => setPlaystyle('competitive')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    playstyle === 'competitive'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-background hover:bg-accent'
                  }`}
                >
                  Competitive
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-input bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium">Enable notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get alerts for patch notes and news
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={isSaving || platforms.length === 0}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
