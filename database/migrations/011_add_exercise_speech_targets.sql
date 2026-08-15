-- Speech Analysis V2.1: optional expected speech targets on exercises.
-- Safe to re-run: uses IF NOT EXISTS for columns.

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS expected_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS target_word VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS target_phoneme VARCHAR(20) NULL;
