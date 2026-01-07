import { Video, Film, Clapperboard, Gamepad2, Trophy } from 'lucide-react'
import { getVideos, getTrendingVideos, getVideoTypes, getForYouVideos } from './queries'
import { VideosFeed } from './VideosFeed'
import { getUserVideoBookmarks } from '../actions/bookmarks'
import { getSession } from '@/lib/auth'
import { getUserPlan } from '@/lib/subscriptions/limits'

type VideoType = 'trailer' | 'clips' | 'gameplay' | 'esports' | 'review' | 'other'

type SearchParams = {
  type?: string
}

// Dynamic header config for each section
const SECTION_CONFIG: Record<string, { title: string; description: string; icon: typeof Video; color: string }> = {
  forYou: {
    title: 'For You',
    description: 'Personalized videos based on games you follow',
    icon: Video,
    color: 'bg-primary/20 text-primary',
  },
  trailer: {
    title: 'Trailers',
    description: 'Latest official game trailers and reveals',
    icon: Film,
    color: 'bg-red-500/20 text-red-400',
  },
  clips: {
    title: 'Clips',
    description: 'Viral gaming moments and streamer highlights',
    icon: Clapperboard,
    color: 'bg-purple-500/20 text-purple-400',
  },
  gameplay: {
    title: 'Gameplay',
    description: 'Top plays, compilations, and gaming montages',
    icon: Gamepad2,
    color: 'bg-blue-500/20 text-blue-400',
  },
  esports: {
    title: 'Esports',
    description: 'Tournament highlights and competitive gaming',
    icon: Trophy,
    color: 'bg-amber-500/20 text-amber-400',
  },
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

  const { user } = await getSession()
  const plan = user ? await getUserPlan(user.id) : 'free'
  const isPro = plan === 'pro'

  // Use personalized "For You" when no filter selected, otherwise use type filter
  const [videos, trendingVideos, videoTypes, savedVideoIds] = await Promise.all([
    selectedType
      ? getVideos({ videoType: selectedType, limit: 50 })
      : getForYouVideos(50), // Personalized feed based on user's library
    getTrendingVideos(10),
    getVideoTypes(),
    getUserVideoBookmarks(),
  ])

  // Get section config based on selected type
  const section = SECTION_CONFIG[selectedType || 'forYou']
  const Icon = section.icon

  return (
    <div className="space-y-4">
      {/* Dynamic Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${section.color.split(' ')[0]}`}>
            <Icon className={`w-5 h-5 ${section.color.split(' ')[1]}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{section.title}</h1>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>
        </div>
        {/* Glow divider */}
        <div className="relative h-0.5 w-full overflow-visible mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        </div>
      </div>

      {/* Videos Feed */}
      <VideosFeed
        videos={videos}
        trendingVideos={trendingVideos}
        videoTypes={videoTypes}
        selectedType={selectedType}
        savedVideoIds={savedVideoIds}
        isPro={isPro}
      />
    </div>
  )
}
