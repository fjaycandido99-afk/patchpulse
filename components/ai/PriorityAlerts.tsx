'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Bell, Trash2, ToggleLeft, ToggleRight, Zap, TrendingUp, RefreshCw, Sparkles, AlertTriangle, Loader2 } from 'lucide-react'

type RuleType =
  | 'major_patch'
  | 'balance_changes'
  | 'resurfacing'
  | 'new_content'
  | 'high_priority'

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
  created_at: string
}

const RULE_PRESETS: {
  type: RuleType
  name: string
  description: string
  icon: typeof Zap
  color: string
  defaultThresholds: Record<string, number>
}[] = [
  {
    type: 'major_patch',
    name: 'Major Patches',
    description: 'High impact patches (score 7+)',
    icon: Zap,
    color: 'amber',
    defaultThresholds: { impact_score: 7 },
  },
  {
    type: 'balance_changes',
    name: 'Balance Changes',
    description: 'Significant buffs or nerfs (3+)',
    icon: TrendingUp,
    color: 'blue',
    defaultThresholds: { buffs_min: 3, nerfs_min: 3 },
  },
  {
    type: 'resurfacing',
    name: 'Resurfacing Games',
    description: 'Dormant games getting updates',
    icon: RefreshCw,
    color: 'emerald',
    defaultThresholds: { dormant_days: 90 },
  },
  {
    type: 'new_content',
    name: 'New Content',
    description: 'DLC, new systems, major features',
    icon: Sparkles,
    color: 'purple',
    defaultThresholds: { new_systems_min: 1 },
  },
  {
    type: 'high_priority',
    name: 'High Priority',
    description: 'Any notification with priority 4+',
    icon: AlertTriangle,
    color: 'red',
    defaultThresholds: { priority: 4 },
  },
]

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function PriorityAlerts({ isOpen, onClose }: Props) {
  const [rules, setRules] = useState<PriorityAlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchRules()
    }
  }, [isOpen])

  async function fetchRules() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/priority-alerts')
      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) {
          setError('Pro subscription required for Priority Alerts')
        } else {
          setError(data.error || 'Failed to fetch rules')
        }
        return
      }

      setRules(data.rules || [])
    } catch {
      setError('Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  async function createRule(preset: typeof RULE_PRESETS[0]) {
    setCreating(true)
    try {
      const res = await fetch('/api/priority-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preset.name,
          description: preset.description,
          rule_type: preset.type,
          applies_to: 'followed_games',
          thresholds: preset.defaultThresholds,
          priority_boost: 1,
          force_push: true,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create rule')
        return
      }

      setRules(prev => [data.rule, ...prev])
      setShowPresets(false)
    } catch {
      setError('Failed to create rule')
    } finally {
      setCreating(false)
    }
  }

  async function toggleRule(ruleId: string, enabled: boolean) {
    // Optimistic update
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled } : r))

    try {
      const res = await fetch('/api/priority-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, enabled }),
      })

      if (!res.ok) {
        // Revert on error
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !enabled } : r))
      }
    } catch {
      // Revert on error
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !enabled } : r))
    }
  }

  async function deleteRule(ruleId: string) {
    const prevRules = rules
    setRules(prev => prev.filter(r => r.id !== ruleId))

    try {
      const res = await fetch(`/api/priority-alerts?id=${ruleId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        setRules(prevRules)
      }
    } catch {
      setRules(prevRules)
    }
  }

  function getRuleIcon(type: RuleType) {
    const preset = RULE_PRESETS.find(p => p.type === type)
    return preset?.icon || Bell
  }

  function getRuleColor(type: RuleType) {
    const preset = RULE_PRESETS.find(p => p.type === type)
    return preset?.color || 'gray'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">Priority Alerts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-300">{error}</p>
            </div>
          ) : (
            <>
              {/* Existing Rules */}
              {rules.length > 0 ? (
                <div className="space-y-3">
                  {rules.map(rule => {
                    const Icon = getRuleIcon(rule.rule_type)
                    const color = getRuleColor(rule.rule_type)
                    return (
                      <div
                        key={rule.id}
                        className={`p-4 rounded-xl border transition-all ${
                          rule.enabled
                            ? `border-${color}-500/30 bg-${color}-500/5`
                            : 'border-white/10 bg-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                              <Icon className={`w-4 h-4 text-${color}-400`} />
                            </div>
                            <div>
                              <h4 className="font-medium">{rule.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {rule.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                                  {rule.applies_to.replace('_', ' ')}
                                </span>
                                {rule.force_push && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                    Push
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRule(rule.id, !rule.enabled)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              {rule.enabled ? (
                                <ToggleRight className="w-6 h-6 text-green-400" />
                              ) : (
                                <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteRule(rule.id)}
                              className="p-1 hover:bg-red-500/20 rounded transition-colors text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No alert rules yet. Add one to get notified about important updates.
                  </p>
                </div>
              )}

              {/* Add Rule Button */}
              {!showPresets && rules.length < 10 && (
                <button
                  onClick={() => setShowPresets(true)}
                  className="w-full p-4 rounded-xl border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-purple-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Alert Rule</span>
                </button>
              )}

              {/* Presets Selection */}
              {showPresets && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Choose a preset:</h4>
                    <button
                      onClick={() => setShowPresets(false)}
                      className="text-xs text-muted-foreground hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {RULE_PRESETS.map(preset => {
                      const Icon = preset.icon
                      const alreadyExists = rules.some(r => r.rule_type === preset.type)
                      return (
                        <button
                          key={preset.type}
                          onClick={() => !alreadyExists && !creating && createRule(preset)}
                          disabled={alreadyExists || creating}
                          className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                            alreadyExists
                              ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                              : `border-${preset.color}-500/20 hover:border-${preset.color}-500/40 hover:bg-${preset.color}-500/5`
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-${preset.color}-500/20`}>
                            <Icon className={`w-4 h-4 text-${preset.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{preset.name}</h5>
                            <p className="text-xs text-muted-foreground">{preset.description}</p>
                          </div>
                          {alreadyExists && (
                            <span className="text-xs text-muted-foreground">Added</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {rules.length >= 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  Maximum of 10 rules reached
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-black/20 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Rules automatically boost notification priority and enable push notifications for matching updates.
          </p>
        </div>
      </div>
    </div>
  )
}
