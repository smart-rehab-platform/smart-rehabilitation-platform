-- Speech Analysis V3.1: persist English forced phoneme alignment (MFA).
-- Safe to re-run: uses IF NOT EXISTS for columns.

ALTER TABLE speech_analyses
  ADD COLUMN IF NOT EXISTS speech_phoneme_analysis JSONB NULL;
