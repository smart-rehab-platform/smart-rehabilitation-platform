
DO $$
BEGIN
    CREATE TYPE preferred_time_period AS ENUM (
        'morning',
        'afternoon',
        'evening',
        'flexible'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN
    CREATE TYPE case_intake_status AS ENUM (
        'pending',
        'assigned',
        'under_assessment',
        'accepted',
        'rejected',
        'converted_to_patient'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'case_request_submitted';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'case_request_assigned';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'case_request_accepted';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'case_request_rejected';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'case_request_converted';


CREATE TABLE IF NOT EXISTS case_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT case_categories_name_not_blank CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_case_categories_name_lower
    ON case_categories (lower(trim(name)));

CREATE INDEX IF NOT EXISTS idx_case_categories_active
    ON case_categories (is_active)
    WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS trg_case_categories_updated_at ON case_categories;
CREATE TRIGGER trg_case_categories_updated_at
    BEFORE UPDATE ON case_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS specialist_case_categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   UUID NOT NULL REFERENCES case_categories(id) ON DELETE RESTRICT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (specialist_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_specialist_case_categories_category
    ON specialist_case_categories (category_id);


CREATE TABLE IF NOT EXISTS case_intake_requests (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id                       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    child_name                      VARCHAR(150) NOT NULL,
    date_of_birth                   DATE NOT NULL,
    gender                          VARCHAR(10),
    category_id                     UUID NOT NULL REFERENCES case_categories(id) ON DELETE RESTRICT,
    case_description                TEXT NOT NULL,
    observed_difficulties           TEXT,
    has_previous_diagnosis          BOOLEAN NOT NULL DEFAULT FALSE,
    previous_diagnosis_details      TEXT,
    is_currently_receiving_treatment BOOLEAN NOT NULL DEFAULT FALSE,
    current_treatment_details       TEXT,
    preferred_contact_period        preferred_time_period NOT NULL,
    status                          case_intake_status NOT NULL DEFAULT 'pending',
    assigned_specialist_id          UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by_admin_id            UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_id                      UUID REFERENCES patients(id) ON DELETE SET NULL,
    assessment_notes                TEXT,
    rejection_reason                TEXT,
    submitted_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_at                     TIMESTAMPTZ,
    accepted_at                     TIMESTAMPTZ,
    converted_at                    TIMESTAMPTZ,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT case_intake_child_name_not_blank
        CHECK (char_length(trim(child_name)) > 0),
    CONSTRAINT case_intake_case_description_not_blank
        CHECK (char_length(trim(case_description)) > 0),
    CONSTRAINT case_intake_dob_not_future
        CHECK (date_of_birth <= CURRENT_DATE)
);


CREATE UNIQUE INDEX IF NOT EXISTS idx_case_intake_one_active_per_child
    ON case_intake_requests (parent_id, child_name, date_of_birth)
    WHERE status NOT IN ('rejected', 'converted_to_patient');

CREATE INDEX IF NOT EXISTS idx_case_intake_parent_status
    ON case_intake_requests (parent_id, status);

CREATE INDEX IF NOT EXISTS idx_case_intake_assigned_specialist_status
    ON case_intake_requests (assigned_specialist_id, status)
    WHERE assigned_specialist_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_case_intake_admin_inbox
    ON case_intake_requests (status, submitted_at DESC)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_case_intake_category
    ON case_intake_requests (category_id);

CREATE INDEX IF NOT EXISTS idx_case_intake_patient
    ON case_intake_requests (patient_id)
    WHERE patient_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_case_intake_requests_updated_at ON case_intake_requests;
CREATE TRIGGER trg_case_intake_requests_updated_at
    BEFORE UPDATE ON case_intake_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS case_request_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_request_id UUID NOT NULL REFERENCES case_intake_requests(id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,
    file_type       VARCHAR(50),
    original_name   VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT case_request_attachments_file_url_not_blank
        CHECK (char_length(trim(file_url)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_case_request_attachments_request
    ON case_request_attachments (case_request_id);


ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS case_request_id UUID
    REFERENCES case_intake_requests(id) ON DELETE RESTRICT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_case_request_id
    ON conversations (case_request_id)
    WHERE case_request_id IS NOT NULL;
