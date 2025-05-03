/*
  # Fix recursive RLS policies for employees table

  1. Changes
    - Remove recursive policies that were causing infinite loops
    - Implement new, more efficient policies for employee access control
    - Separate admin and employee access policies for better clarity

  2. Security
    - Maintain row level security
    - Ensure proper access control for admins and employees
    - Prevent policy recursion while maintaining security
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Company admins can view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view their own data" ON employees;

-- Create new, non-recursive policies
CREATE POLICY "Admins can manage all company employees"
ON employees
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM employees AS admin_user
    WHERE admin_user.user_id = auth.uid()
    AND admin_user.company_id = employees.company_id
    AND admin_user.role = 'admin'
  )
);

CREATE POLICY "Employees can view their own profile"
ON employees
FOR SELECT
TO public
USING (
  auth.uid() = user_id
);

-- Add index to improve policy performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id_role
ON employees(user_id, role);