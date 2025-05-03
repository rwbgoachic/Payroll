/*
  # System Architecture Update

  1. Changes
    - Update systems table to reflect PaySurity.com as parent domain
    - Add parent_system_id to track system hierarchy
    - Add system_type to distinguish between parent and child systems
    - Update existing systems to reflect new architecture

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to systems table
ALTER TABLE systems
ADD COLUMN IF NOT EXISTS parent_system_id uuid REFERENCES systems(id),
ADD COLUMN IF NOT EXISTS system_type text NOT NULL DEFAULT 'application' 
  CHECK (system_type IN ('parent', 'application', 'service'));

-- Create parent system for paysurity.com if it doesn't exist
INSERT INTO systems (
  id,
  name,
  domain,
  description,
  icon,
  color,
  status,
  system_type
)
SELECT 
  gen_random_uuid(),
  'PaySurity',
  'paysurity.com',
  'PaySurity parent system',
  'Building',
  'bg-primary/10 text-primary',
  'operational',
  'parent'
WHERE NOT EXISTS (
  SELECT 1 FROM systems WHERE domain = 'paysurity.com'
);

-- Update existing systems to be children of the parent system
UPDATE systems
SET 
  parent_system_id = (SELECT id FROM systems WHERE domain = 'paysurity.com'),
  system_type = 'application'
WHERE 
  domain != 'paysurity.com' AND
  domain LIKE '%.paysurity.com';

-- Create index for parent_system_id
CREATE INDEX IF NOT EXISTS idx_systems_parent_id ON systems(parent_system_id);

-- Add function to get all systems a user has access to
CREATE OR REPLACE FUNCTION get_user_systems(user_uuid uuid)
RETURNS TABLE (
  system_id uuid,
  system_name text,
  system_domain text,
  system_type text,
  user_role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as system_id,
    s.name as system_name,
    s.domain as system_domain,
    s.system_type,
    su.role as user_role
  FROM 
    systems s
  JOIN 
    system_users su ON s.id = su.system_id
  WHERE 
    su.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add function to check if a user has access to a specific system
CREATE OR REPLACE FUNCTION has_system_access(user_uuid uuid, system_domain text)
RETURNS boolean AS $$
DECLARE
  has_access boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM system_users su
    JOIN systems s ON su.system_id = s.id
    WHERE su.user_id = user_uuid AND s.domain = system_domain
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql;