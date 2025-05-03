/*
  # Add Benefits Management

  1. New Tables
    - `benefits`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `type` (text)
      - `plan_name` (text)
      - `coverage_level` (text)
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `status` (text)
      - `annual_cost` (numeric)
      - `employee_contribution` (numeric)
      - `employer_contribution` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `benefits` table
    - Add policy for employees to view their own benefits
    - Add policy for admins to manage all benefits

  3. Changes
    - Add constraints for benefit types and coverage levels
    - Add constraints for status values
*/

-- Create benefits table
CREATE TABLE IF NOT EXISTS benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id),
  type text NOT NULL,
  plan_name text NOT NULL,
  coverage_level text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'pending',
  annual_cost numeric NOT NULL DEFAULT 0,
  employee_contribution numeric NOT NULL DEFAULT 0,
  employer_contribution numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT benefits_type_check CHECK (
    type IN ('health', 'dental', 'vision', 'life', 'disability', 'retirement')
  ),
  CONSTRAINT benefits_coverage_level_check CHECK (
    coverage_level IN ('individual', 'individual-plus-spouse', 'family')
  ),
  CONSTRAINT benefits_status_check CHECK (
    status IN ('pending', 'active', 'terminated')
  )
);

-- Enable RLS
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'benefits' AND policyname = 'Employees can view their own benefits'
  ) THEN
    CREATE POLICY "Employees can view their own benefits" ON benefits
      FOR SELECT USING (
        auth.uid() IN (
          SELECT user_id FROM employees WHERE id = benefits.employee_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'benefits' AND policyname = 'Company admins can manage all benefits'
  ) THEN
    CREATE POLICY "Company admins can manage all benefits" ON benefits
      FOR ALL USING (
        auth.uid() IN (
          SELECT e1.user_id 
          FROM employees e1 
          JOIN employees e2 ON e1.company_id = e2.company_id 
          WHERE e2.id = benefits.employee_id 
          AND e1.role = 'admin'
        )
      );
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_benefits_employee_id ON benefits(employee_id);