import { getPatchNotes } from './actions'
import { getGamesForSelect } from '../games/actions'
import { CreatePatchForm } from './CreatePatchForm'
import { CreatePatchWithAIForm } from './CreatePatchWithAIForm'
import { EditPatchButton } from './EditPatchButton'
import { DeletePatchButton } from './DeletePatchButton'
import { PatchFormTabs } from './PatchFormTabs'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getImpactLabel(score: number): { label: string; className: string } {
  if (score >= 8) return { label: 'Major', className: 'bg-red-500/20 text-red-400' }
  if (score >= 5) return { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400' }
  return { label: 'Minor', className: 'bg-green-500/20 text-green-400' }
}

export default async function AdminPatchesPage() {
  const [patches, games] = await Promise.all([
    getPatchNotes(),
    getGamesForSelect(),
  ])

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold mb-6">Add Patch Note</h1>
        <div className="max-w-xl">
          <PatchFormTabs games={games} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Patch Notes ({patches.length})
        </h2>

        {patches.length === 0 ? (
          <p className="text-sm text-zinc-500">No patch notes yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {patches.map((patch) => {
              const impact = getImpactLabel(patch.impact_score)
              return (
                <div
                  key={patch.id}
                  className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white">{patch.title}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${impact.className}`}>
                        {impact.label} ({patch.impact_score}/10)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{formatDate(patch.published_at)}</span>
                      {patch.game && (
                        <>
                          <span>·</span>
                          <span className="text-zinc-400">{patch.game.name}</span>
                        </>
                      )}
                    </div>

                    {patch.summary_tldr && (
                      <p className="text-sm text-zinc-400 line-clamp-2">{patch.summary_tldr}</p>
                    )}

                    {patch.tags && patch.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {patch.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded bg-white/5 text-zinc-500 border border-white/5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {patch.source_url && (
                      <p className="text-xs text-zinc-600">
                        Source:{' '}
                        <a
                          href={patch.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-white underline"
                        >
                          {new URL(patch.source_url).hostname}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <EditPatchButton patch={patch} games={games} />
                    <DeletePatchButton patchId={patch.id} patchTitle={patch.title} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
