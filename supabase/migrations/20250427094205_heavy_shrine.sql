/*
  # Helcim Integration Schema

  1. New Tables
    - `helcim_integration` - Stores Helcim API configuration
    - `helcim_customers` - Stores Helcim customer IDs
    - `helcim_payment_methods` - Stores saved payment methods
    - `helcim_transactions` - Stores transaction history
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create helcim_integration table if it doesn't exist
CREATE TABLE IF NOT EXISTS helcim_integration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id uuid REFERENCES systems(id),
  api_key_encrypted text NOT NULL,
  test_mode boolean NOT NULL DEFAULT true,
  merchant_id text,
  terminal_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create helcim_customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS helcim_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  company_id uuid REFERENCES companies(id),
  helcim_customer_id text NOT NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create helcim_payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS helcim_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES helcim_customers(id) ON DELETE CASCADE,
  token text NOT NULL,
  type text NOT NULL CHECK (type IN ('credit-card', 'ach', 'crypto', 'digital-wallet')),
  details jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create helcim_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS helcim_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  customer_id uuid REFERENCES helcim_customers(id),
  payment_method_id uuid REFERENCES helcim_payment_methods(id),
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status IN ('approved', 'declined', 'error', 'pending')),
  auth_code text,
  message text,
  receipt_url text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_helcim_customers_user_id ON helcim_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_helcim_customers_company_id ON helcim_customers(company_id);
CREATE INDEX IF NOT EXISTS idx_helcim_customers_helcim_id ON helcim_customers(helcim_customer_id);

CREATE INDEX IF NOT EXISTS idx_helcim_payment_methods_customer_id ON helcim_payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_helcim_payment_methods_type ON helcim_payment_methods(type);

CREATE INDEX IF NOT EXISTS idx_helcim_transactions_transaction_id ON helcim_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_helcim_transactions_customer_id ON helcim_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_helcim_transactions_status ON helcim_transactions(status);
CREATE INDEX IF NOT EXISTS idx_helcim_transactions_created_at ON helcim_transactions(created_at);

-- Enable RLS
ALTER TABLE helcim_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE helcim_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE helcim_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE helcim_transactions ENABLE ROW LEVEL SECURITY;

-- Add policies for helcim_integration
CREATE POLICY "Super admins can manage Helcim integration"
ON helcim_integration
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

-- Add policies for helcim_customers
CREATE POLICY "Users can view their own customer records"
ON helcim_customers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Company admins can view company customer records"
ON helcim_customers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.user_id = auth.uid()
    AND employees.company_id = helcim_customers.company_id
    AND employees.role = 'admin'
  )
);

CREATE POLICY "Super admins can manage all customer records"
ON helcim_customers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

-- Add policies for helcim_payment_methods
CREATE POLICY "Users can view their own payment methods"
ON helcim_payment_methods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM helcim_customers
    WHERE helcim_customers.id = helcim_payment_methods.customer_id
    AND helcim_customers.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can view company payment methods"
ON helcim_payment_methods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM helcim_customers
    JOIN employees ON employees.company_id = helcim_customers.company_id
    WHERE helcim_customers.id = helcim_payment_methods.customer_id
    AND employees.user_id = auth.uid()
    AND employees.role = 'admin'
  )
);

CREATE POLICY "Super admins can manage all payment methods"
ON helcim_payment_methods
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

-- Add policies for helcim_transactions
CREATE POLICY "Users can view their own transactions"
ON helcim_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM helcim_customers
    WHERE helcim_customers.id = helcim_transactions.customer_id
    AND helcim_customers.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can view company transactions"
ON helcim_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM helcim_customers
    JOIN employees ON employees.company_id = helcim_customers.company_id
    WHERE helcim_customers.id = helcim_transactions.customer_id
    AND employees.user_id = auth.uid()
    AND employees.role = 'admin'
  )
);

CREATE POLICY "Super admins can manage all transactions"
ON helcim_transactions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = auth.uid() AND ur.name = 'super-admin'
  )
);

-- Add triggers for updating updated_at
CREATE TRIGGER update_helcim_integration_updated_at
BEFORE UPDATE ON helcim_integration
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_helcim_customers_updated_at
BEFORE UPDATE ON helcim_customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_helcim_payment_methods_updated_at
BEFORE UPDATE ON helcim_payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();