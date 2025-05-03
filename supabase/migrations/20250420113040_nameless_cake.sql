/*
  # Payroll System Tables

  1. Tables
    - payroll_periods: Tracks pay periods and their status
    - payroll_runs: Records each payroll processing run
    - payroll_items: Stores individual employee payroll calculations

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing and managing payroll data

  3. Changes
    - Add proper trigger handling with existence checks
    - Add indexes for performance optimization
*/

-- Create payroll periods table
CREATE TABLE IF NOT EXISTS payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  pay_date date NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payroll runs table
CREATE TABLE IF NOT EXISTS payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  payroll_period_id uuid REFERENCES payroll_periods(id),
  status text DEFAULT 'pending',
  processed_at timestamptz,
  total_gross_pay numeric DEFAULT 0,
  total_taxes numeric DEFAULT 0,
  total_deductions numeric DEFAULT 0,
  total_net_pay numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payroll items table
CREATE TABLE IF NOT EXISTS payroll_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id uuid REFERENCES payroll_periods(id),
  employee_id uuid REFERENCES employees(id),
  hours numeric DEFAULT 0,
  regular_pay numeric DEFAULT 0,
  overtime_pay numeric DEFAULT 0,
  federal_tax numeric DEFAULT 0,
  state_tax numeric DEFAULT 0,
  social_security numeric DEFAULT 0,
  medicare numeric DEFAULT 0,
  deductions numeric DEFAULT 0,
  net_pay numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payroll_periods_company_id ON payroll_periods(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_id ON payroll_runs(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period_id ON payroll_runs(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_period_id ON payroll_items(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee_id ON payroll_items(employee_id);

-- Enable RLS
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Company members can view payroll periods" ON payroll_periods;
  DROP POLICY IF EXISTS "Company admins can view payroll runs" ON payroll_runs;
  DROP POLICY IF EXISTS "Employees can view their own payroll items" ON payroll_items;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add policies
CREATE POLICY "Company members can view payroll periods"
  ON payroll_periods
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE company_id = payroll_periods.company_id
    )
  );

CREATE POLICY "Company admins can view payroll runs"
  ON payroll_runs
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE company_id = payroll_runs.company_id
      AND role = 'admin'
    )
  );

CREATE POLICY "Employees can view their own payroll items"
  ON payroll_items
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE id = payroll_items.employee_id
    )
  );

-- Add triggers for updating updated_at with existence checks
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payroll_periods_updated_at'
  ) THEN
    CREATE TRIGGER update_payroll_periods_updated_at
      BEFORE UPDATE ON payroll_periods
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payroll_runs_updated_at'
  ) THEN
    CREATE TRIGGER update_payroll_runs_updated_at
      BEFORE UPDATE ON payroll_runs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_payroll_items_updated_at'
  ) THEN
    CREATE TRIGGER update_payroll_items_updated_at
      BEFORE UPDATE ON payroll_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample payroll period
INSERT INTO payroll_periods (
  company_id,
  start_date,
  end_date,
  pay_date,
  status
)
SELECT
  id AS company_id,
  DATE_TRUNC('month', CURRENT_DATE)::date AS start_date,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '14 days')::date AS end_date,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '20 days')::date AS pay_date,
  'pending' AS status
FROM companies
WHERE NOT EXISTS (
  SELECT 1 
  FROM payroll_periods 
  WHERE start_date = DATE_TRUNC('month', CURRENT_DATE)::date
);