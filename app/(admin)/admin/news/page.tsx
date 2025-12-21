import { getNewsItems } from './actions'
import { getGamesForSelect } from '../games/actions'
import { NewsFormTabs } from './NewsFormTabs'
import { EditNewsButton } from './EditNewsButton'
import { DeleteNewsButton } from './DeleteNewsButton'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminNewsPage() {
  const [newsItems, games] = await Promise.all([
    getNewsItems(),
    getGamesForSelect(),
  ])

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold mb-6">Add News Item</h1>
        <div className="max-w-xl">
          <NewsFormTabs games={games} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          News Items ({newsItems.length})
        </h2>

        {newsItems.length === 0 ? (
          <p className="text-sm text-zinc-500">No news items yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">{item.title}</p>
                    {item.is_rumor && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Rumor
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{formatDate(item.published_at)}</span>
                    {item.game && (
                      <>
                        <span>·</span>
                        <span className="text-zinc-400">{item.game.name}</span>
                      </>
                    )}
                    {!item.game && (
                      <>
                        <span>·</span>
                        <span className="text-zinc-500 italic">General</span>
                      </>
                    )}
                  </div>

                  {item.summary && (
                    <p className="text-sm text-zinc-400 line-clamp-2">{item.summary}</p>
                  )}

                  {item.topics && item.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-xs rounded bg-white/5 text-zinc-500 border border-white/5"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.source_name && (
                    <p className="text-xs text-zinc-600">
                      Source: {item.source_url ? (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-white underline"
                        >
                          {item.source_name}
                        </a>
                      ) : (
                        item.source_name
                      )}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <EditNewsButton news={item} games={games} />
                  <DeleteNewsButton newsId={item.id} newsTitle={item.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
