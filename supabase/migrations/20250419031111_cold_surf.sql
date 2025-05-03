/*
  # Add Time Tracking

  1. New Tables
    - `time_entries`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `break_duration` (interval)
      - `status` (text)
      - `notes` (text)
      - `approved_by` (uuid, references employees)
      - `approved_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `time_entries` table
    - Add policy for employees to manage their own time entries
    - Add policy for managers to approve time entries

  3. Changes
    - Add constraints for status values
    - Add validation for time ranges
*/

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  break_duration interval DEFAULT '0'::interval,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  approved_by uuid REFERENCES employees(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT time_entries_status_check CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  CONSTRAINT time_entries_time_range_check CHECK (
    end_time IS NULL OR end_time > start_time
  )
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Employees can manage their own time entries'
  ) THEN
    CREATE POLICY "Employees can manage their own time entries" ON time_entries
      FOR ALL USING (
        auth.uid() IN (
          SELECT user_id FROM employees WHERE id = time_entries.employee_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Managers can view and approve time entries'
  ) THEN
    CREATE POLICY "Managers can view and approve time entries" ON time_entries
      FOR ALL USING (
        auth.uid() IN (
          SELECT e1.user_id 
          FROM employees e1 
          JOIN employees e2 ON e1.company_id = e2.company_id 
          WHERE e2.id = time_entries.employee_id 
          AND e1.role IN ('admin', 'manager')
        )
      );
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);