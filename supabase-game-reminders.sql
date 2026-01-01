-- Game Reminders table
-- Users can set reminders for upcoming game releases

CREATE TABLE IF NOT EXISTS game_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL, -- When to send the reminder (e.g., release date morning)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ, -- When the notification was sent (null if not yet)

  UNIQUE(user_id, game_id) -- One reminder per user per game
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_game_reminders_user ON game_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_game_reminders_pending ON game_reminders(remind_at) WHERE notified_at IS NULL;

-- RLS policies
ALTER TABLE game_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminders
CREATE POLICY "Users can view own reminders"
  ON game_reminders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own reminders
CREATE POLICY "Users can create own reminders"
  ON game_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reminders
CREATE POLICY "Users can delete own reminders"
  ON game_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Users can update their own reminders
CREATE POLICY "Users can update own reminders"
  ON game_reminders FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for cron job to send notifications)
CREATE POLICY "Service role full access"
  ON game_reminders FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
