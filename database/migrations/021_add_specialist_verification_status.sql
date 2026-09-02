-- Specialist account verification status (admin approve/reject).
DO $$
BEGIN
  CREATE TYPE specialist_verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE specialist_profiles
  ADD COLUMN IF NOT EXISTS verification_status specialist_verification_status;

-- Existing specialists remain able to work: backfill as approved.
UPDATE specialist_profiles
SET verification_status = 'approved'
WHERE verification_status IS NULL;

-- Specialist users without a profile row get an approved stub so they are not locked out.
INSERT INTO specialist_profiles (user_id, verification_status)
SELECT u.id, 'approved'::specialist_verification_status
FROM users u
WHERE u.role = 'specialist'
  AND NOT EXISTS (
    SELECT 1
    FROM specialist_profiles sp
    WHERE sp.user_id = u.id
  );

ALTER TABLE specialist_profiles
  ALTER COLUMN verification_status SET DEFAULT 'pending';

ALTER TABLE specialist_profiles
  ALTER COLUMN verification_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_specialist_profiles_verification_status
  ON specialist_profiles (verification_status);
