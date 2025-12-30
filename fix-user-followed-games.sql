-- Fix for: relation "user_followed_games" does not exist
-- The app uses "user_games" but some triggers reference "user_followed_games"
-- This creates a view to alias the table

-- Create a view that maps user_followed_games to user_games
CREATE OR REPLACE VIEW user_followed_games AS
SELECT * FROM user_games;

-- Grant same permissions as user_games
GRANT SELECT ON user_followed_games TO authenticated;
GRANT SELECT ON user_followed_games TO anon;
