/*
  # Initial Schema Setup

  1. Tables Created
    - companies
    - employees
    - payroll_periods
    - payroll_items
    - tax_rates
    - deductions
    - payroll_runs

  2. Security
    - RLS enabled on all tables
    - Policies for data access control

  3. Performance
    - Indexes on foreign keys and frequently queried columns
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ein text UNIQUE NOT NULL,
  address text,
  city text,
  state text,
  zip_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employees table (created before its policies)
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  company_id uuid REFERENCES companies(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text,
  position text,
  hire_date date NOT NULL,
  termination_date date,
  status text DEFAULT 'active',
  salary_type text NOT NULL,
  salary_amount numeric NOT NULL,
  role text DEFAULT 'employee',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payroll periods table
CREATE TABLE IF NOT EXISTS payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  pay_date date NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payroll items table
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

-- Tax rates table
CREATE TABLE IF NOT EXISTS tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  state text,
  rate numeric NOT NULL,
  threshold_low numeric,
  threshold_high numeric,
  effective_date date NOT NULL,
  expiration_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deductions table
CREATE TABLE IF NOT EXISTS deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id),
  type text NOT NULL,
  amount numeric NOT NULL,
  frequency text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payroll runs table
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

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are viewable by company members" ON companies
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM employees WHERE company_id = companies.id
    )
  );

-- Employees policies
CREATE POLICY "Employees can view their own data" ON employees
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Company admins can view all employees" ON employees
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM employees 
      WHERE company_id = employees.company_id 
      AND role = 'admin'
    )
  );

-- Payroll periods policies
CREATE POLICY "Company members can view payroll periods" ON payroll_periods
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM employees WHERE company_id = payroll_periods.company_id
    )
  );

-- Payroll items policies
CREATE POLICY "Employees can view their own payroll items" ON payroll_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM employees WHERE id = payroll_items.employee_id
    )
  );

-- Tax rates policies
CREATE POLICY "Tax rates are viewable by all authenticated users" ON tax_rates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Deductions policies
CREATE POLICY "Employees can view their own deductions" ON deductions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM employees WHERE id = deductions.employee_id
    )
  );

-- Payroll runs policies
CREATE POLICY "Company admins can view payroll runs" ON payroll_runs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM employees 
      WHERE company_id = payroll_runs.company_id 
      AND role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_company_id ON payroll_periods(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_period_id ON payroll_items(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee_id ON payroll_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_deductions_employee_id ON deductions(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_id ON payroll_runs(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period_id ON payroll_runs(payroll_period_id);