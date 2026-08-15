-- Speech Analysis V2.1: persist expected-vs-spoken word comparison results.
-- Safe to re-run: uses IF NOT EXISTS for columns.

ALTER TABLE speech_analyses
  ADD COLUMN IF NOT EXISTS expected_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS word_accuracy_percentage NUMERIC(5,2) NULL,
  ADD COLUMN IF NOT EXISTS word_error_details JSONB NULL;
