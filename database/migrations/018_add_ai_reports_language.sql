-- Persist the language used when an AI report was generated.
ALTER TABLE ai_reports
  ADD COLUMN IF NOT EXISTS language VARCHAR(8) NOT NULL DEFAULT 'en';

UPDATE ai_reports
SET language = 'en'
WHERE language IS NULL OR TRIM(language) = '';

CREATE INDEX IF NOT EXISTS idx_ai_reports_language ON ai_reports(language);
