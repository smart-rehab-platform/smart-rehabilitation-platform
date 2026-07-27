ALTER TABLE case_intake_requests
    ADD COLUMN IF NOT EXISTS child_image_url TEXT;

COMMENT ON COLUMN case_intake_requests.child_image_url IS
    'Optional relative /uploads/ path for a child photo submitted with the case request.';
-- Temporary child photo URL on case intake requests (copied to patients.profile_image_url on conversion).
ALTER TABLE case_intake_requests
    ADD COLUMN IF NOT EXISTS child_image_url TEXT NULL;
