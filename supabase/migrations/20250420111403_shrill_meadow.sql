/*
  # Tax Adjustments and Exemptions Schema

  1. New Tables
    - tax_adjustments: Stores tax credits and additional taxes
    - tax_exemptions: Stores tax exemptions
    - employee_adjustments: Links employees to tax adjustments
    - employee_exemptions: Links employees to tax exemptions

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing and managing adjustments/exemptions
*/

-- Create tax adjustments table
CREATE TABLE IF NOT EXISTS tax_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('credit', 'additional_tax')),
  jurisdiction text NOT NULL,
  description text NOT NULL,
  calculation_method text NOT NULL CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
  amount numeric,
  percentage numeric,
  formula text,
  phase_out_start numeric,
  phase_out_end numeric,
  tax_year integer NOT NULL,
  effective_date date NOT NULL,
  expiration_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tax exemptions table
CREATE TABLE IF NOT EXISTS tax_exemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  jurisdiction text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  tax_year integer NOT NULL,
  effective_date date NOT NULL,
  expiration_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employee adjustments table
CREATE TABLE IF NOT EXISTS employee_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id),
  adjustment_id uuid NOT NULL REFERENCES tax_adjustments(id),
  amount numeric NOT NULL,
  effective_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT employee_adjustments_date_check CHECK (end_date IS NULL OR end_date > effective_date)
);

-- Create employee exemptions table
CREATE TABLE IF NOT EXISTS employee_exemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id),
  exemption_id uuid NOT NULL REFERENCES tax_exemptions(id),
  effective_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT employee_exemptions_date_check CHECK (end_date IS NULL OR end_date > effective_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_adjustments_type ON tax_adjustments(type);
CREATE INDEX IF NOT EXISTS idx_tax_adjustments_jurisdiction ON tax_adjustments(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_type ON tax_exemptions(type);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_jurisdiction ON tax_exemptions(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_employee_adjustments_employee ON employee_adjustments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_exemptions_employee ON employee_exemptions(employee_id);

-- Enable RLS
ALTER TABLE tax_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_exemptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Tax adjustments are viewable by authenticated users" ON tax_adjustments;
  DROP POLICY IF EXISTS "Only admins can manage tax adjustments" ON tax_adjustments;
  DROP POLICY IF EXISTS "Tax exemptions are viewable by authenticated users" ON tax_exemptions;
  DROP POLICY IF EXISTS "Only admins can manage tax exemptions" ON tax_exemptions;
  DROP POLICY IF EXISTS "Employees can view their own adjustments" ON employee_adjustments;
  DROP POLICY IF EXISTS "Admins can manage employee adjustments" ON employee_adjustments;
  DROP POLICY IF EXISTS "Employees can view their own exemptions" ON employee_exemptions;
  DROP POLICY IF EXISTS "Admins can manage employee exemptions" ON employee_exemptions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add policies for tax adjustments
CREATE POLICY "Tax adjustments are viewable by authenticated users"
  ON tax_adjustments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage tax adjustments"
  ON tax_adjustments
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Add policies for tax exemptions
CREATE POLICY "Tax exemptions are viewable by authenticated users"
  ON tax_exemptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage tax exemptions"
  ON tax_exemptions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Add policies for employee adjustments
CREATE POLICY "Employees can view their own adjustments"
  ON employee_adjustments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE id = employee_id
    )
  );

CREATE POLICY "Admins can manage employee adjustments"
  ON employee_adjustments
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Add policies for employee exemptions
CREATE POLICY "Employees can view their own exemptions"
  ON employee_exemptions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE id = employee_id
    )
  );

CREATE POLICY "Admins can manage employee exemptions"
  ON employee_exemptions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Drop existing triggers if they exist
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_tax_adjustments_updated_at ON tax_adjustments;
  DROP TRIGGER IF EXISTS update_tax_exemptions_updated_at ON tax_exemptions;
  DROP TRIGGER IF EXISTS update_employee_adjustments_updated_at ON employee_adjustments;
  DROP TRIGGER IF EXISTS update_employee_exemptions_updated_at ON employee_exemptions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add triggers for updating updated_at
CREATE TRIGGER update_tax_adjustments_updated_at
  BEFORE UPDATE ON tax_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_exemptions_updated_at
  BEFORE UPDATE ON tax_exemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_adjustments_updated_at
  BEFORE UPDATE ON employee_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_exemptions_updated_at
  BEFORE UPDATE ON employee_exemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample tax exemptions for 2025
INSERT INTO tax_exemptions (
  type,
  jurisdiction,
  description,
  amount,
  tax_year,
  effective_date
)
VALUES
  ('personal_exemption', 'US', 'Federal Personal Exemption', 4150.00, 2025, DATE '2025-01-01'),
  ('standard_deduction_single', 'US', 'Federal Standard Deduction (Single)', 13850.00, 2025, DATE '2025-01-01'),
  ('standard_deduction_married', 'US', 'Federal Standard Deduction (Married)', 27700.00, 2025, DATE '2025-01-01'),
  ('standard_deduction_head', 'US', 'Federal Standard Deduction (Head of Household)', 20800.00, 2025, DATE '2025-01-01'),
  ('personal_exemption', 'CA', 'California Personal Exemption', 129.00, 2025, DATE '2025-01-01'),
  ('standard_deduction_single', 'CA', 'California Standard Deduction (Single)', 4803.00, 2025, DATE '2025-01-01'),
  ('standard_deduction_married', 'CA', 'California Standard Deduction (Married)', 9606.00, 2025, DATE '2025-01-01'),
  ('standard_deduction_head', 'CA', 'California Standard Deduction (Head of Household)', 9606.00, 2025, DATE '2025-01-01')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tax credits for 2025
INSERT INTO tax_adjustments (
  type,
  adjustment_type,
  jurisdiction,
  description,
  calculation_method,
  amount,
  tax_year,
  effective_date
)
VALUES
  ('child_tax_credit', 'credit', 'US', 'Child Tax Credit', 'fixed', 2000.00, 2025, DATE '2025-01-01'),
  ('earned_income_credit', 'credit', 'US', 'Earned Income Tax Credit', 'formula', NULL, 2025, DATE '2025-01-01'),
  ('education_credit', 'credit', 'US', 'American Opportunity Credit', 'fixed', 2500.00, 2025, DATE '2025-01-01'),
  ('ca_renter_credit', 'credit', 'CA', 'California Renter Credit', 'fixed', 60.00, 2025, DATE '2025-01-01')
ON CONFLICT (id) DO NOTHING;