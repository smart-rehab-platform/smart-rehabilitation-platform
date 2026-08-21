
ALTER TABLE ai_reports
  ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_ai_reports_generated_by ON ai_reports(generated_by);
