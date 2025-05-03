/*
  # Add insert policy for audit logs

  1. Changes
     - Add a policy to allow inserting records into the audit_logs table
     - This fixes the "new row violates row-level security policy for table audit_logs" error

  2. Security
     - Allows authenticated users to insert audit logs
     - Maintains existing policies for viewing audit logs
*/

-- Add policy to allow inserting audit logs
CREATE POLICY "Allow inserting audit logs" 
ON public.audit_logs
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Also add policy for anon users (for unauthenticated audit logging)
CREATE POLICY "Allow anon inserting audit logs" 
ON public.audit_logs
FOR INSERT 
TO anon
WITH CHECK (true);