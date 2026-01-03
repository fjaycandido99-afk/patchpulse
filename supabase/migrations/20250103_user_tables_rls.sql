-- Enable Row Level Security on user tables
-- This ensures users can only access their own data

-- ============================================
-- USER_SUBSCRIPTIONS
-- ============================================
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (for initial creation)
CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role has full access (for webhook updates)
CREATE POLICY "Service role full access to subscriptions"
  ON user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- BOOKMARKS
-- ============================================
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access to bookmarks"
  ON bookmarks FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- BACKLOG_ITEMS
-- ============================================
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own backlog
CREATE POLICY "Users can view own backlog"
  ON backlog_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their own backlog
CREATE POLICY "Users can insert own backlog items"
  ON backlog_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own backlog items
CREATE POLICY "Users can update own backlog items"
  ON backlog_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete from their own backlog
CREATE POLICY "Users can delete own backlog items"
  ON backlog_items FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access to backlog"
  ON backlog_items FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- NOTIFICATIONS
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role has full access (for creating notifications)
CREATE POLICY "Service role full access to notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- USER_GAMES (followed games)
-- ============================================
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- Users can view their own followed games
CREATE POLICY "Users can view own followed games"
  ON user_games FOR SELECT
  USING (auth.uid() = user_id);

-- Users can follow games
CREATE POLICY "Users can insert own followed games"
  ON user_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unfollow games
CREATE POLICY "Users can delete own followed games"
  ON user_games FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access to user_games"
  ON user_games FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- CONNECTED_ACCOUNTS (Steam, Xbox, etc.)
-- ============================================
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own connected accounts
CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can connect accounts
CREATE POLICY "Users can insert own connected accounts"
  ON connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their connected accounts
CREATE POLICY "Users can update own connected accounts"
  ON connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can disconnect accounts
CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role full access to connected_accounts"
  ON connected_accounts FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- PROFILES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role has full access
CREATE POLICY "Service role full access to profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');
