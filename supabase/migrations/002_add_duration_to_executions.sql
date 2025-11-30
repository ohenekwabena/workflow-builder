-- Add duration_ms column to workflow_executions table
ALTER TABLE workflow_executions
ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- Add comment to the column
COMMENT ON COLUMN workflow_executions.duration_ms IS 'Total execution duration in milliseconds (sum of all step durations)';
