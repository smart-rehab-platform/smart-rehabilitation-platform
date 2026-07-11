-- Parent-initiated session requests reviewed by assigned specialists

CREATE TYPE session_request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE session_request_reason AS ENUM (
    'regular_follow_up',
    'replacement_cancelled',
    'replacement_missed',
    'additional_session',
    'consultation',
    'other'
);

CREATE TYPE preferred_time_period AS ENUM (
    'morning',
    'afternoon',
    'evening',
    'flexible'
);

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'session_request';

CREATE TABLE session_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    parent_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason              session_request_reason NOT NULL,
    reason_other_text   TEXT,
    preferred_date      DATE NOT NULL,
    preferred_time_period preferred_time_period NOT NULL,
    notes               TEXT,
    status              session_request_status NOT NULL DEFAULT 'pending',
    rejection_reason    TEXT,
    approved_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_requests_specialist_status
    ON session_requests(specialist_id, status);

CREATE INDEX idx_session_requests_parent_id
    ON session_requests(parent_id);

CREATE INDEX idx_session_requests_patient_id
    ON session_requests(patient_id);

CREATE UNIQUE INDEX idx_session_requests_approved_session
    ON session_requests(approved_session_id)
    WHERE approved_session_id IS NOT NULL;

CREATE UNIQUE INDEX idx_session_requests_one_pending
    ON session_requests(patient_id, parent_id, specialist_id)
    WHERE status = 'pending';

CREATE TRIGGER trg_session_requests_updated_at
    BEFORE UPDATE ON session_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
