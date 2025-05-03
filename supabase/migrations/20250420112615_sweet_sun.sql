/*
  # Time Entries Migration

  1. Changes
    - Create time entries table for tracking employee work hours
    - Add indexes for efficient querying
    - Add RLS policies for employee and manager access
    - Add sample time entries
*/

-- Create time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  break_duration interval DEFAULT '00:00:00',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  approved_by uuid REFERENCES employees(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT time_entries_time_range_check CHECK (end_time IS NULL OR end_time > start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Employees can manage their own time entries" ON time_entries;
  DROP POLICY IF EXISTS "Managers can view and approve time entries" ON time_entries;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add policies
CREATE POLICY "Employees can manage their own time entries"
  ON time_entries
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM employees
      WHERE id = time_entries.employee_id
    )
  );

CREATE POLICY "Managers can view and approve time entries"
  ON time_entries
  FOR ALL
  TO public
  USING (
    auth.uid() IN (
      SELECT e1.user_id
      FROM employees e1
      JOIN employees e2 ON e1.company_id = e2.company_id
      WHERE e2.id = time_entries.employee_id
      AND e1.role IN ('admin', 'manager')
    )
  );

-- Drop existing trigger if it exists
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add trigger for updating updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_time_entries_updated_at'
  ) THEN
    CREATE TRIGGER update_time_entries_updated_at
      BEFORE UPDATE ON time_entries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample time entries
INSERT INTO time_entries (
  employee_id,
  date,
  start_time,
  end_time,
  break_duration,
  status,
  notes
)
SELECT
  e.id,
  CURRENT_DATE - (i || ' days')::interval,
  '09:00:00'::time,
  '17:00:00'::time,
  '00:30:00'::interval,
  'approved',
  'Regular work day'
FROM 
  employees e,
  generate_series(0, 14) i
WHERE 
  e.status = 'active'
  AND NOT EXISTS (
    SELECT 1 
    FROM time_entries t 
    WHERE t.employee_id = e.id 
    AND t.date = CURRENT_DATE - (i || ' days')::interval
  )
LIMIT 50;