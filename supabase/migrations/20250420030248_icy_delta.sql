/*
  # Fix tax brackets policies

  1. Changes
    - Add policies for tax brackets table with existence checks
    - Add trigger for updating updated_at with existence check
*/

DO $$ BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tax_brackets' 
    AND policyname = 'Tax brackets are viewable by authenticated users'
  ) THEN
    DROP POLICY "Tax brackets are viewable by authenticated users" ON tax_brackets;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tax_brackets' 
    AND policyname = 'Only admins can manage tax brackets'
  ) THEN
    DROP POLICY "Only admins can manage tax brackets" ON tax_brackets;
  END IF;
END $$;

-- Add policies for tax brackets
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

-- Add trigger for updating updated_at if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_tax_brackets_updated_at'
  ) THEN
    CREATE TRIGGER update_tax_brackets_updated_at
      BEFORE UPDATE ON tax_brackets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;