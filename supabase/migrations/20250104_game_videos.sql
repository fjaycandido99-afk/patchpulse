-- Game videos table for caching YouTube videos
CREATE TABLE IF NOT EXISTS public.game_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  channel_name TEXT,
  channel_id TEXT,
  video_type TEXT NOT NULL CHECK (video_type IN ('trailer', 'clips', 'gameplay', 'esports', 'review', 'other')),
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to avoid duplicates
  UNIQUE(game_id, youtube_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_videos_game_id ON public.game_videos(game_id);
CREATE INDEX IF NOT EXISTS idx_game_videos_type ON public.game_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_game_videos_published ON public.game_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_videos_featured ON public.game_videos(is_featured) WHERE is_featured = TRUE;

-- Enable RLS
ALTER TABLE public.game_videos ENABLE ROW LEVEL SECURITY;

-- Everyone can read videos
CREATE POLICY "Anyone can view game videos"
  ON public.game_videos FOR SELECT
  USING (true);

-- Add comment
COMMENT ON TABLE public.game_videos IS 'Cached YouTube videos for games (trailers, updates, gameplay, esports)';
