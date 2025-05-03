/*
  # Add company payroll settings
  
  1. Changes
    - Add pay frequency and schedule settings to companies table
    - Add constraints to validate pay frequency values
*/

-- Add pay frequency and schedule columns to companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS pay_frequency text DEFAULT 'bi-weekly'
  CHECK (pay_frequency IN ('weekly', 'bi-weekly', 'semi-monthly', 'monthly')),
ADD COLUMN IF NOT EXISTS pay_period_start date,
ADD COLUMN IF NOT EXISTS default_pay_day integer DEFAULT 15
  CHECK (default_pay_day >= 1 AND default_pay_day <= 31);