-- Fix for: record "new" has no field "version"
-- The notification trigger references NEW.version which doesn't exist in patch_notes
-- This updates the trigger to remove the version reference

CREATE OR REPLACE FUNCTION notify_followers_of_patch()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, priority, game_id, patch_id, metadata)
  SELECT
    uf.user_id,
    'new_patch',
    g.name || ' - New Patch',
    COALESCE(NEW.summary_tldr, LEFT(NEW.title, 100)),
    CASE
      WHEN NEW.impact_score >= 8 THEN 5
      WHEN NEW.impact_score >= 6 THEN 4
      WHEN NEW.impact_score >= 4 THEN 3
      ELSE 2
    END,
    NEW.game_id,
    NEW.id,
    jsonb_build_object(
      'patch_title', NEW.title,
      'impact_score', NEW.impact_score
    )
  FROM user_followed_games uf
  JOIN games g ON g.id = NEW.game_id
  WHERE uf.game_id = NEW.game_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
