-- ============================================================================
-- PATCHPULSE: AI FEATURES DATABASE SCHEMA
-- Updated to work with existing patch_notes and news_items tables
-- ============================================================================

-- ============================================================================
-- PART 1: AI-GENERATED CONTENT TABLES
-- ============================================================================

-- Patch note summaries (cached AI summaries)
CREATE TABLE IF NOT EXISTS patch_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID NOT NULL REFERENCES patch_notes(id) ON DELETE CASCADE,

  -- Summary content
  tldr TEXT NOT NULL,                    -- 1-2 sentence summary
  key_changes JSONB DEFAULT '[]',        -- Array of important changes
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),  -- How significant is this patch

  -- Metadata
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(patch_id)
);

CREATE INDEX IF NOT EXISTS idx_patch_summaries_patch ON patch_summaries(patch_id);

-- News article summaries
CREATE TABLE IF NOT EXISTS news_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,

  -- Summary content
  tldr TEXT NOT NULL,
  category TEXT,  -- 'update', 'dlc', 'esports', 'review', 'rumor', etc.
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')),

  -- Metadata
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(news_id)
);

CREATE INDEX IF NOT EXISTS idx_news_summaries_news ON news_summaries(news_id);

-- Game sentiment tracking (aggregated from patches, news, community)
CREATE TABLE IF NOT EXISTS game_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Current sentiment
  overall_sentiment TEXT CHECK (overall_sentiment IN ('very_positive', 'positive', 'mixed', 'negative', 'very_negative')),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score BETWEEN -1 AND 1),  -- -1 to 1
  trending TEXT CHECK (trending IN ('up', 'down', 'stable')),

  -- Breakdown
  patch_sentiment DECIMAL(3,2),
  news_sentiment DECIMAL(3,2),
  community_sentiment DECIMAL(3,2),

  -- Key factors
  positive_factors JSONB DEFAULT '[]',   -- What's going well
  negative_factors JSONB DEFAULT '[]',   -- Current issues

  -- Metadata
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  analysis_count INTEGER DEFAULT 1,

  UNIQUE(game_id)
);

CREATE INDEX IF NOT EXISTS idx_game_sentiment_game ON game_sentiment(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sentiment_score ON game_sentiment(sentiment_score DESC);

-- User play recommendations
CREATE TABLE IF NOT EXISTS play_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Recommendation details
  reason TEXT NOT NULL,                  -- Why we're recommending
  match_score INTEGER CHECK (match_score BETWEEN 1 AND 100),
  recommendation_type TEXT CHECK (recommendation_type IN ('return', 'start', 'finish', 'discover')),

  -- Context
  context JSONB DEFAULT '{}',            -- Time available, mood, etc.
  factors JSONB DEFAULT '[]',            -- What influenced this recommendation

  -- Status
  is_dismissed BOOLEAN DEFAULT false,
  is_acted_on BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_play_recommendations_user ON play_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_play_recommendations_active ON play_recommendations(user_id, is_dismissed, expires_at);

-- Game similarity scores (for recommendations)
CREATE TABLE IF NOT EXISTS game_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  similar_game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Similarity metrics
  similarity_score DECIMAL(4,3) CHECK (similarity_score BETWEEN 0 AND 1),
  shared_tags JSONB DEFAULT '[]',
  shared_genres JSONB DEFAULT '[]',

  -- Reasons
  similarity_reasons JSONB DEFAULT '[]',

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(game_id, similar_game_id),
  CHECK (game_id != similar_game_id)
);

CREATE INDEX IF NOT EXISTS idx_game_similarities_game ON game_similarities(game_id);
CREATE INDEX IF NOT EXISTS idx_game_similarities_score ON game_similarities(game_id, similarity_score DESC);

-- User news digest
CREATE TABLE IF NOT EXISTS user_news_digest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Digest content
  digest_date DATE NOT NULL,
  digest_type TEXT CHECK (digest_type IN ('daily', 'weekly')),

  -- Content
  summary TEXT NOT NULL,                 -- Overall digest summary
  highlights JSONB DEFAULT '[]',         -- Top stories
  game_updates JSONB DEFAULT '{}',       -- Updates per game

  -- Metadata
  news_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, digest_date, digest_type)
);

CREATE INDEX IF NOT EXISTS idx_user_news_digest_user ON user_news_digest(user_id, digest_date DESC);

