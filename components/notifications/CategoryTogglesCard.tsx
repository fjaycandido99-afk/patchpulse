'use client'

import { useState, useTransition } from 'react'
import { Loader2, Zap, Wrench, Package, Tag, Trophy, Sparkles } from 'lucide-react'
import { updateCategoryPreferences } from '@/app/(main)/notifications/settings/actions'
import { useToastUI } from '@/components/ui/toast'

type CategoryKey = 'notify_major_patches' | 'notify_minor_patches' | 'notify_dlc' | 'notify_sales' | 'notify_esports' | 'notify_cosmetics'

type CategoryConfig = {
  key: CategoryKey
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'notify_major_patches',
    label: 'Major Patches',
    description: 'Big updates, new content, significant changes',
    icon: Zap,
  },
  {
    key: 'notify_minor_patches',
    label: 'Minor Patches',
    description: 'Bug fixes, small balance tweaks, QoL improvements',
    icon: Wrench,
  },
  {
    key: 'notify_dlc',
    label: 'DLC & Expansions',
    description: 'New downloadable content and expansion packs',
    icon: Package,
  },
  {
    key: 'notify_sales',
    label: 'Sales & Deals',
    description: 'Price drops and discounts on your backlog games',
    icon: Tag,
  },
  {
    key: 'notify_esports',
    label: 'Esports News',
    description: 'Tournament results, roster changes, competitive updates',
    icon: Trophy,
  },
  {
    key: 'notify_cosmetics',
    label: 'Cosmetics',
    description: 'Skins, battle passes, and cosmetic content',
    icon: Sparkles,
  },
]

type Props = {
  initialPrefs: {
    notify_major_patches: boolean
    notify_minor_patches: boolean
    notify_dlc: boolean
    notify_sales: boolean
    notify_esports: boolean
    notify_cosmetics: boolean
  }
}

export function CategoryTogglesCard({ initialPrefs }: Props) {
  const [prefs, setPrefs] = useState(initialPrefs)
  const [loadingKey, setLoadingKey] = useState<CategoryKey | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToastUI()

  async function handleToggle(key: CategoryKey) {
    const newValue = !prefs[key]
    setLoadingKey(key)

    // Optimistic update
    setPrefs(prev => ({ ...prev, [key]: newValue }))

    startTransition(async () => {
      const result = await updateCategoryPreferences({ [key]: newValue })

      if (!result.success) {
        // Revert on failure
        setPrefs(prev => ({ ...prev, [key]: !newValue }))
        toast.error(result.error || 'Failed to update preference')
      }

      setLoadingKey(null)
    })
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Notification Categories</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Choose which types of updates you want to be notified about.
      </p>

      <div className="space-y-2">
        {CATEGORIES.map(category => {
          const Icon = category.icon
          const enabled = prefs[category.key]
          const isLoading = loadingKey === category.key

          return (
            <div
              key={category.key}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  enabled ? 'bg-primary/20' : 'bg-zinc-700'
                }`}>
                  <Icon className={`w-5 h-5 ${enabled ? 'text-primary' : 'text-zinc-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleToggle(category.key)}
                disabled={isLoading || isPending}
                className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors ${
                  enabled ? 'bg-primary' : 'bg-zinc-600'
                }`}
                aria-label={enabled ? `Disable ${category.label}` : `Enable ${category.label}`}
              >
                <span
                  className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 flex items-center justify-center ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  {isLoading && (
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                  )}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
