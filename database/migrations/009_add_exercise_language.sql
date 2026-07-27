-- Add exercise language for speech transcription (en | ar).
-- Safe to re-run: ADD COLUMN IF NOT EXISTS is not used for CHECK; run once per environment.

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS language VARCHAR(2) NOT NULL DEFAULT 'en';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'exercises_language_check'
  ) THEN
    ALTER TABLE exercises
      ADD CONSTRAINT exercises_language_check
      CHECK (language IN ('en', 'ar'));
  END IF;
END $$;
