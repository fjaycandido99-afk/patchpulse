'use client'

import { useState } from 'react'
import { CreateNewsForm } from './CreateNewsForm'
import { CreateNewsWithAIForm } from './CreateNewsWithAIForm'

type Game = { id: string; name: string }

type Props = {
  games: Game[]
}

export function NewsFormTabs({ games }: Props) {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'ai'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          AI Processing
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'manual'
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {activeTab === 'ai' ? (
        <CreateNewsWithAIForm games={games} />
      ) : (
        <CreateNewsForm games={games} />
      )}
    </div>
  )
}
