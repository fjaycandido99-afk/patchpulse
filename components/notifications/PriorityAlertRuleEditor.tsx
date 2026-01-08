'use client'

import { useState } from 'react'
import { X, Loader2, Zap, Scale, RotateCcw, Layers, AlertTriangle, Bell } from 'lucide-react'
import { useToastUI } from '@/components/ui/toast'

type RuleType = 'major_patch' | 'balance_changes' | 'resurfacing' | 'new_content' | 'high_priority' | 'custom'
type AppliesTo = 'all_games' | 'followed_games' | 'specific_games'

type PriorityAlertRule = {
  id: string
  name: string
  description: string | null
  enabled: boolean
  rule_type: RuleType
  applies_to: AppliesTo
  game_ids: string[] | null
  thresholds: Record<string, number>
  priority_boost: number
  force_push: boolean
}

type Props = {
  rule: PriorityAlertRule | null
  followedGames: Array<{ id: string; name: string }>
  onClose: () => void
  onSave: (rule: PriorityAlertRule) => void
}

const RULE_TYPES: { value: RuleType; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { value: 'major_patch', label: 'Major Patch', icon: Zap, description: 'Notify when impact score exceeds threshold' },
  { value: 'balance_changes', label: 'Balance Changes', icon: Scale, description: 'Notify when significant buffs/nerfs detected' },
  { value: 'resurfacing', label: 'Resurfacing', icon: RotateCcw, description: 'Notify when dormant game gets an update' },
  { value: 'new_content', label: 'New Content', icon: Layers, description: 'Notify when new systems are added' },
  { value: 'high_priority', label: 'High Priority', icon: AlertTriangle, description: 'Notify when notification priority exceeds threshold' },
]

const APPLIES_TO_OPTIONS: { value: AppliesTo; label: string }[] = [
  { value: 'followed_games', label: 'My followed games' },
  { value: 'all_games', label: 'All games' },
  { value: 'specific_games', label: 'Specific games' },
]

export function PriorityAlertRuleEditor({ rule, followedGames, onClose, onSave }: Props) {
  const isEditing = !!rule

  const [name, setName] = useState(rule?.name || '')
  const [ruleType, setRuleType] = useState<RuleType>(rule?.rule_type || 'major_patch')
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(rule?.applies_to || 'followed_games')
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(rule?.game_ids || [])
  const [thresholds, setThresholds] = useState<Record<string, number>>(rule?.thresholds || {})
  const [priorityBoost, setPriorityBoost] = useState(rule?.priority_boost || 1)
  const [forcePush, setForcePush] = useState(rule?.force_push || false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToastUI()

  function getDefaultThreshold(type: RuleType): Record<string, number> {
    switch (type) {
      case 'major_patch':
        return { impact_score: 7 }
      case 'balance_changes':
        return { buffs_min: 3, nerfs_min: 3 }
      case 'new_content':
        return { new_systems_min: 1 }
      case 'high_priority':
        return { priority: 4 }
      default:
        return {}
    }
  }

  function handleRuleTypeChange(type: RuleType) {
    setRuleType(type)
    setThresholds(getDefaultThreshold(type))
  }

  function toggleGameSelection(gameId: string) {
    setSelectedGameIds(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    )
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Please enter a rule name')
      return
    }

    if (appliesTo === 'specific_games' && selectedGameIds.length === 0) {
      toast.error('Please select at least one game')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        id: rule?.id,
        name: name.trim(),
        rule_type: ruleType,
        applies_to: appliesTo,
        game_ids: appliesTo === 'specific_games' ? selectedGameIds : null,
        thresholds: Object.keys(thresholds).length > 0 ? thresholds : getDefaultThreshold(ruleType),
        priority_boost: priorityBoost,
        force_push: forcePush,
        enabled: rule?.enabled ?? true,
      }

      const res = await fetch('/api/priority-alerts', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.rule) {
        toast.success(isEditing ? 'Rule updated' : 'Rule created')
        onSave(data.rule)
      } else {
        toast.error(data.error || 'Failed to save rule')
      }
    } catch {
      toast.error('Failed to save rule')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
          <h3 className="text-lg font-semibold">
            {isEditing ? 'Edit Rule' : 'Create Priority Alert Rule'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alert me on major Valorant patches"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={100}
            />
          </div>

          {/* Rule Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Rule Type</label>
            <div className="space-y-2">
              {RULE_TYPES.map(type => {
                const Icon = type.icon
                const isSelected = ruleType === type.value

                return (
                  <button
                    key={type.value}
                    onClick={() => handleRuleTypeChange(type.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary/20' : 'bg-zinc-700'
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-zinc-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Threshold settings based on rule type */}
          {ruleType === 'major_patch' && (
            <div>
              <label className="block text-sm font-medium mb-2">Impact Score Threshold</label>
              <input
                type="number"
                min={1}
                max={10}
                value={thresholds.impact_score || 7}
                onChange={(e) => setThresholds({ impact_score: parseInt(e.target.value) || 7 })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">Alert when patch impact score is at least this value (1-10)</p>
            </div>
          )}

          {ruleType === 'balance_changes' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Buffs</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={thresholds.buffs_min || 3}
                  onChange={(e) => setThresholds(prev => ({ ...prev, buffs_min: parseInt(e.target.value) || 3 }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Nerfs</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={thresholds.nerfs_min || 3}
                  onChange={(e) => setThresholds(prev => ({ ...prev, nerfs_min: parseInt(e.target.value) || 3 }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">Alert when at least this many buffs OR nerfs are detected</p>
            </div>
          )}

          {ruleType === 'new_content' && (
            <div>
              <label className="block text-sm font-medium mb-2">Min New Systems</label>
              <input
                type="number"
                min={1}
                max={10}
                value={thresholds.new_systems_min || 1}
                onChange={(e) => setThresholds({ new_systems_min: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">Alert when at least this many new systems are added</p>
            </div>
          )}

          {ruleType === 'high_priority' && (
            <div>
              <label className="block text-sm font-medium mb-2">Priority Threshold</label>
              <input
                type="number"
                min={1}
                max={5}
                value={thresholds.priority || 4}
                onChange={(e) => setThresholds({ priority: parseInt(e.target.value) || 4 })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">Alert when notification priority is at least this value (1-5)</p>
            </div>
          )}

          {/* Applies To */}
          <div>
            <label className="block text-sm font-medium mb-2">Applies To</label>
            <div className="flex flex-wrap gap-2">
              {APPLIES_TO_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setAppliesTo(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appliesTo === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-zinc-800 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game Selection */}
          {appliesTo === 'specific_games' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Games</label>
              {followedGames.length === 0 ? (
                <p className="text-sm text-muted-foreground">No followed games. Follow some games first.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                  {followedGames.map(game => (
                    <label
                      key={game.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGameIds.includes(game.id)}
                        onChange={() => toggleGameSelection(game.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{game.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Priority Boost */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority Boost</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={2}
                value={priorityBoost}
                onChange={(e) => setPriorityBoost(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">+{priorityBoost}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Boost the priority of matching notifications</p>
          </div>

          {/* Force Push */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50">
            <div>
              <p className="text-sm font-medium">Force Push Notification</p>
              <p className="text-xs text-muted-foreground">Always send push for matching updates</p>
            </div>
            <button
              onClick={() => setForcePush(!forcePush)}
              className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors ${
                forcePush ? 'bg-primary' : 'bg-zinc-600'
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  forcePush ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t border-border bg-card">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  )
}
