CREATE TYPE support_request_status AS ENUM (
    'pending',
    'in_progress',
    'resolved'
);

CREATE TYPE support_request_category AS ENUM (
    'technical_issue',
    'patient_case_issue',
    'session_scheduling_issue',
    'account_profile_issue',
    'exercise_content_issue',
    'other'
);

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_request_submitted';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_request_reply';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'support_request_status_changed';

CREATE TABLE support_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        support_request_category NOT NULL,
    subject         VARCHAR(200) NOT NULL,
    status          support_request_status NOT NULL DEFAULT 'pending',
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_request_messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    support_request_id  UUID NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
    sender_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    attachment_url      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_requests_specialist_id
    ON support_requests(specialist_id);

CREATE INDEX idx_support_requests_status
    ON support_requests(status);

CREATE INDEX idx_support_requests_last_message_at
    ON support_requests(last_message_at DESC);

CREATE INDEX idx_support_requests_created_at
    ON support_requests(created_at DESC);

CREATE INDEX idx_support_request_messages_request_id_created_at
    ON support_request_messages(support_request_id, created_at ASC);

CREATE TRIGGER trg_support_requests_updated_at
    BEFORE UPDATE ON support_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
