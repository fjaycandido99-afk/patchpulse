-- Add missing UPDATE policy for device_tokens table
-- The upsert operation requires UPDATE permission

CREATE POLICY "Users can update own device tokens"
  ON device_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
