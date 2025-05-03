/*
  # Add state tax rates and brackets

  1. Changes
    - Add sample state tax rates for CA and NY
    - Add corresponding tax brackets for each state
*/

-- Insert California tax rate
WITH ca_rate AS (
  INSERT INTO tax_rates (
    type,
    state,
    description,
    calculation_method,
    jurisdiction,
    authority,
    effective_date
  )
  VALUES (
    'state',
    'CA',
    'California State Income Tax 2025',
    'bracket',
    'CA',
    'California Franchise Tax Board',
    '2025-01-01'
  )
  RETURNING id
)
INSERT INTO tax_brackets (tax_rate_id, threshold_low, threshold_high, rate)
SELECT 
  ca_rate.id,
  threshold_low,
  threshold_high,
  rate
FROM ca_rate, (VALUES
  (0, 10099, 0.01),
  (10099, 23942, 0.02),
  (23942, 37788, 0.04),
  (37788, 52455, 0.06),
  (52455, 66295, 0.08),
  (66295, 338639, 0.093),
  (338639, 406364, 0.103),
  (406364, 677275, 0.113),
  (677275, NULL, 0.123)
) AS brackets(threshold_low, threshold_high, rate);

-- Insert New York tax rate
WITH ny_rate AS (
  INSERT INTO tax_rates (
    type,
    state,
    description,
    calculation_method,
    jurisdiction,
    authority,
    effective_date
  )
  VALUES (
    'state',
    'NY',
    'New York State Income Tax 2025',
    'bracket',
    'NY',
    'New York Department of Taxation and Finance',
    '2025-01-01'
  )
  RETURNING id
)
INSERT INTO tax_brackets (tax_rate_id, threshold_low, threshold_high, rate)
SELECT 
  ny_rate.id,
  threshold_low,
  threshold_high,
  rate
FROM ny_rate, (VALUES
  (0, 8500, 0.04),
  (8500, 11700, 0.045),
  (11700, 13900, 0.0525),
  (13900, 80650, 0.055),
  (80650, 215400, 0.06),
  (215400, 1077550, 0.0685),
  (1077550, NULL, 0.0882)
) AS brackets(threshold_low, threshold_high, rate);