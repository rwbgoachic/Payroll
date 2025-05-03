/*
  # Tax System Schema Update

  1. Changes
    - Add tax brackets table for progressive tax calculations
    - Add new columns to tax_rates for flexible tax calculation methods
    - Add indexes for performance optimization
    - Add RLS policies for security

  2. New Features
    - Support for flat rate, percentage, and bracket-based tax calculations
    - Improved tax rate metadata (description, jurisdiction, authority)
    - Sample federal tax brackets for 2025
*/

-- Create tax brackets table
CREATE TABLE IF NOT EXISTS tax_brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_rate_id uuid NOT NULL REFERENCES tax_rates(id) ON DELETE CASCADE,
  threshold_low numeric NOT NULL,
  threshold_high numeric,
  rate numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tax_brackets_rate_check CHECK (rate >= 0 AND rate <= 1),
  CONSTRAINT tax_brackets_threshold_check CHECK (threshold_high > threshold_low OR threshold_high IS NULL)
);

-- Add new columns to tax_rates
ALTER TABLE tax_rates
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS calculation_method text NOT NULL DEFAULT 'bracket'
  CHECK (calculation_method IN ('bracket', 'flat', 'percentage')),
ADD COLUMN IF NOT EXISTS flat_amount numeric,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS jurisdiction text,
ADD COLUMN IF NOT EXISTS authority text;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_brackets_tax_rate_id ON tax_brackets(tax_rate_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_type_state ON tax_rates(type, state);
CREATE INDEX IF NOT EXISTS idx_tax_rates_effective_date ON tax_rates(effective_date);
CREATE INDEX IF NOT EXISTS idx_tax_rates_jurisdiction ON tax_rates(jurisdiction);

-- Enable RLS
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tax brackets are viewable by authenticated users" ON tax_brackets;
DROP POLICY IF EXISTS "Only admins can manage tax brackets" ON tax_brackets;

-- Add policies
CREATE POLICY "Tax brackets are viewable by authenticated users"
  ON tax_brackets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage tax brackets"
  ON tax_brackets
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE role = 'admin'
    )
  );

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_tax_brackets_updated_at ON tax_brackets;

-- Add trigger for updating updated_at
CREATE TRIGGER update_tax_brackets_updated_at
  BEFORE UPDATE ON tax_brackets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample federal tax brackets for 2025
WITH new_rate AS (
  INSERT INTO tax_rates (
    type,
    description,
    calculation_method,
    jurisdiction,
    authority,
    effective_date,
    rate,
    threshold_low,
    threshold_high
  )
  VALUES (
    'federal',
    'Federal Income Tax 2025',
    'bracket',
    'US',
    'IRS',
    '2025-01-01',
    0.10, -- Default rate for the first bracket
    0,    -- Default threshold low
    NULL  -- Default threshold high
  )
  RETURNING id
)
INSERT INTO tax_brackets (tax_rate_id, threshold_low, threshold_high, rate)
SELECT 
  new_rate.id,
  threshold_low,
  threshold_high,
  rate
FROM new_rate, (VALUES
  (0, 11600, 0.10),
  (11600, 47150, 0.12),
  (47150, 100525, 0.22),
  (100525, 191950, 0.24),
  (191950, 243725, 0.32),
  (243725, 609350, 0.35),
  (609350, NULL, 0.37)
) AS brackets(threshold_low, threshold_high, rate);