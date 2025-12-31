'use client'

import { useState, useTransition } from 'react'
import { searchGames, saveOnboarding } from './actions'
import { X, Search, Gamepad2, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  platforms: string[]
}

const PLATFORMS = [
  { id: 'PC', label: 'PC', icon: '🖥️' },
  { id: 'PS5', label: 'PlayStation', icon: '🎮' },
  { id: 'Xbox', label: 'Xbox', icon: '🎯' },
  { id: 'Switch', label: 'Nintendo', icon: '🕹️' },
  { id: 'Mobile', label: 'Mobile', icon: '📱' },
]

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
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Gamepad2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to PatchPulse</h1>
          <p className="text-muted-foreground">
            {step === 1 ? 'Select games you want to follow' : 'Set your preferences'}
          </p>

          {/* Progress bar */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className={`h-1.5 w-20 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1.5 w-20 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for games..."
                  className="block w-full rounded-xl border border-input bg-background py-3 pl-12 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results with Cover Images */}
              {searchResults.length > 0 && (
                <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                  {searchResults.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent"
                    >
                      {/* Game Cover */}
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {game.cover_url ? (
                          <Image
                            src={game.cover_url}
                            alt={game.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{game.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {game.platforms.join(', ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Games Grid with Cover Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  Your games
                </label>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedGames.length >= 3
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {selectedGames.length}/3 minimum
                </span>
              </div>

              {selectedGames.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                  <Gamepad2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Search and select at least 3 games to follow
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedGames.map((game) => (
                    <div
                      key={game.id}
                      className="group relative"
                    >
                      {/* Game Cover Card */}
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ring-2 ring-primary/50">
                        {game.cover_url ? (
                          <Image
                            src={game.cover_url}
                            alt={game.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-violet-500/20">
                            <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}

                        {/* Checkmark overlay */}
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>

                        {/* Remove button on hover */}
                        <button
                          onClick={() => handleRemoveGame(game.id)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-6 h-6 text-white" />
                        </button>
                      </div>

                      {/* Game name */}
                      <p className="mt-1.5 text-xs font-medium text-center line-clamp-2 leading-tight">
                        {game.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              disabled={selectedGames.length < 3}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium mb-3">
                What platforms do you play on?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleTogglePlatform(platform.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all active:scale-[0.98] ${
                      platforms.includes(platform.id)
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/50'
                        : 'border-input bg-background hover:bg-accent'
                    }`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    {platform.label}
                    {platforms.includes(platform.id) && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Playstyle */}
            <div>
              <label className="block text-sm font-medium mb-3">How do you play?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlaystyle('casual')}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-all active:scale-[0.98] ${
                    playstyle === 'casual'
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/50'
                      : 'border-input bg-background hover:bg-accent'
                  }`}
                >
                  <span className="text-2xl">🎮</span>
                  <span>Casual</span>
                  <span className="text-xs text-muted-foreground font-normal">Play for fun</span>
                </button>
                <button
                  onClick={() => setPlaystyle('competitive')}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-all active:scale-[0.98] ${
                    playstyle === 'competitive'
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/50'
                      : 'border-input bg-background hover:bg-accent'
                  }`}
                >
                  <span className="text-2xl">🏆</span>
                  <span>Competitive</span>
                  <span className="text-xs text-muted-foreground font-normal">Play to win</span>
                </button>
              </div>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between rounded-xl border border-input bg-card/50 px-4 py-4">
              <div>
                <p className="font-medium">Enable notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get alerts for patches and important updates
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={isSaving || platforms.length === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
