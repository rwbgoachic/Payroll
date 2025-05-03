/*
  # Add systems table and cross-system user management

  1. New Tables
    - `systems` - Stores information about different systems
    - `system_users` - Maps users to systems they have access to
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create systems table
CREATE TABLE IF NOT EXISTS systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  status text NOT NULL DEFAULT 'operational',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create system users table
CREATE TABLE IF NOT EXISTS system_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_id uuid NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, system_id)
);

-- Enable RLS
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can manage systems"
ON systems
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

CREATE POLICY "Everyone can view systems"
ON systems
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage system users"
ON system_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

CREATE POLICY "Users can view their own system access"
ON system_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert default systems
INSERT INTO systems (name, domain, description, icon, color, status)
VALUES 
  ('Payroll', 'payroll.paysurity.com', 'Payroll management system for businesses', 'Briefcase', 'bg-primary/10 text-primary', 'operational'),
  ('BistroBeast', 'bistrobeast.paysurity.com', 'Restaurant management POS system', 'Coffee', 'bg-secondary/10 text-secondary', 'operational'),
  ('GrocerEase', 'grocerease.paysurity.com', 'Grocery store management system', 'ShoppingCart', 'bg-accent/10 text-accent', 'operational'),
  ('LegalEdge', 'legaledge.paysurity.com', 'Legal practice management system', 'Gavel', 'bg-success/10 text-success', 'operational'),
  ('DentistPro', 'dentists.paysurity.com', 'Dental practice management system', 'Stethoscope', 'bg-warning/10 text-warning', 'operational'),
  ('MerchantHub', 'merchants.paysurity.com', 'Merchant services and payment processing', 'CreditCard', 'bg-error/10 text-error', 'operational');

-- Create update triggers
CREATE TRIGGER update_systems_updated_at
BEFORE UPDATE ON systems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_users_updated_at
BEFORE UPDATE ON system_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_system_users_user_id ON system_users(user_id);
CREATE INDEX idx_system_users_system_id ON system_users(system_id);