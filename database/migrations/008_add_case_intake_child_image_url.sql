-- Temporary child photo URL on case intake requests (copied to patients.profile_image_url on conversion).
ALTER TABLE case_intake_requests
    ADD COLUMN IF NOT EXISTS child_image_url TEXT NULL;
