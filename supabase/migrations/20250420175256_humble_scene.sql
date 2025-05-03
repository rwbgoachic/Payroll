/*
  # Add user roles and permissions

  1. New Tables
    - `user_roles` - Stores user role definitions
    - `user_permissions` - Stores permissions for each role
    - `user_role_assignments` - Maps users to roles
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role_id, resource, action)
);

-- Create role assignments table
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

-- Insert default roles
INSERT INTO user_roles (name, description)
VALUES 
  ('super-admin', 'System-wide administrator with full access to all features'),
  ('sub-admin', 'System sub-administrator with limited system-wide access'),
  ('employer-admin', 'Company administrator with access to company-specific features');

-- Create update triggers
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON user_permissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_role_assignments_updated_at
BEFORE UPDATE ON user_role_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX idx_user_role_assignments_role_id ON user_role_assignments(role_id);
CREATE INDEX idx_user_permissions_role_id ON user_permissions(role_id);