CREATE TYPE complaint_category AS ENUM (
    'specialist_not_responding',
    'poor_follow_up',
    'repeated_session_cancellations',
    'delayed_exercise_feedback',
    'inappropriate_communication',
    'other'
);

CREATE TYPE complaint_status AS ENUM (
    'pending',
    'under_review',
    'resolved',
    'rejected'
);

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'complaint_submitted';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'complaint_reviewed';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'specialist_warning_issued';

CREATE TABLE complaints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    specialist_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        complaint_category NOT NULL,
    description     TEXT NOT NULL,
    attachment_url  TEXT,
    status          complaint_status NOT NULL DEFAULT 'pending',
    admin_notes     TEXT,
    parent_response TEXT,
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_complaints_parent_id ON complaints(parent_id);
CREATE INDEX idx_complaints_patient_id ON complaints(patient_id);
CREATE INDEX idx_complaints_specialist_id ON complaints(specialist_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaints_specialist_resolved_at
    ON complaints(specialist_id, resolved_at DESC)
    WHERE status = 'resolved';

CREATE UNIQUE INDEX idx_complaints_one_active_per_category
    ON complaints(parent_id, patient_id, specialist_id, category)
    WHERE status IN ('pending', 'under_review');

CREATE TRIGGER trg_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE specialist_warnings (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    warning_level             VARCHAR(50) NOT NULL DEFAULT 'official',
    confirmed_complaints_count  INT NOT NULL,
    reason                    TEXT,
    issued_by                 UUID REFERENCES users(id),
    is_automatic              BOOLEAN NOT NULL DEFAULT false,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_specialist_warnings_specialist_id
    ON specialist_warnings(specialist_id, created_at DESC);
