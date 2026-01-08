'use client'

import { useState, useEffect } from 'react'
import { Crown, Plus, Zap, Scale, RotateCcw, Layers, AlertTriangle, Trash2, Pencil, Loader2, Bell } from 'lucide-react'
import { useToastUI } from '@/components/ui/toast'
import { PriorityAlertRuleEditor } from './PriorityAlertRuleEditor'

type RuleType = 'major_patch' | 'balance_changes' | 'resurfacing' | 'new_content' | 'high_priority' | 'custom'

type PriorityAlertRule = {
  id: string
  name: string
  description: string | null
  enabled: boolean
  rule_type: RuleType
  applies_to: 'all_games' | 'followed_games' | 'specific_games'
  game_ids: string[] | null
  thresholds: Record<string, number>
  priority_boost: number
  force_push: boolean
}

type Props = {
  isPro: boolean
  followedGames: Array<{ id: string; name: string }>
}

const RULE_TYPE_CONFIG: Record<RuleType, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  major_patch: { label: 'Major Patch', icon: Zap, description: 'High impact updates' },
  balance_changes: { label: 'Balance Changes', icon: Scale, description: 'Significant buffs/nerfs' },
  resurfacing: { label: 'Resurfacing', icon: RotateCcw, description: 'Dormant game gets update' },
  new_content: { label: 'New Content', icon: Layers, description: 'New systems added' },
  high_priority: { label: 'High Priority', icon: AlertTriangle, description: 'Priority threshold' },
  custom: { label: 'Custom', icon: Bell, description: 'Custom conditions' },
}

export function PriorityAlertRulesSection({ isPro, followedGames }: Props) {
  const [rules, setRules] = useState<PriorityAlertRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PriorityAlertRule | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToastUI()

  useEffect(() => {
    if (isPro) {
      fetchRules()
    } else {
      setIsLoading(false)
    }
  }, [isPro])

  async function fetchRules() {
    try {
      const res = await fetch('/api/priority-alerts')
      const data = await res.json()
      if (data.rules) {
        setRules(data.rules)
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error)
      toast.error('Failed to load priority alert rules')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteRule(ruleId: string) {
    setDeletingId(ruleId)
    try {
      const res = await fetch(`/api/priority-alerts?id=${ruleId}`, { method: 'DELETE' })
      if (res.ok) {
        setRules(prev => prev.filter(r => r.id !== ruleId))
        toast.success('Rule deleted')
      } else {
        toast.error('Failed to delete rule')
      }
    } catch {
      toast.error('Failed to delete rule')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggleRule(rule: PriorityAlertRule) {
    const newEnabled = !rule.enabled
    // Optimistic update
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: newEnabled } : r))

    try {
      const res = await fetch('/api/priority-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, enabled: newEnabled }),
      })
      if (!res.ok) {
        // Revert
        setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !newEnabled } : r))
        toast.error('Failed to update rule')
      }
    } catch {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !newEnabled } : r))
      toast.error('Failed to update rule')
    }
  }

  function handleEditRule(rule: PriorityAlertRule) {
    setEditingRule(rule)
    setIsEditorOpen(true)
  }

  function handleCreateRule() {
    setEditingRule(null)
    setIsEditorOpen(true)
  }

  function handleEditorClose() {
    setIsEditorOpen(false)
    setEditingRule(null)
  }

  function handleRuleSaved(savedRule: PriorityAlertRule) {
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === savedRule.id ? savedRule : r))
    } else {
      setRules(prev => [savedRule, ...prev])
    }
    handleEditorClose()
  }

  // Free user - show upgrade prompt
  if (!isPro) {
    return (
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Priority Alert Rules</h2>

        <div className="relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">Unlock Priority Alerts</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create custom rules to get notified about exactly what matters to you.
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Alert on major patches with high impact</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Scale className="w-4 h-4 text-primary" />
                  <span>Get notified about balance changes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span>Know when dormant games resurface</span>
                </div>
              </div>

              <a
                href="/pricing"
                className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </a>

              <p className="mt-2 text-xs text-muted-foreground">
                Starting at $4.99/month
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Pro user - show rules management
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Priority Alert Rules</h2>
          <p className="text-sm text-muted-foreground">
            Create rules to boost priority or force push for specific updates.
          </p>
        </div>
        <button
          onClick={handleCreateRule}
          disabled={rules.length >= 10}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            No priority alert rules yet. Create one to get started.
          </p>
          <button
            onClick={handleCreateRule}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => {
            const config = RULE_TYPE_CONFIG[rule.rule_type]
            const Icon = config.icon
            const isDeleting = deletingId === rule.id

            return (
              <div
                key={rule.id}
                className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                  rule.enabled
                    ? 'bg-zinc-800/50 border-border'
                    : 'bg-zinc-800/20 border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    rule.enabled ? 'bg-primary/20' : 'bg-zinc-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${rule.enabled ? 'text-primary' : 'text-zinc-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label} &bull; {rule.applies_to.replace('_', ' ')}
                      {rule.force_push && ' &bull; Force push'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-700 transition-colors"
                    title="Edit rule"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete rule"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors ${
                      rule.enabled ? 'bg-primary' : 'bg-zinc-600'
                    }`}
                    aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  >
                    <span
                      className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )
          })}

          {rules.length >= 10 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Maximum of 10 rules reached.
            </p>
          )}
        </div>
      )}

      {isEditorOpen && (
        <PriorityAlertRuleEditor
          rule={editingRule}
          followedGames={followedGames}
          onClose={handleEditorClose}
          onSave={handleRuleSaved}
        />
      )}
    </section>
  )
}
