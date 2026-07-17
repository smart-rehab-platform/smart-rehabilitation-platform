-- Enforce at most one active treatment plan per patient.
-- Safe to re-run. Does not modify existing plan rows.
-- Pre-flight: only create the index when no duplicate active rows exist.

DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT patient_id
    FROM treatment_plans
    WHERE status = 'active'
    GROUP BY patient_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE NOTICE
      'Skipping idx_treatment_plans_one_active_per_patient: % patient(s) already have multiple active plans. Resolve duplicates before applying this index.',
      duplicate_count;
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS idx_treatment_plans_one_active_per_patient
      ON treatment_plans (patient_id)
      WHERE status = 'active';
  END IF;
END $$;
