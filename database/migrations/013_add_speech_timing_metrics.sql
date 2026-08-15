-- Speech Analysis V2.2: persist objective timing/fluency measurements.
-- Safe to re-run: uses IF NOT EXISTS for columns.

ALTER TABLE speech_analyses
  ADD COLUMN IF NOT EXISTS speech_timing_metrics JSONB NULL;