-- Smart notification preferences (learned from user behavior)
CREATE TABLE IF NOT EXISTS smart_notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Learned preferences
  notify_major_patches BOOLEAN DEFAULT true,
  notify_minor_patches BOOLEAN DEFAULT false,
  notify_dlc BOOLEAN DEFAULT true,
  notify_sales BOOLEAN DEFAULT true,
  notify_esports BOOLEAN DEFAULT false,
  notify_cosmetics BOOLEAN DEFAULT false,

  -- Per-game overrides
  game_overrides JSONB DEFAULT '{}',     -- { game_id: { notify_all: true/false } }

  -- Learning data
  interaction_history JSONB DEFAULT '[]', -- Recent notification interactions
  last_learned_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_smart_notification_prefs_user ON smart_notification_prefs(user_id);

-- AI processing queue
CREATE TABLE IF NOT EXISTS ai_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task info
  task_type TEXT NOT NULL,  -- 'patch_summary', 'news_summary', 'sentiment', 'recommendations', 'digest'
  entity_type TEXT,         -- 'patch', 'news', 'game', 'user'
  entity_id UUID,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

  -- Metadata
  payload JSONB DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_processing_queue(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_queue_entity ON ai_processing_queue(entity_type, entity_id);

-- ============================================================================
-- PART 2: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE patch_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_news_digest ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;

-- Public read access for cached AI content
DROP POLICY IF EXISTS "Anyone can read patch summaries" ON patch_summaries;
CREATE POLICY "Anyone can read patch summaries" ON patch_summaries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read news summaries" ON news_summaries;
CREATE POLICY "Anyone can read news summaries" ON news_summaries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read game sentiment" ON game_sentiment;
CREATE POLICY "Anyone can read game sentiment" ON game_sentiment FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read game similarities" ON game_similarities;
CREATE POLICY "Anyone can read game similarities" ON game_similarities FOR SELECT USING (true);

-- User-specific content
DROP POLICY IF EXISTS "Users can read own recommendations" ON play_recommendations;
CREATE POLICY "Users can read own recommendations" ON play_recommendations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendations" ON play_recommendations;
CREATE POLICY "Users can update own recommendations" ON play_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own digest" ON user_news_digest;
CREATE POLICY "Users can read own digest" ON user_news_digest
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own notification prefs" ON smart_notification_prefs;
CREATE POLICY "Users can manage own notification prefs" ON smart_notification_prefs
  FOR ALL USING (auth.uid() = user_id);

-- Service role access for AI operations
DROP POLICY IF EXISTS "Service role manages AI queue" ON ai_processing_queue;
CREATE POLICY "Service role manages AI queue" ON ai_processing_queue
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role creates summaries" ON patch_summaries;
CREATE POLICY "Service role creates summaries" ON patch_summaries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role creates news summaries" ON news_summaries;
CREATE POLICY "Service role creates news summaries" ON news_summaries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages sentiment" ON game_sentiment;
CREATE POLICY "Service role manages sentiment" ON game_sentiment
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role creates recommendations" ON play_recommendations;
CREATE POLICY "Service role creates recommendations" ON play_recommendations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages similarities" ON game_similarities;
CREATE POLICY "Service role manages similarities" ON game_similarities
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role creates digests" ON user_news_digest;
CREATE POLICY "Service role creates digests" ON user_news_digest
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PART 3: HELPER FUNCTIONS
-- ============================================================================

-- Function to queue AI processing
CREATE OR REPLACE FUNCTION queue_ai_task(
  p_task_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_priority INTEGER DEFAULT 5,
  p_payload JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
BEGIN
  INSERT INTO ai_processing_queue (task_type, entity_type, entity_id, priority, payload)
  VALUES (p_task_type, p_entity_type, p_entity_id, p_priority, p_payload)
  RETURNING id INTO v_task_id;

  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to queue patch summary when new patch is added
CREATE OR REPLACE FUNCTION trigger_queue_patch_summary()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM queue_ai_task('patch_summary', 'patch', NEW.id, 7);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_patch_created_queue_summary ON patch_notes;
CREATE TRIGGER on_patch_created_queue_summary
  AFTER INSERT ON patch_notes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_queue_patch_summary();

-- Trigger to queue news summary
CREATE OR REPLACE FUNCTION trigger_queue_news_summary()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM queue_ai_task('news_summary', 'news', NEW.id, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_news_created_queue_summary ON news_items;
CREATE TRIGGER on_news_created_queue_summary
  AFTER INSERT ON news_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_queue_news_summary();
