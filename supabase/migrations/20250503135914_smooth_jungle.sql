/*
  # Add Wallet and Disbursement Tables

  1. New Tables
    - employer_wallets: Stores employer wallet balances
    - employee_wallets: Stores employee wallet balances
    - wallet_transactions: Stores wallet transaction history

  2. New Functions
    - transfer_funds: RPC function to transfer funds between wallets

  3. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create employer_wallets table
CREATE TABLE IF NOT EXISTS employer_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Create employee_wallets table
CREATE TABLE IF NOT EXISTS employee_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id),
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_wallet_id uuid REFERENCES employer_wallets(id),
  to_wallet_id uuid REFERENCES employee_wallets(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'payroll')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  reference_id text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create transfer_funds function
CREATE OR REPLACE FUNCTION transfer_funds(
  p_from_wallet_id uuid,
  p_employee_id uuid,
  p_amount numeric
) RETURNS jsonb AS $$
DECLARE
  v_from_wallet employer_wallets%ROWTYPE;
  v_to_wallet employee_wallets%ROWTYPE;
  v_transaction_id uuid;
BEGIN
  -- Get the from wallet
  SELECT * INTO v_from_wallet
  FROM employer_wallets
  WHERE id = p_from_wallet_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'From wallet not found';
  END IF;
  
  -- Check if from wallet has sufficient balance
  IF v_from_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance in from wallet';
  END IF;
  
  -- Get or create the to wallet
  SELECT * INTO v_to_wallet
  FROM employee_wallets
  WHERE employee_id = p_employee_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    INSERT INTO employee_wallets (employee_id, balance, currency)
    VALUES (p_employee_id, 0, v_from_wallet.currency)
    RETURNING * INTO v_to_wallet;
  END IF;
  
  -- Update the from wallet
  UPDATE employer_wallets
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE id = p_from_wallet_id;
  
  -- Update the to wallet
  UPDATE employee_wallets
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE id = v_to_wallet.id;
  
  -- Create the transaction record
  INSERT INTO wallet_transactions (
    from_wallet_id,
    to_wallet_id,
    amount,
    currency,
    transaction_type,
    status,
    description
  ) VALUES (
    p_from_wallet_id,
    v_to_wallet.id,
    p_amount,
    v_from_wallet.currency,
    'payroll',
    'completed',
    'Payroll transfer'
  ) RETURNING id INTO v_transaction_id;
  
  -- Return the transaction ID
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE employer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Add policies for employer_wallets
CREATE POLICY "Company admins can view employer wallets"
ON employer_wallets
FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT user_id
    FROM employees
    WHERE company_id = employer_wallets.company_id
    AND role = 'admin'
  )
);

-- Add policies for employee_wallets
CREATE POLICY "Employees can view their own wallets"
ON employee_wallets
FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT user_id
    FROM employees
    WHERE id = employee_wallets.employee_id
  )
);

CREATE POLICY "Company admins can view employee wallets"
ON employee_wallets
FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT e1.user_id
    FROM employees e1
    JOIN employees e2 ON e1.company_id = e2.company_id
    WHERE e2.id = employee_wallets.employee_id
    AND e1.role = 'admin'
  )
);

-- Add policies for wallet_transactions
CREATE POLICY "Users can view their own wallet transactions"
ON wallet_transactions
FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT e.user_id
    FROM employees e
    JOIN employee_wallets ew ON e.id = ew.employee_id
    WHERE ew.id = wallet_transactions.to_wallet_id
  )
);

CREATE POLICY "Company admins can view company wallet transactions"
ON wallet_transactions
FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT e.user_id
    FROM employees e
    JOIN employer_wallets ew ON e.company_id = ew.company_id
    WHERE ew.id = wallet_transactions.from_wallet_id
    AND e.role = 'admin'
  )
);

-- Add triggers for updating updated_at
CREATE TRIGGER update_employer_wallets_updated_at
BEFORE UPDATE ON employer_wallets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_wallets_updated_at
BEFORE UPDATE ON employee_wallets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample employer wallet for testing
INSERT INTO employer_wallets (company_id, balance, currency)
SELECT 
  id AS company_id,
  100000 AS balance,
  'USD' AS currency
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM employer_wallets WHERE company_id = companies.id
);