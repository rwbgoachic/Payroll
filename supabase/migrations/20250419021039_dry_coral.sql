/*
  # Tax Rates Data Migration

  1. Creates tax rates table if not exists
  2. Inserts initial tax rates for:
    - Federal income tax brackets
    - California state tax brackets
    - New York state tax brackets
*/

-- Ensure tax_rates table exists
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

-- Enable RLS
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Tax rates are viewable by all authenticated users" ON tax_rates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Federal Tax Rates for 2025
INSERT INTO tax_rates (type, rate, threshold_low, threshold_high, effective_date, expiration_date) VALUES
  ('federal', 0.10, 0, 11600, '2025-01-01', '2025-12-31'),
  ('federal', 0.12, 11601, 47150, '2025-01-01', '2025-12-31'),
  ('federal', 0.22, 47151, 100525, '2025-01-01', '2025-12-31'),
  ('federal', 0.24, 100526, 191950, '2025-01-01', '2025-12-31'),
  ('federal', 0.32, 191951, 243725, '2025-01-01', '2025-12-31'),
  ('federal', 0.35, 243726, 609350, '2025-01-01', '2025-12-31'),
  ('federal', 0.37, 609351, 999999999, '2025-01-01', '2025-12-31');

-- California State Tax Rates
INSERT INTO tax_rates (type, state, rate, threshold_low, threshold_high, effective_date, expiration_date) VALUES
  ('state', 'CA', 0.01, 0, 10099, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.02, 10100, 23942, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.04, 23943, 37788, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.06, 37789, 52455, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.08, 52456, 66295, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.093, 66296, 338639, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.103, 338640, 406364, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.113, 406365, 677275, '2025-01-01', '2025-12-31'),
  ('state', 'CA', 0.123, 677276, 999999999, '2025-01-01', '2025-12-31');

-- New York State Tax Rates
INSERT INTO tax_rates (type, state, rate, threshold_low, threshold_high, effective_date, expiration_date) VALUES
  ('state', 'NY', 0.04, 0, 8500, '2025-01-01', '2025-12-31'),
  ('state', 'NY', 0.045, 8501, 11700, '2025-01-01', '2025-12-31'),
  ('state', 'NY', 0.0525, 11701, 13900, '2025-01-01', '2025-12-31'),
  ('state', 'NY', 0.059, 13901, 80650, '2025-01-01', '2025-12-31'),
  ('state', 'NY', 0.0597, 80651, 215400, '2025-01-01', '2025-12-31'),
  ('state', 'NY', 0.0633, 215401, 1077550, '2025-01-01', '2025-12-31'),
  ('state', 'NY', 0.0685, 1077551, 999999999, '2025-01-01', '2025-12-31');