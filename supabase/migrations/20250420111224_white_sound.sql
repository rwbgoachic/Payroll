/*
  # Deductions Schema Update

  1. New Tables
    - deduction_types: Configurable deduction templates for companies
    - deductions: Individual employee deduction records

  2. Security
    - RLS enabled on both tables
    - Company admins can manage deduction types and deductions
    - Employees can view their own deductions
    - Company members can view available deduction types
*/

-- Create deduction_types table
CREATE TABLE IF NOT EXISTS deduction_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('pre_tax', 'post_tax')),
  calculation_method text NOT NULL CHECK (calculation_method IN ('fixed', 'percentage')),
  default_amount numeric,
  default_percentage numeric CHECK (default_percentage >= 0 AND default_percentage <= 100),
  max_annual_amount numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deductions table
CREATE TABLE IF NOT EXISTS deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id),
  deduction_type_id uuid REFERENCES deduction_types(id),
  amount numeric NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('per-paycheck', 'monthly', 'annual')),
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deduction_types_company_id ON deduction_types(company_id);
CREATE INDEX IF NOT EXISTS idx_deductions_employee_id ON deductions(employee_id);
CREATE INDEX IF NOT EXISTS idx_deductions_deduction_type_id ON deductions(deduction_type_id);

-- Enable RLS
ALTER TABLE deduction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE deductions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Company admins can manage deduction types" ON deduction_types;
  DROP POLICY IF EXISTS "Company members can view deduction types" ON deduction_types;
  DROP POLICY IF EXISTS "Company admins can manage deductions" ON deductions;
  DROP POLICY IF EXISTS "Employees can view their own deductions" ON deductions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add policies for deduction types
CREATE POLICY "Company admins can manage deduction types"
  ON deduction_types
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE company_id = deduction_types.company_id
      AND role = 'admin'
    )
  );

CREATE POLICY "Company members can view deduction types"
  ON deduction_types
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE company_id = deduction_types.company_id
    )
  );

-- Add policies for deductions
CREATE POLICY "Company admins can manage deductions"
  ON deductions
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT e1.user_id
      FROM employees e1
      JOIN employees e2 ON e1.company_id = e2.company_id
      WHERE e2.id = deductions.employee_id
      AND e1.role = 'admin'
    )
  );

CREATE POLICY "Employees can view their own deductions"
  ON deductions
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE id = deductions.employee_id
    )
  );

-- Drop existing triggers if they exist
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_deduction_types_updated_at ON deduction_types;
  DROP TRIGGER IF EXISTS update_deductions_updated_at ON deductions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add triggers for updating updated_at
CREATE TRIGGER update_deduction_types_updated_at
  BEFORE UPDATE ON deduction_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deductions_updated_at
  BEFORE UPDATE ON deductions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample deduction types
INSERT INTO deduction_types (
  company_id,
  name,
  description,
  type,
  calculation_method,
  default_amount,
  default_percentage,
  max_annual_amount
)
SELECT
  (SELECT id FROM companies LIMIT 1),
  '401(k) Contribution',
  'Employee contribution to 401(k) retirement plan',
  'pre_tax',
  'percentage',
  NULL,
  6.0,
  20500.00
WHERE NOT EXISTS (
  SELECT 1 FROM deduction_types WHERE name = '401(k) Contribution'
);

INSERT INTO deduction_types (
  company_id,
  name,
  description,
  type,
  calculation_method,
  default_amount,
  default_percentage,
  max_annual_amount
)
SELECT
  (SELECT id FROM companies LIMIT 1),
  'HSA Contribution',
  'Health Savings Account contribution',
  'pre_tax',
  'fixed',
  100.00,
  NULL,
  3650.00
WHERE NOT EXISTS (
  SELECT 1 FROM deduction_types WHERE name = 'HSA Contribution'
);

INSERT INTO deduction_types (
  company_id,
  name,
  description,
  type,
  calculation_method,
  default_amount,
  default_percentage,
  max_annual_amount
)
SELECT
  (SELECT id FROM companies LIMIT 1),
  'Parking',
  'Pre-tax parking benefit',
  'pre_tax',
  'fixed',
  150.00,
  NULL,
  3600.00
WHERE NOT EXISTS (
  SELECT 1 FROM deduction_types WHERE name = 'Parking'
);

INSERT INTO deduction_types (
  company_id,
  name,
  description,
  type,
  calculation_method,
  default_amount,
  default_percentage,
  max_annual_amount
)
SELECT
  (SELECT id FROM companies LIMIT 1),
  'Life Insurance',
  'Supplemental life insurance premium',
  'post_tax',
  'fixed',
  25.00,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM deduction_types WHERE name = 'Life Insurance'
);