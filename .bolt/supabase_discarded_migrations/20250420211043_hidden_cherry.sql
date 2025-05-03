/*
  # Add user roles and permissions system

  1. New Tables
    - `user_roles` - Defines role types (super-admin, sub-admin, employer-admin)
    - `user_permissions` - Defines permissions for each role
    - `user_role_assignments` - Maps users to roles
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create user roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role_id, resource, action)
);

-- Create role assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'Super admins can manage roles'
  ) THEN
    DROP POLICY "Super admins can manage roles" ON user_roles;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_permissions' AND policyname = 'Super admins can manage permissions'
  ) THEN
    DROP POLICY "Super admins can manage permissions" ON user_permissions;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_role_assignments' AND policyname = 'Super admins can manage role assignments'
  ) THEN
    DROP POLICY "Super admins can manage role assignments" ON user_role_assignments;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_role_assignments' AND policyname = 'Users can view their own role assignments'
  ) THEN
    DROP POLICY "Users can view their own role assignments" ON user_role_assignments;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Super admins can manage roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

CREATE POLICY "Super admins can manage permissions"
ON user_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

CREATE POLICY "Super admins can manage role assignments"
ON user_role_assignments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

CREATE POLICY "Users can view their own role assignments"
ON user_role_assignments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert default roles if they don't exist
INSERT INTO user_roles (name, description)
SELECT 'super-admin', 'System-wide administrator with full access to all features'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'super-admin');

INSERT INTO user_roles (name, description)
SELECT 'sub-admin', 'System sub-administrator with limited system-wide access'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'sub-admin');

INSERT INTO user_roles (name, description)
SELECT 'employer-admin', 'Company administrator with access to company-specific features'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'employer-admin');

-- Create update triggers if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_roles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_permissions_updated_at'
  ) THEN
    CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_role_assignments_updated_at'
  ) THEN
    CREATE TRIGGER update_user_role_assignments_updated_at
    BEFORE UPDATE ON user_role_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add indexes for performance if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_user_role_assignments_user_id'
  ) THEN
    CREATE INDEX idx_user_role_assignments_user_id ON user_role_assignments(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_user_role_assignments_role_id'
  ) THEN
    CREATE INDEX idx_user_role_assignments_role_id ON user_role_assignments(role_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_user_permissions_role_id'
  ) THEN
    CREATE INDEX idx_user_permissions_role_id ON user_permissions(role_id);
  END IF;
END $$;