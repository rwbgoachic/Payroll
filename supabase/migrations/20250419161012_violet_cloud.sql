/*
  # Enhanced Tax Rate Management

  1. New Tables
    - `tax_brackets`: Stores tax bracket information
      - `id` (uuid, primary key)
      - `tax_rate_id` (uuid, references tax_rates)
      - `threshold_low` (numeric)
      - `threshold_high` (numeric)
      - `rate` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add new columns to `tax_rates` table
    - Add indexes for performance
    - Enable RLS and add policies

  3. Security
    - Enable RLS
    - Add policies for tax rate management
*/

-- Modify tax_rates table first
ALTER TABLE tax_rates
ALTER COLUMN rate DROP NOT NULL;

-- Add new columns to tax_rates
ALTER TABLE tax_rates
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS calculation_method text NOT NULL DEFAULT 'bracket'
  CHECK (calculation_method IN ('bracket', 'flat', 'percentage')),
ADD COLUMN IF NOT EXISTS flat_amount numeric,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS jurisdiction text,
ADD COLUMN IF NOT EXISTS authority text;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_brackets_tax_rate_id ON tax_brackets(tax_rate_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_type_state ON tax_rates(type, state);
CREATE INDEX IF NOT EXISTS idx_tax_rates_effective_date ON tax_rates(effective_date);
CREATE INDEX IF NOT EXISTS idx_tax_rates_jurisdiction ON tax_rates(jurisdiction);

-- Enable RLS
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;

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

-- Add trigger for updating updated_at
CREATE TRIGGER update_tax_brackets_updated_at
  BEFORE UPDATE ON tax_brackets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample federal tax brackets for 2025
INSERT INTO tax_rates (
  type, 
  description, 
  calculation_method, 
  jurisdiction, 
  authority, 
  effective_date,
  rate
)
VALUES (
  'federal',
  'Federal Income Tax 2025',
  'bracket',
  'US',
  'IRS',
  '2025-01-01',
  0 -- Set a default rate even though we're using brackets
);

WITH new_rate AS (
  SELECT id FROM tax_rates 
  WHERE type = 'federal' 
  AND effective_date = '2025-01-01'
  AND description = 'Federal Income Tax 2025'
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