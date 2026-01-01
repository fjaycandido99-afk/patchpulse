'use client'

import { useState } from 'react'
import { BarChart3, Brain, Bell, Zap } from 'lucide-react'
import { DiffIntelligence } from './DiffIntelligence'
import { SentimentTrends } from './SentimentTrends'
import { PriorityAlerts } from './PriorityAlerts'

export function ProPowerTools() {
  const [diffModalOpen, setDiffModalOpen] = useState(false)
  const [sentimentModalOpen, setSentimentModalOpen] = useState(false)
  const [alertsModalOpen, setAlertsModalOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Pro Power Tools</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Diff Intelligence */}
          <button
            onClick={() => setDiffModalOpen(true)}
            className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-left hover:border-blue-500/40 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium text-blue-300 group-hover:text-blue-200">Diff Intelligence</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              See buffs, nerfs, new mechanics, and whether patches are safe to skip.
            </p>
          </button>

          {/* Sentiment Trends */}
          <button
            onClick={() => setSentimentModalOpen(true)}
            className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-left hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <h4 className="font-medium text-emerald-300 group-hover:text-emerald-200">Sentiment Trends</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Track if updates are improving or declining your games over time.
            </p>
          </button>

          {/* Priority Alerts */}
          <button
            onClick={() => setAlertsModalOpen(true)}
            className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 text-left hover:border-purple-500/40 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h4 className="font-medium text-purple-300 group-hover:text-purple-200">Priority Alerts</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Get notified only for major updates, sentiment flips, or backlog games waking up.
            </p>
          </button>
        </div>
      </div>

      {/* Modals */}
      <DiffIntelligence isOpen={diffModalOpen} onClose={() => setDiffModalOpen(false)} />
      <SentimentTrends isOpen={sentimentModalOpen} onClose={() => setSentimentModalOpen(false)} />
      <PriorityAlerts isOpen={alertsModalOpen} onClose={() => setAlertsModalOpen(false)} />
    </>
  )
}
