/*
  # Tax Brackets Migration

  1. New Table
    - tax_brackets: Stores tax bracket information
      - id (uuid, primary key)
      - tax_rate_id (uuid): References tax_rates
      - threshold_low (numeric): Lower bound of bracket
      - threshold_high (numeric, nullable): Upper bound of bracket
      - rate (numeric): Tax rate for this bracket

  2. Sample Data
    - 2025 Federal tax brackets with updated thresholds
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_tax_brackets_tax_rate_id ON tax_brackets(tax_rate_id);

-- Enable RLS
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;

-- Insert sample federal tax brackets for 2025
WITH new_rate AS (
  INSERT INTO tax_rates (
    type,
    description,
    calculation_method,
    jurisdiction,
    authority,
    effective_date
  )
  VALUES (
    'federal',
    'Federal Income Tax 2025',
    'bracket',
    'US',
    'IRS',
    '2025-01-01'
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