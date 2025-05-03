/*
  # Automated Tests Schema

  1. New Tables
    - `test_suites` - Stores test suite information
    - `test_results` - Stores individual test results
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create test_suites table if it doesn't exist
CREATE TABLE IF NOT EXISTS test_suites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  system text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed', 'failed', 'running', 'pending')),
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create test_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_suite_id uuid NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
  name text NOT NULL,
  system text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed', 'failed', 'running', 'pending')),
  duration numeric,
  error text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_suites_system ON test_suites(system);
CREATE INDEX IF NOT EXISTS idx_test_suites_status ON test_suites(status);
CREATE INDEX IF NOT EXISTS idx_test_suites_timestamp ON test_suites(timestamp);

CREATE INDEX IF NOT EXISTS idx_test_results_suite_id ON test_results(test_suite_id);
CREATE INDEX IF NOT EXISTS idx_test_results_system ON test_results(system);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);

-- Enable RLS
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Add policies for test_suites
CREATE POLICY "Super admins can manage test suites"
ON test_suites
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

CREATE POLICY "System admins can view test suites"
ON test_suites
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM system_users su
    WHERE su.user_id = auth.uid() AND su.role = 'admin'
  )
);

-- Add policies for test_results
CREATE POLICY "Super admins can manage test results"
ON test_results
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

CREATE POLICY "System admins can view test results"
ON test_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM system_users su
    WHERE su.user_id = auth.uid() AND su.role = 'admin'
  )
);