import { getWhatsNewSummary } from '@/lib/ai/whats-new'
import { Sparkles, FileText, Newspaper } from 'lucide-react'

type Props = {
  gameId: string
}

export async function WhatsNew({ gameId }: Props) {
  const summary = await getWhatsNewSummary(gameId)

  if (!summary) {
    return null
  }

  const hasChanges = summary.patchCount > 0 || summary.newsCount > 0

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-blue-400" />
        <h2 className="font-semibold">What&apos;s New</h2>
        {hasChanges && (
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            {summary.patchCount > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {summary.patchCount} patch{summary.patchCount !== 1 ? 'es' : ''}
              </span>
            )}
            {summary.newsCount > 0 && (
              <span className="flex items-center gap-1">
                <Newspaper className="h-3 w-3" />
                {summary.newsCount} news
              </span>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground whitespace-pre-line">
        {summary.summary}
      </div>
    </div>
  )
}
