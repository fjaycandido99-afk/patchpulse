'use client'

import { Sparkles, Bot, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react'

type AIInsightCardProps = {
  insight: string | null
  gameName?: string
  patchTitle?: string
  className?: string
}

// Different insight types for varied styling
function getInsightType(insight: string): {
  icon: typeof Sparkles
  color: string
  bgColor: string
  borderColor: string
} {
  const lowerInsight = insight.toLowerCase()

  if (lowerInsight.includes('nerf') || lowerInsight.includes('weaker') || lowerInsight.includes('reduce')) {
    return {
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    }
  }

  if (lowerInsight.includes('buff') || lowerInsight.includes('stronger') || lowerInsight.includes('increase')) {
    return {
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    }
  }

  if (lowerInsight.includes('important') || lowerInsight.includes('major') || lowerInsight.includes('significant')) {
    return {
      icon: Lightbulb,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    }
  }

  return {
    icon: Sparkles,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  }
}

export function AIInsightCard({
  insight,
  gameName,
  patchTitle,
  className = '',
}: AIInsightCardProps) {
  const displayInsight = insight || 'No AI insight available yet. Check back after the patch analysis is complete.'
  const hasInsight = Boolean(insight)
  const insightType = hasInsight ? getInsightType(displayInsight) : {
    icon: Bot,
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/30',
  }

  const Icon = insightType.icon

  return (
    <div
      className={`relative rounded-xl border ${insightType.borderColor} ${insightType.bgColor} p-4 sm:p-5 ${className}`}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${
            hasInsight ? 'bg-primary' : 'bg-zinc-500'
          }`}
        />
      </div>

      <div className="relative flex gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg ${insightType.bgColor} border ${insightType.borderColor} flex items-center justify-center`}
        >
          <Icon className={`h-5 w-5 ${insightType.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-semibold ${insightType.color}`}>
              AI Insight
            </h3>
            {gameName && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">{gameName}</span>
              </>
            )}
          </div>

          <p className={`text-sm leading-relaxed ${hasInsight ? 'text-foreground' : 'text-muted-foreground italic'}`}>
            {displayInsight}
          </p>

          {patchTitle && hasInsight && (
            <p className="text-xs text-muted-foreground mt-2">
              Regarding: {patchTitle}
            </p>
          )}
        </div>
      </div>

      {/* AI badge */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-medium text-zinc-400">
          <Bot className="h-2.5 w-2.5" />
          AI Generated
        </span>
      </div>
    </div>
  )
}

// Compact version for inline use
export function AIInsightBadge({
  insight,
  className = '',
}: {
  insight: string | null
  className?: string
}) {
  if (!insight) return null

  // Truncate for badge display
  const truncated = insight.length > 60 ? insight.slice(0, 60) + '...' : insight

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
      <span className="text-xs text-foreground/90 line-clamp-1">{truncated}</span>
    </div>
  )
}
