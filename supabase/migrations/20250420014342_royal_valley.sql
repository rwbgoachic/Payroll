/*
  # Tax Rates and Brackets Schema

  1. New Tables
    - tax_rates: Stores tax rate configurations
      - id (uuid, primary key)
      - type (text): federal, state, etc.
      - state (text, nullable): For state-specific rates
      - rate (numeric, nullable): For percentage-based calculations
      - threshold_low/high (numeric, nullable): For bracket thresholds
      - effective_date (date): When rate becomes active
      - expiration_date (date, nullable): When rate expires
      - description (text, nullable): Human-readable description
      - calculation_method (text): bracket, flat, or percentage
      - flat_amount (numeric, nullable): For flat-rate taxes
      - notes (text, nullable): Additional information
      - jurisdiction (text, nullable): Tax jurisdiction
      - authority (text, nullable): Taxing authority

  2. Indexes
    - On type and state for efficient lookups
    - On effective date for date-based queries
    - On jurisdiction for jurisdiction-based filtering

  3. Security
    - Enable RLS
    - Add policies for viewing and managing tax rates
*/

-- Create tax_rates table if it doesn't exist
CREATE TABLE IF NOT EXISTS tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  state text,
  rate numeric,
  threshold_low numeric,
  threshold_high numeric,
  effective_date date NOT NULL,
  expiration_date date,
  description text,
  calculation_method text NOT NULL DEFAULT 'bracket'
    CHECK (calculation_method IN ('bracket', 'flat', 'percentage')),
  flat_amount numeric,
  notes text,
  jurisdiction text,
  authority text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_rates_type_state ON tax_rates(type, state);
CREATE INDEX IF NOT EXISTS idx_tax_rates_effective_date ON tax_rates(effective_date);
CREATE INDEX IF NOT EXISTS idx_tax_rates_jurisdiction ON tax_rates(jurisdiction);

-- Enable RLS
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Tax rates are viewable by authenticated users"
  ON tax_rates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage tax rates"
  ON tax_rates
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
CREATE TRIGGER update_tax_rates_updated_at
  BEFORE UPDATE ON tax_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();