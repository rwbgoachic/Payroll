/*
  # Add benefits management tables

  1. New Tables
    - benefits: Stores employee benefit enrollments
    - benefit_plans: Stores available benefit plans and options
    - benefit_deductions: Tracks benefit-related payroll deductions

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing and managing benefits
*/

-- Create benefits table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS benefits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid REFERENCES employees(id),
    type text NOT NULL CHECK (type IN ('health', 'dental', 'vision', 'life', 'disability', 'retirement')),
    plan_name text NOT NULL,
    coverage_level text NOT NULL CHECK (coverage_level IN ('individual', 'individual-plus-spouse', 'family')),
    start_date date NOT NULL,
    end_date date,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'terminated')),
    annual_cost numeric DEFAULT 0,
    employee_contribution numeric DEFAULT 0,
    employer_contribution numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create benefit plans table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS benefit_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id),
    type text NOT NULL CHECK (type IN ('health', 'dental', 'vision', 'life', 'disability', 'retirement')),
    name text NOT NULL,
    description text,
    provider text NOT NULL,
    plan_year integer NOT NULL,
    enrollment_start date,
    enrollment_end date,
    effective_date date NOT NULL,
    termination_date date,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create benefit deductions table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS benefit_deductions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    benefit_id uuid REFERENCES benefits(id),
    payroll_period_id uuid REFERENCES payroll_periods(id),
    amount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('pre_tax', 'post_tax')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_benefits_employee_id ON benefits(employee_id);
  CREATE INDEX IF NOT EXISTS idx_benefit_plans_company_id ON benefit_plans(company_id);
  CREATE INDEX IF NOT EXISTS idx_benefit_deductions_benefit_id ON benefit_deductions(benefit_id);
  CREATE INDEX IF NOT EXISTS idx_benefit_deductions_period_id ON benefit_deductions(payroll_period_id);
END $$;

-- Enable RLS
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_deductions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Company admins can manage all benefits" ON benefits;
  DROP POLICY IF EXISTS "Employees can view their own benefits" ON benefits;
  DROP POLICY IF EXISTS "Company members can view benefit plans" ON benefit_plans;
  DROP POLICY IF EXISTS "Company admins can manage benefit plans" ON benefit_plans;
  DROP POLICY IF EXISTS "Company admins can manage benefit deductions" ON benefit_deductions;
  DROP POLICY IF EXISTS "Employees can view their own deductions" ON benefit_deductions;
END $$;

-- Add policies for benefits
CREATE POLICY "Company admins can manage all benefits"
  ON benefits
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT e1.user_id
      FROM employees e1
      JOIN employees e2 ON e1.company_id = e2.company_id
      WHERE e2.id = benefits.employee_id
      AND e1.role = 'admin'
    )
  );

CREATE POLICY "Employees can view their own benefits"
  ON benefits
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE id = benefits.employee_id
    )
  );

-- Add policies for benefit plans
CREATE POLICY "Company members can view benefit plans"
  ON benefit_plans
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE company_id = benefit_plans.company_id
    )
  );

CREATE POLICY "Company admins can manage benefit plans"
  ON benefit_plans
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE company_id = benefit_plans.company_id
      AND role = 'admin'
    )
  );

-- Add policies for benefit deductions
CREATE POLICY "Company admins can manage benefit deductions"
  ON benefit_deductions
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT e1.user_id
      FROM employees e1
      JOIN employees e2 ON e1.company_id = e2.company_id
      JOIN benefits b ON b.id = benefit_deductions.benefit_id
      WHERE e2.id = b.employee_id
      AND e1.role = 'admin'
    )
  );

CREATE POLICY "Employees can view their own deductions"
  ON benefit_deductions
  FOR SELECT
  TO public
  USING (
    auth.uid() IN (
      SELECT e.user_id
      FROM employees e
      JOIN benefits b ON b.employee_id = e.id
      WHERE b.id = benefit_deductions.benefit_id
    )
  );

-- Add triggers for updating updated_at
DO $$ BEGIN
  CREATE TRIGGER update_benefits_updated_at
    BEFORE UPDATE ON benefits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_benefit_plans_updated_at
    BEFORE UPDATE ON benefit_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_benefit_deductions_updated_at
    BEFORE UPDATE ON benefit_deductions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Insert sample benefit plans
INSERT INTO benefit_plans (
  company_id,
  type,
  name,
  description,
  provider,
  plan_year,
  effective_date,
  status
)
SELECT
  (SELECT id FROM companies LIMIT 1),
  'health',
  'Premium Health Plan',
  'Comprehensive health coverage with low deductibles',
  'Blue Cross Blue Shield',
  2025,
  '2025-01-01',
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM benefit_plans WHERE name = 'Premium Health Plan'
);

INSERT INTO benefit_plans (
  company_id,
  type,
  name,
  description,
  provider,
  plan_year,
  effective_date,
  status
)
SELECT
  (SELECT id FROM companies LIMIT 1),
  'dental',
  'Complete Dental Care',
  'Full coverage dental plan including orthodontics',
  'Delta Dental',
  2025,
  '2025-01-01',
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM benefit_plans WHERE name = 'Complete Dental Care'
);

INSERT INTO benefit_plans (
  company_id,
  type,
  name,
  description,
  provider,
  plan_year,
  effective_date,
  status
)
SELECT
  (SELECT id FROM companies LIMIT 1),
  'vision',
  'Vision Plus',
  'Comprehensive vision coverage with low copays',
  'VSP',
  2025,
  '2025-01-01',
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM benefit_plans WHERE name = 'Vision Plus'
);