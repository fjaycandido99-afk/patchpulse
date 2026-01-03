-- Add new notification types: game_release and saved_reminder

-- Update the notifications type check constraint
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'new_patch',
  'new_news',
  'game_release',
  'ai_digest',
  'price_drop',
  'saved_reminder',
  'system'
));
