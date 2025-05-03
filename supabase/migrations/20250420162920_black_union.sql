-- Add UUID validation to audit_logs table
-- This migration adds a trigger to validate UUID format before insertion

-- Create a function to validate UUID format
CREATE OR REPLACE FUNCTION validate_uuid(id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to validate UUIDs before insert/update
CREATE OR REPLACE FUNCTION validate_audit_log_uuids()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate id
  IF NOT validate_uuid(NEW.id::text) THEN
    RAISE EXCEPTION 'Invalid UUID format for id: %', NEW.id;
  END IF;
  
  -- Validate user_id if not null
  IF NEW.user_id IS NOT NULL AND NOT validate_uuid(NEW.user_id::text) THEN
    -- Instead of raising an exception, set to null
    NEW.user_id := NULL;
  END IF;
  
  -- Validate entity_id if not null
  IF NEW.entity_id IS NOT NULL AND NOT validate_uuid(NEW.entity_id::text) THEN
    -- Instead of raising an exception, set to null
    NEW.entity_id := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_audit_log_uuids_trigger ON audit_logs;
CREATE TRIGGER validate_audit_log_uuids_trigger
BEFORE INSERT OR UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION validate_audit_log_uuids();

-- Add index on user_id to improve query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_valid
ON audit_logs(user_id)
WHERE user_id IS NOT NULL;

-- Add index on entity_id to improve query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id_valid
ON audit_logs(entity_id)
WHERE entity_id IS NOT NULL;

-- Add comment to explain the purpose of this migration
COMMENT ON TABLE audit_logs IS 'Stores audit logs with UUID validation for user_id and entity_id';