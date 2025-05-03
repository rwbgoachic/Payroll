/*
  # Add tax adjustments

  1. New Tables
    - tax_adjustments: Stores different types of tax credits and additional taxes
    - employee_adjustments: Links employees to their tax adjustments

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing adjustments
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_adjustments_type ON tax_adjustments(type);
CREATE INDEX IF NOT EXISTS idx_tax_adjustments_jurisdiction ON tax_adjustments(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_employee_adjustments_employee ON employee_adjustments(employee_id);

-- Enable RLS
ALTER TABLE tax_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_adjustments ENABLE ROW LEVEL SECURITY;

-- Add policies for tax_adjustments
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

-- Add policies for employee_adjustments
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

-- Add triggers for updating updated_at
CREATE TRIGGER update_tax_adjustments_updated_at
  BEFORE UPDATE ON tax_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_adjustments_updated_at
  BEFORE UPDATE ON employee_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
) VALUES
  ('child_tax_credit', 'credit', 'US', 'Child Tax Credit', 'fixed', 2000.00, 2025, '2025-01-01'),
  ('earned_income_credit', 'credit', 'US', 'Earned Income Tax Credit', 'formula', NULL, 2025, '2025-01-01'),
  ('education_credit', 'credit', 'US', 'American Opportunity Credit', 'fixed', 2500.00, 2025, '2025-01-01'),
  ('ca_renter_credit', 'credit', 'CA', 'California Renter Credit', 'fixed', 60.00, 2025, '2025-01-01');