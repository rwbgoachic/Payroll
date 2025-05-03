/*
  # Fix Audit Logs Policies

  1. Changes
    - Add policies to allow inserting audit logs for both authenticated and anonymous users
    - This fixes the "new row violates row-level security policy for table audit_logs" error

  2. Security
    - Maintains existing policies for viewing audit logs
    - Allows necessary audit logging operations
*/

-- Drop existing insert policies if they exist
DROP POLICY IF EXISTS "Allow inserting audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow anon inserting audit logs" ON audit_logs;

-- Add policy to allow inserting audit logs for authenticated users
CREATE POLICY "Allow inserting audit logs" 
ON audit_logs
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Add policy for anonymous users (for unauthenticated audit logging)
CREATE POLICY "Allow anon inserting audit logs" 
ON audit_logs
FOR INSERT 
TO anon
WITH CHECK (true);