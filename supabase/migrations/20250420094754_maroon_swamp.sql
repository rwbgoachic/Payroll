/*
  # Add payroll processing tables

  1. New Tables
    - payroll_periods: Tracks pay periods and their status
    - payroll_runs: Records each payroll processing run
    - payroll_items: Stores individual employee payroll calculations
    - time_entries: Tracks employee time and attendance

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing and managing payroll data
*/

-- Create payroll periods table if it doesn't exist
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create payroll runs table if it doesn't exist
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create payroll items table if it doesn't exist
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create time entries table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS time_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid REFERENCES employees(id),
    date date NOT NULL,
    start_time time NOT NULL,
    end_time time,
    break_duration interval DEFAULT '00:00:00',
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes text,
    approved_by uuid REFERENCES employees(id),
    approved_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT time_entries_time_range_check CHECK (end_time IS NULL OR end_time > start_time)
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_payroll_periods_company_id ON payroll_periods(company_id);
  CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_id ON payroll_runs(company_id);
  CREATE INDEX IF NOT EXISTS idx_payroll_runs_period_id ON payroll_runs(payroll_period_id);
  CREATE INDEX IF NOT EXISTS idx_payroll_items_period_id ON payroll_items(payroll_period_id);
  CREATE INDEX IF NOT EXISTS idx_payroll_items_employee_id ON payroll_items(employee_id);
  CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
  CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
  CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
END $$;

-- Enable RLS
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Company members can view payroll periods" ON payroll_periods;
  DROP POLICY IF EXISTS "Company admins can view payroll runs" ON payroll_runs;
  DROP POLICY IF EXISTS "Employees can view their own payroll items" ON payroll_items;
  DROP POLICY IF EXISTS "Employees can manage their own time entries" ON time_entries;
  DROP POLICY IF EXISTS "Managers can view and approve time entries" ON time_entries;
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

CREATE POLICY "Employees can manage their own time entries"
  ON time_entries
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE id = time_entries.employee_id
    )
  );

CREATE POLICY "Managers can view and approve time entries"
  ON time_entries
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT e1.user_id
      FROM employees e1
      JOIN employees e2 ON e1.company_id = e2.company_id
      WHERE e2.id = time_entries.employee_id
      AND e1.role IN ('admin', 'manager')
    )
  );

-- Add triggers for updating updated_at
DO $$ BEGIN
  CREATE TRIGGER update_payroll_periods_updated_at
    BEFORE UPDATE ON payroll_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_payroll_runs_updated_at
    BEFORE UPDATE ON payroll_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_payroll_items_updated_at
    BEFORE UPDATE ON payroll_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;