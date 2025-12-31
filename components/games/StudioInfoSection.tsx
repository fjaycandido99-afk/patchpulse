'use client'

import { Building2, Award, Gamepad2, Users } from 'lucide-react'
import Link from 'next/link'

type StudioInfoProps = {
  developer: string | null
  publisher: string | null
  studioType: 'AAA' | 'AA' | 'indie' | null
  genre: string | null
  similarGames: string[] | null
  developerNotableGames: string[] | null
}

const studioTypeConfig = {
  AAA: {
    label: 'AAA Studio',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Major game publisher',
  },
  AA: {
    label: 'AA Studio',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Mid-tier studio',
  },
  indie: {
    label: 'Indie',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Independent developer',
  },
}

export function StudioInfoSection({
  developer,
  publisher,
  studioType,
  genre,
  similarGames,
  developerNotableGames,
}: StudioInfoProps) {
  // Don't render if no meaningful data
  if (!developer && !publisher && !genre && !similarGames?.length) {
    return null
  }

  const typeConfig = studioType ? studioTypeConfig[studioType] : null

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-card">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          About This Game
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Developer & Publisher Row */}
        {(developer || publisher) && (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {developer && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Developer</p>
                <p className="text-sm font-medium">{developer}</p>
              </div>
            )}
            {publisher && publisher !== developer && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Publisher</p>
                <p className="text-sm font-medium">{publisher}</p>
              </div>
            )}
          </div>
        )}

        {/* Studio Type & Genre Badges */}
        <div className="flex flex-wrap gap-2">
          {typeConfig && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
              <Users className="h-3 w-3" />
              {typeConfig.label}
            </span>
          )}
          {genre && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Gamepad2 className="h-3 w-3" />
              {genre}
            </span>
          )}
        </div>

        {/* Developer's Notable Games */}
        {developerNotableGames && developerNotableGames.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Award className="h-3 w-3" />
              Also from {developer}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {developerNotableGames.map((game) => (
                <span
                  key={game}
                  className="px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similar Games */}
        {similarGames && similarGames.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Similar to</p>
            <div className="flex flex-wrap gap-1.5">
              {similarGames.map((game) => (
                <span
                  key={game}
                  className="px-2 py-1 rounded-md bg-violet-500/10 text-xs text-violet-400 border border-violet-500/20"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
