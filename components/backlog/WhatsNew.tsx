import { getWhatsNewSummary } from '@/lib/ai/whats-new'
import { getWhatsNewContext } from '@/app/(main)/backlog/activity-actions'
import { Sparkles, FileText, Newspaper, CheckCircle, AlertCircle, Info } from 'lucide-react'

type Props = {
  gameId: string
}

export async function WhatsNew({ gameId }: Props) {
  // Get both AI summary and activity context
  const [summary, context] = await Promise.all([
    getWhatsNewSummary(gameId).catch(() => null),
    getWhatsNewContext(gameId),
  ])

  // If neither available, don't show anything
  if (!summary && !context) {
    return null
  }

  const hasChanges = (summary?.patchCount || 0) > 0 || (summary?.newsCount || 0) > 0
  const hasMajorUpdates = (context?.majorPatches?.length || 0) > 0
  const hasBalanceChanges = (context?.balanceChanges?.length || 0) > 0

  // Determine the visual treatment based on update type
  const borderColor = hasMajorUpdates
    ? 'border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent'
    : hasBalanceChanges
      ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent'
      : hasChanges
        ? 'border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent'
        : 'border-border bg-card'

  const headerIcon = hasMajorUpdates
    ? <AlertCircle className="h-5 w-5 text-red-400" />
    : hasBalanceChanges
      ? <Info className="h-5 w-5 text-amber-400" />
      : hasChanges
        ? <Sparkles className="h-5 w-5 text-blue-400" />
        : <CheckCircle className="h-5 w-5 text-green-400" />

  const headerText = hasMajorUpdates
    ? 'Major Updates Available'
    : hasBalanceChanges
      ? 'Balance Changes Detected'
      : hasChanges
        ? "What's New"
        : 'All Caught Up'

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-3">
        {headerIcon}
        <h2 className="font-semibold">{headerText}</h2>
        {hasChanges && (
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            {(summary?.patchCount || 0) > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {summary?.patchCount} patch{summary?.patchCount !== 1 ? 'es' : ''}
              </span>
            )}
            {(summary?.newsCount || 0) > 0 && (
              <span className="flex items-center gap-1">
                <Newspaper className="h-3 w-3" />
                {summary?.newsCount} news
              </span>
            )}
          </div>
        )}
      </div>

      {/* AI Summary */}
      {summary?.summary && (
        <div className="text-sm text-muted-foreground whitespace-pre-line">
          {summary.summary}
        </div>
      )}

      {/* Context info when no AI summary but have context */}
      {!summary?.summary && context?.contextMessage && (
        <div className="text-sm text-muted-foreground">
          {context.contextMessage}
        </div>
      )}

      {/* Severity breakdown for Pro users */}
      {hasChanges && (hasMajorUpdates || hasBalanceChanges) && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2 text-xs">
          {hasMajorUpdates && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="h-3 w-3" />
              {context?.majorPatches?.length} major
            </span>
          )}
          {hasBalanceChanges && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Info className="h-3 w-3" />
              {context?.balanceChanges?.length} balance
            </span>
          )}
          {(context?.minorPatches?.length || 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
              {context?.minorPatches?.length} minor
            </span>
          )}
        </div>
      )}
    </div>
  )
}
