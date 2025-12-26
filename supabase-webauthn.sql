-- WebAuthn Credentials Table for Face ID / Biometric Login
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_name TEXT,
  transports TEXT[], -- e.g., ['internal', 'hybrid']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON public.webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON public.webauthn_credentials(credential_id);

-- Enable RLS
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only see their own credentials
CREATE POLICY "Users can view own credentials"
  ON public.webauthn_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credentials
CREATE POLICY "Users can insert own credentials"
  ON public.webauthn_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials (for counter updates)
CREATE POLICY "Users can update own credentials"
  ON public.webauthn_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users can delete own credentials"
  ON public.webauthn_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Challenge storage table (temporary, for WebAuthn ceremonies)
CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, -- For login challenges (user not yet authenticated)
  challenge TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes')
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user ON public.webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_email ON public.webauthn_challenges(email);

-- Auto-cleanup expired challenges
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.webauthn_challenges WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_cleanup_challenges
  AFTER INSERT ON public.webauthn_challenges
  EXECUTE FUNCTION cleanup_expired_challenges();

-- Enable RLS for challenges
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Note: API routes use admin client which bypasses RLS.
-- These policies are restrictive fallbacks in case regular client is used.

-- Authenticated users can only see their own registration challenges
CREATE POLICY "Users can view own registration challenges"
  ON public.webauthn_challenges
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND type = 'registration'
  );

-- Users can insert their own registration challenges
CREATE POLICY "Users can insert own registration challenges"
  ON public.webauthn_challenges
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND type = 'registration'
  );

-- Users can delete their own challenges
CREATE POLICY "Users can delete own challenges"
  ON public.webauthn_challenges
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Authentication challenges (login) are managed by admin client only
-- No RLS policy needed as they use email lookup before user is authenticated
