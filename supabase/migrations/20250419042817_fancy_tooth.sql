/*
  # Update Deductions Table

  1. Changes
    - Add missing indexes
    - Add trigger for updated_at timestamp
*/

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_deductions_employee_id ON deductions(employee_id);

-- Add trigger for updating updated_at timestamp
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_deductions_updated_at'
  ) THEN
    CREATE TRIGGER update_deductions_updated_at
      BEFORE UPDATE ON deductions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;