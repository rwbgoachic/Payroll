/*
  # Add tax exemptions

  1. New Tables
    - tax_exemptions: Stores different types of tax exemptions and their values
    - employee_exemptions: Links employees to their claimed exemptions

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing exemptions
*/

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
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_type ON tax_exemptions(type);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_jurisdiction ON tax_exemptions(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_employee_exemptions_employee ON employee_exemptions(employee_id);

-- Enable RLS
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_exemptions ENABLE ROW LEVEL SECURITY;

-- Add policies for tax_exemptions
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

-- Add policies for employee_exemptions
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

-- Add triggers for updating updated_at
CREATE TRIGGER update_tax_exemptions_updated_at
  BEFORE UPDATE ON tax_exemptions
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
) VALUES
  ('personal_exemption', 'US', 'Federal Personal Exemption', 4150.00, 2025, '2025-01-01'),
  ('standard_deduction_single', 'US', 'Federal Standard Deduction (Single)', 13850.00, 2025, '2025-01-01'),
  ('standard_deduction_married', 'US', 'Federal Standard Deduction (Married)', 27700.00, 2025, '2025-01-01'),
  ('standard_deduction_head', 'US', 'Federal Standard Deduction (Head of Household)', 20800.00, 2025, '2025-01-01'),
  ('personal_exemption', 'CA', 'California Personal Exemption', 129.00, 2025, '2025-01-01'),
  ('standard_deduction_single', 'CA', 'California Standard Deduction (Single)', 4803.00, 2025, '2025-01-01'),
  ('standard_deduction_married', 'CA', 'California Standard Deduction (Married)', 9606.00, 2025, '2025-01-01'),
  ('standard_deduction_head', 'CA', 'California Standard Deduction (Head of Household)', 9606.00, 2025, '2025-01-01');