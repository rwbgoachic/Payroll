/*
  # Cross-System Authentication Schema

  1. New Tables
    - `cross_system_tokens` - Stores SSO tokens for cross-system authentication
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create cross_system_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS cross_system_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_system_id uuid NOT NULL REFERENCES systems(id),
  target_system_id uuid NOT NULL REFERENCES systems(id),
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cross_system_tokens_user_id ON cross_system_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_system_tokens_token ON cross_system_tokens(token);
CREATE INDEX IF NOT EXISTS idx_cross_system_tokens_expires_at ON cross_system_tokens(expires_at);

-- Enable RLS
ALTER TABLE cross_system_tokens ENABLE ROW LEVEL SECURITY;

-- Add policies for cross_system_tokens
CREATE POLICY "Users can manage their own tokens"
ON cross_system_tokens
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM cross_system_tokens
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;