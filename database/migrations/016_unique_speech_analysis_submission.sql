-- Enforce one speech analysis per exercise submission.
-- Safe to re-run: duplicate cleanup is keyed by ROW_NUMBER, unique index uses IF NOT EXISTS.

-- Keep the newest analysis per submission (tie-break by id DESC).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY submission_id
      ORDER BY analyzed_at DESC, id DESC
    ) AS rn
  FROM speech_analyses
),
duplicates AS (
  SELECT id
  FROM ranked
  WHERE rn > 1
)
DELETE FROM ai_progress_notes
WHERE speech_analysis_id IN (SELECT id FROM duplicates);

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY submission_id
      ORDER BY analyzed_at DESC, id DESC
    ) AS rn
  FROM speech_analyses
),
duplicates AS (
  SELECT id
  FROM ranked
  WHERE rn > 1
)
UPDATE speech_analyses
SET compared_to_analysis_id = NULL
WHERE compared_to_analysis_id IN (SELECT id FROM duplicates);

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY submission_id
      ORDER BY analyzed_at DESC, id DESC
    ) AS rn
  FROM speech_analyses
),
duplicates AS (
  SELECT id
  FROM ranked
  WHERE rn > 1
)
DELETE FROM speech_analyses
WHERE id IN (SELECT id FROM duplicates);

DROP INDEX IF EXISTS idx_speech_analyses_submission;

CREATE UNIQUE INDEX IF NOT EXISTS idx_speech_analyses_submission_id_unique
  ON speech_analyses(submission_id);
