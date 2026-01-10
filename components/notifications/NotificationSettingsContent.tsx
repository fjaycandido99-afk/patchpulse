'use client'

import { CategoryTogglesCard } from './CategoryTogglesCard'
import { GameMuteSection } from './GameMuteSection'
import { PriorityAlertRulesSection } from './PriorityAlertRulesSection'
import { PushNotificationToggle } from './PushNotificationToggle'

type CategoryPrefs = {
  notify_major_patches: boolean
  notify_minor_patches: boolean
  notify_dlc: boolean
  notify_sales: boolean
  notify_esports: boolean
  notify_cosmetics: boolean
}

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  muted: boolean
}

type Props = {
  categoryPrefs: CategoryPrefs
  games: Game[]
  isPro: boolean
}

export function NotificationSettingsContent({ categoryPrefs, games, isPro }: Props) {
  const followedGamesSimple = games.map(g => ({ id: g.id, name: g.name }))

  return (
    <div className="space-y-6">
      <PushNotificationToggle />
      <CategoryTogglesCard initialPrefs={categoryPrefs} />
      <GameMuteSection games={games} />
      <PriorityAlertRulesSection isPro={isPro} followedGames={followedGamesSimple} />
    </div>
  )
}
