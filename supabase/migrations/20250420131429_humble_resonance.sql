/*
  # Security Enhancements

  1. New Tables
    - `audit_logs`: Stores detailed audit trail of system activities
    - `user_mfa`: Stores MFA configuration for users
    - `user_security_profiles`: Stores security settings and status
    - `rate_limits`: Tracks rate-limited actions
    - `security_verifications`: Tracks identity verification attempts
    - `user_devices`: Tracks known user devices

  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control
*/

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  ip_address text,
  user_agent text,
  details jsonb,
  status text NOT NULL CHECK (status IN ('success', 'failure')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_mfa table
CREATE TABLE IF NOT EXISTS user_mfa (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  secret text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  backup_codes text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_security_profiles table
CREATE TABLE IF NOT EXISTS user_security_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  mfa_enabled boolean NOT NULL DEFAULT false,
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  identity_verified boolean NOT NULL DEFAULT false,
  security_questions boolean NOT NULL DEFAULT false,
  last_password_change timestamptz,
  login_attempts integer NOT NULL DEFAULT 0,
  account_locked boolean NOT NULL DEFAULT false,
  account_locked_until timestamptz,
  security_level text NOT NULL DEFAULT 'basic' CHECK (security_level IN ('basic', 'enhanced', 'maximum')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY,
  user_id text NOT NULL, -- Can be user ID or IP address
  action text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create security_verifications table
CREATE TABLE IF NOT EXISTS security_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('email', 'phone', 'document')),
  status text NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
  verification_data jsonb,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  device_id text NOT NULL,
  device_name text,
  device_type text,
  browser text,
  os text,
  ip_address text,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  is_trusted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id_action ON rate_limits(user_id, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp ON rate_limits(timestamp);

CREATE INDEX IF NOT EXISTS idx_security_verifications_user_id ON security_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_security_verifications_status ON security_verifications(status);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Add policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Add policies for user_mfa
CREATE POLICY "Users can manage their own MFA"
  ON user_mfa
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Add policies for user_security_profiles
CREATE POLICY "Users can view their own security profile"
  ON user_security_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can manage security profiles"
  ON user_security_profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Add policies for security_verifications
CREATE POLICY "Users can view their own verifications"
  ON security_verifications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Admins can manage verifications"
  ON security_verifications
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Add policies for user_devices
CREATE POLICY "Users can view their own devices"
  ON user_devices
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can manage their own devices"
  ON user_devices
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updating updated_at
CREATE TRIGGER update_user_mfa_updated_at
  BEFORE UPDATE ON user_mfa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_security_profiles_updated_at
  BEFORE UPDATE ON user_security_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_verifications_updated_at
  BEFORE UPDATE ON security_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_devices_updated_at
  BEFORE UPDATE ON user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();