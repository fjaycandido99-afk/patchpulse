import { Video } from 'lucide-react'
import { getVideos, getTrendingVideos, getVideoTypes, getGamesWithVideos } from './queries'
import { VideosFeed } from './VideosFeed'

type VideoType = 'trailer' | 'clips' | 'gameplay' | 'esports' | 'review' | 'other'

type SearchParams = {
  type?: string
  game?: string
}

export const metadata = {
  title: 'Videos | PatchPulse',
  description: 'Watch game trailers, gameplay clips, esports highlights, and more.',
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const selectedType = (params.type as VideoType) || null
  const selectedGame = params.game || null

  const [videos, trendingVideos, videoTypes, games] = await Promise.all([
    getVideos({ videoType: selectedType || undefined, gameId: selectedGame || undefined, limit: 50 }),
    getTrendingVideos(4),
    getVideoTypes(),
    getGamesWithVideos(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <Video className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Videos</h1>
            <p className="text-sm text-muted-foreground">
              Trailers, clips, gameplay, and esports highlights
            </p>
          </div>
        </div>
      </div>

      {/* Videos Feed */}
      <VideosFeed
        videos={videos}
        trendingVideos={trendingVideos}
        videoTypes={videoTypes}
        games={games}
        selectedType={selectedType}
        selectedGame={selectedGame}
      />
    </div>
  )
}
