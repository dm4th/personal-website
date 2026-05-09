-- Add agent_library_db_id and icp_rubric_db_id to notion_configs
-- These store the user's own Agent Library and ICP Scoring Rubric database IDs
-- after they clone the GTM Hub template into their workspace.

ALTER TABLE notion_configs
  ADD COLUMN IF NOT EXISTS agent_library_db_id text,
  ADD COLUMN IF NOT EXISTS icp_rubric_db_id text;
