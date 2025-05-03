/*
  # Add FICA tax rates

  1. Changes
    - Add Social Security tax rate
    - Add Medicare tax rate
    - Add Additional Medicare tax rate for high earners
*/

-- Insert Social Security tax rate
INSERT INTO tax_rates (
  type,
  description,
  calculation_method,
  rate,
  threshold_high,
  jurisdiction,
  authority,
  effective_date,
  notes
)
VALUES (
  'social_security',
  'Social Security Tax 2025',
  'percentage',
  0.062,
  160200, -- 2025 wage base limit
  'US',
  'SSA',
  '2025-01-01',
  'Employee portion of Social Security tax (6.2%) up to wage base limit'
);

-- Insert Medicare tax rate
INSERT INTO tax_rates (
  type,
  description,
  calculation_method,
  rate,
  jurisdiction,
  authority,
  effective_date,
  notes
)
VALUES (
  'medicare',
  'Medicare Tax 2025',
  'percentage',
  0.0145,
  'US',
  'CMS',
  '2025-01-01',
  'Employee portion of Medicare tax (1.45%) with no wage base limit'
);

-- Insert Additional Medicare tax rate
INSERT INTO tax_rates (
  type,
  description,
  calculation_method,
  rate,
  threshold_low,
  jurisdiction,
  authority,
  effective_date,
  notes
)
VALUES (
  'additional_medicare',
  'Additional Medicare Tax 2025',
  'percentage',
  0.009,
  200000,
  'US',
  'CMS',
  '2025-01-01',
  'Additional Medicare tax (0.9%) on earnings above $200,000'
);