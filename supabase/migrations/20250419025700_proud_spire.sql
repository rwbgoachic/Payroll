/*
  # Add company settings columns

  1. Changes
    - Add pay_frequency, pay_period_start, and default_pay_day columns to companies table
    - Add default values and constraints

  2. Security
    - No changes to existing RLS policies needed
*/

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS pay_frequency text DEFAULT 'bi-weekly',
ADD COLUMN IF NOT EXISTS pay_period_start date,
ADD COLUMN IF NOT EXISTS default_pay_day integer DEFAULT 15;

-- Add check constraint for pay_frequency
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_pay_frequency_check'
  ) THEN
    ALTER TABLE companies
    ADD CONSTRAINT companies_pay_frequency_check
    CHECK (pay_frequency IN ('weekly', 'bi-weekly', 'semi-monthly', 'monthly'));
  END IF;
END $$;

-- Add check constraint for default_pay_day
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_default_pay_day_check'
  ) THEN
    ALTER TABLE companies
    ADD CONSTRAINT companies_default_pay_day_check
    CHECK (default_pay_day BETWEEN 1 AND 31);
  END IF;
END $$;