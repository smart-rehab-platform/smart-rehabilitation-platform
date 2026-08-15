-- Speech Analysis V2.4: persist deterministic analysis quality assessment.
-- Safe to re-run: uses IF NOT EXISTS for columns.

ALTER TABLE speech_analyses
  ADD COLUMN IF NOT EXISTS speech_analysis_quality JSONB NULL;
