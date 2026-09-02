-- =====================================================================
-- DATABASE SCHEMA — Speech & Behavioral Therapy Management Platform
-- PostgreSQL 14+
-- Conventions:
--   * Primary keys: UUID (gen_random_uuid()) — easier for distributed
--     systems, mobile offline sync, and avoids exposing sequential IDs.
--   * snake_case naming, plural table names.
--   * Every table has created_at; mutable tables also have updated_at.
--   * Enums are used instead of free-text strings for fixed value sets.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- enables gen_random_uuid()

-- =====================================================================
-- ENUM TYPES
-- =====================================================================

CREATE TYPE user_role            AS ENUM ('admin', 'specialist', 'parent');
CREATE TYPE relationship_type    AS ENUM ('mother', 'father', 'guardian', 'other');
CREATE TYPE assessment_type      AS ENUM ('initial', 'speech', 'behavioral');
CREATE TYPE goal_term            AS ENUM ('short_term', 'long_term');
CREATE TYPE plan_status          AS ENUM ('active', 'completed', 'archived');
CREATE TYPE exercise_frequency   AS ENUM ('daily', 'weekly', 'one_time');
CREATE TYPE media_type           AS ENUM ('video', 'audio', 'image');
CREATE TYPE submission_status    AS ENUM ('pending', 'reviewed', 'needs_retry');
CREATE TYPE session_status       AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE session_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE session_request_reason AS ENUM (
    'regular_follow_up', 'replacement_cancelled', 'replacement_missed',
    'additional_session', 'consultation', 'other'
);
CREATE TYPE preferred_time_period AS ENUM ('morning', 'afternoon', 'evening', 'flexible');
CREATE TYPE case_intake_status   AS ENUM (
    'pending', 'assigned', 'under_assessment', 'accepted', 'rejected', 'converted_to_patient'
);
CREATE TYPE chatbot_sender       AS ENUM ('user', 'bot');
CREATE TYPE recommendation_type  AS ENUM ('exercise_suggestion', 'plan_adjustment');
CREATE TYPE recommendation_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_type          AS ENUM ('weekly', 'monthly');
CREATE TYPE progress_period      AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE notification_type    AS ENUM (
    'exercise_reminder', 'session_reminder', 'feedback_received',
    'report_ready', 'new_message', 'general', 'session_request',
    'case_request_submitted', 'case_request_assigned', 'case_request_accepted',
    'case_request_rejected', 'case_request_converted',
    'session_updated', 'session_cancelled'
);

-- =====================================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- =====================================================================

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),
    role                user_role NOT NULL,
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    profile_image_url   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_verifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE password_resets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extra fields specific to specialists (kept separate so `users` stays generic)
CREATE TABLE specialist_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization      VARCHAR(150),   -- e.g. 'Speech Therapist', 'Behavioral Therapist'
    license_number      VARCHAR(100),
    bio                 TEXT,
    years_of_experience INT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 2. PATIENT & CASE MANAGEMENT
-- =====================================================================

CREATE TABLE patients (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,
    date_of_birth       DATE NOT NULL,
    gender              VARCHAR(10),
    profile_image_url   TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patient_medical_info (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    medical_history     TEXT,
    allergies           TEXT,
    current_medications TEXT,
    family_history      TEXT,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE diagnoses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    diagnosed_by    UUID NOT NULL REFERENCES users(id),
    diagnosis_title VARCHAR(200) NOT NULL,
    description     TEXT,
    diagnosed_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE specialist_notes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES users(id),
    note          TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Links a patient to one or more parents/guardians (many-to-many)
CREATE TABLE patient_guardians (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    parent_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship       relationship_type NOT NULL DEFAULT 'guardian',
    is_primary_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (patient_id, parent_id)
);

-- Links a patient to one or more specialists (e.g. speech + behavioral specialist)
CREATE TABLE patient_specialists (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_primary    BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (patient_id, specialist_id)
);

-- Audit trail / case history log
CREATE TABLE case_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    changed_by  UUID REFERENCES users(id),
    event_type  VARCHAR(100) NOT NULL,  -- e.g. 'diagnosis_added', 'specialist_assigned'
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Preliminary case intake before an official patient record exists
CREATE TABLE case_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT case_categories_name_not_blank CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX idx_case_categories_name_lower
    ON case_categories (lower(trim(name)));

CREATE INDEX idx_case_categories_active
    ON case_categories (is_active)
    WHERE is_active = TRUE;

-- specialist_id references users.id (not specialist_profiles.id)
CREATE TABLE specialist_case_categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   UUID NOT NULL REFERENCES case_categories(id) ON DELETE RESTRICT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (specialist_id, category_id)
);

CREATE INDEX idx_specialist_case_categories_category
    ON specialist_case_categories (category_id);

-- Conversation link is stored only on conversations.case_request_id
CREATE TABLE case_intake_requests (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id                       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    child_name                      VARCHAR(150) NOT NULL,
    date_of_birth                   DATE NOT NULL,
    gender                          VARCHAR(10),
    child_image_url                 TEXT,
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

-- Backend validation should also check duplicates; names may differ by casing/spacing.
CREATE UNIQUE INDEX idx_case_intake_one_active_per_child
    ON case_intake_requests (parent_id, child_name, date_of_birth)
    WHERE status NOT IN ('rejected', 'converted_to_patient');

CREATE INDEX idx_case_intake_parent_status
    ON case_intake_requests (parent_id, status);

CREATE INDEX idx_case_intake_assigned_specialist_status
    ON case_intake_requests (assigned_specialist_id, status)
    WHERE assigned_specialist_id IS NOT NULL;

CREATE INDEX idx_case_intake_admin_inbox
    ON case_intake_requests (status, submitted_at DESC)
    WHERE status = 'pending';

CREATE INDEX idx_case_intake_category
    ON case_intake_requests (category_id);

CREATE INDEX idx_case_intake_patient
    ON case_intake_requests (patient_id)
    WHERE patient_id IS NOT NULL;

CREATE TABLE case_request_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_request_id UUID NOT NULL REFERENCES case_intake_requests(id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,
    file_type       VARCHAR(50),
    original_name   VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT case_request_attachments_file_url_not_blank
        CHECK (char_length(trim(file_url)) > 0)
);

CREATE INDEX idx_case_request_attachments_request
    ON case_request_attachments (case_request_id);

-- =====================================================================
-- 3. ASSESSMENT SYSTEM
-- =====================================================================

CREATE TABLE assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    specialist_id   UUID NOT NULL REFERENCES users(id),
    type            assessment_type NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Flexible result rows per assessment (criterion + score), keeps the
-- schema generic across initial / speech / behavioral assessment types
CREATE TABLE assessment_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    criterion       VARCHAR(150) NOT NULL,
    score           NUMERIC(5,2),
    result_details  JSONB,             -- free-form extra data per criterion
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 4. TREATMENT PLAN SYSTEM
-- =====================================================================

CREATE TABLE treatment_plans (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id             UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    specialist_id          UUID NOT NULL REFERENCES users(id),
    based_on_assessment_id UUID REFERENCES assessments(id),
    title                  VARCHAR(200) NOT NULL,
    status                 plan_status NOT NULL DEFAULT 'active',
    start_date             DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date               DATE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Partial unique index (one active plan per patient) applied via
-- migrations/007_treatment_plans_one_active.sql when data is clean.

-- Keeps a history every time a plan is edited 
CREATE TABLE treatment_plan_revisions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    edited_by       UUID NOT NULL REFERENCES users(id),
    change_summary  TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    term            goal_term NOT NULL,   -- short_term / long_term
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    target_date     DATE,
    target_value    NUMERIC(6,2),         -- e.g. target score / repetitions
    is_achieved     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tracks goal completion percentage over time 
CREATE TABLE goal_progress (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id                UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    recorded_at            DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_percentage  NUMERIC(5,2) NOT NULL CHECK (completion_percentage BETWEEN 0 AND 100),
    notes                  TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 5. EXERCISE SYSTEM
-- =====================================================================

-- Flat taxonomy for the shared exercise library (not case_categories).
-- Expanded via migrations/006_expand_exercise_categories.sql for general
-- rehab areas: speech/language, OT/motor, behavioral/developmental, learning.
CREATE TABLE exercise_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE exercises (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id             UUID REFERENCES exercise_categories(id),
    title                   VARCHAR(200) NOT NULL,
    description             TEXT,
    instructions            TEXT,
    instruction_media_url   TEXT,         -- demo video/audio for the exercise itself
    language                VARCHAR(2) NOT NULL DEFAULT 'en'
                            CHECK (language IN ('en', 'ar')),
    expected_text           TEXT,
    target_word             VARCHAR(100),
    target_phoneme          VARCHAR(20),
    created_by              UUID REFERENCES users(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- An exercise assigned to a specific patient under a specific plan
CREATE TABLE assigned_exercises (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id  UUID NOT NULL REFERENCES exercises(id),
    plan_id      UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    patient_id   UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    assigned_by  UUID NOT NULL REFERENCES users(id),
    frequency    exercise_frequency NOT NULL DEFAULT 'daily',
    start_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date     DATE,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 6. EXERCISE SUBMISSION
-- =====================================================================

CREATE TABLE exercise_submissions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assigned_exercise_id  UUID NOT NULL REFERENCES assigned_exercises(id) ON DELETE CASCADE,
    submitted_by          UUID NOT NULL REFERENCES users(id),  -- usually the parent
    parent_notes          TEXT,
    status                submission_status NOT NULL DEFAULT 'pending',
    submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One submission can include multiple media files (video + audio + image together)
CREATE TABLE submission_media (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id     UUID NOT NULL REFERENCES exercise_submissions(id) ON DELETE CASCADE,
    media_type        media_type NOT NULL,
    file_url          TEXT NOT NULL,      -- points to Object Storage (S3 / Cloudinary), not stored in DB
    duration_seconds  INT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 7. SPECIALIST REVIEW SYSTEM
-- =====================================================================

CREATE TABLE exercise_reviews (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id        UUID NOT NULL UNIQUE REFERENCES exercise_submissions(id) ON DELETE CASCADE,
    specialist_id        UUID NOT NULL REFERENCES users(id),
    performance_rating   NUMERIC(3,1) CHECK (performance_rating BETWEEN 0 AND 10),
    feedback             TEXT,
    requires_retry       BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 8. PROGRESS TRACKING
-- =====================================================================

-- Pre-aggregated snapshots so dashboards/charts don't need to recompute
-- from raw submissions every time (daily/weekly/monthly rollups)
CREATE TABLE progress_snapshots (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id              UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    period                  progress_period NOT NULL,
    period_start            DATE NOT NULL,
    period_end              DATE NOT NULL,
    exercises_completed     INT NOT NULL DEFAULT 0,
    average_performance     NUMERIC(5,2),
    improvement_percentage  NUMERIC(5,2),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 9. COMMUNICATION SYSTEM
-- =====================================================================

CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID REFERENCES patients(id),   -- nullable for preliminary case conversations
    case_request_id UUID REFERENCES case_intake_requests(id) ON DELETE RESTRICT,
    parent_id       UUID NOT NULL REFERENCES users(id),
    specialist_id   UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (parent_id, specialist_id, patient_id)
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id),
    content         TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE message_attachments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_url    TEXT NOT NULL,
    file_type   VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 10. SESSION MANAGEMENT
-- =====================================================================

CREATE TABLE sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    specialist_id       UUID NOT NULL REFERENCES users(id),
    scheduled_at        TIMESTAMPTZ NOT NULL,
    duration_minutes    INT NOT NULL DEFAULT 45,
    status              session_status NOT NULL DEFAULT 'scheduled',
    location_or_link    VARCHAR(255),     -- physical address or video-call link
    cancellation_reason TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_requests (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id            UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    parent_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason                session_request_reason NOT NULL,
    reason_other_text     TEXT,
    preferred_date        DATE NOT NULL,
    preferred_time_period preferred_time_period NOT NULL,
    notes                 TEXT,
    status                session_request_status NOT NULL DEFAULT 'pending',
    rejection_reason      TEXT,
    approved_session_id   UUID REFERENCES sessions(id) ON DELETE SET NULL,
    reviewed_at           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 11. AI CHATBOT
-- =====================================================================

CREATE TABLE chatbot_conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id  UUID REFERENCES patients(id) ON DELETE SET NULL,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chatbot_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    sender          chatbot_sender NOT NULL,  -- 'user' or 'bot'
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 12. AI RECOMMENDATION SYSTEM
-- =====================================================================

CREATE TABLE ai_recommendations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    related_plan_id  UUID REFERENCES treatment_plans(id),
    type             recommendation_type NOT NULL,
    details          JSONB NOT NULL,        -- e.g. { "suggested_exercise_ids": [...], "reason": "..." }
    status           recommendation_status NOT NULL DEFAULT 'pending',
    reviewed_by      UUID REFERENCES users(id),
    generated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at      TIMESTAMPTZ
);

-- =====================================================================
-- 13. AI REPORT GENERATOR
-- =====================================================================

CREATE TABLE ai_reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type          report_type NOT NULL,
    period_start  DATE NOT NULL,
    period_end    DATE NOT NULL,
    pdf_url       TEXT,
    summary       TEXT,
    generated_by  UUID REFERENCES users(id),
    language      VARCHAR(8) NOT NULL DEFAULT 'en',
    generated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 14. AI SPEECH ANALYSIS ⭐
-- =====================================================================

CREATE TABLE speech_analyses (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id           UUID NOT NULL REFERENCES exercise_submissions(id) ON DELETE CASCADE,
    transcript              TEXT,
    pronunciation_score     NUMERIC(5,2),
    fluency_score           NUMERIC(5,2),
    overall_score           NUMERIC(5,2),
    compared_to_analysis_id UUID REFERENCES speech_analyses(id),  -- self-reference for 
    raw_ai_output           JSONB,          -- full model output, kept for debugging/audit
    expected_text           TEXT,
    word_accuracy_percentage NUMERIC(5,2),
    word_error_details      JSONB,
    speech_timing_metrics   JSONB,
    speech_analysis_quality JSONB,
    speech_phoneme_analysis JSONB,
    analyzed_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 15. NOTIFICATION SYSTEM
-- =====================================================================

CREATE TABLE notifications (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                 notification_type NOT NULL,
    title                VARCHAR(200) NOT NULL,
    body                 TEXT,
    is_read              BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type  VARCHAR(50),   -- e.g. 'session', 'exercise_review', 'ai_report'
    related_entity_id    UUID,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================================
-- 16. ADDITIONAL PROJECT SUPPORT TABLES
-- =====================================================================

-- Extra fields specific to parents/guardians (kept separate so `users` stays generic)
CREATE TABLE parent_profiles (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    relationship_notes TEXT,
    address            TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stores refresh tokens for secure JWT authentication sessions
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resource library for videos, PDFs, articles, and training materials
CREATE TABLE resources (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    file_url      TEXT NOT NULL,
    resource_type VARCHAR(50),        -- e.g. 'video', 'pdf', 'article'
    uploaded_by   UUID REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- General reports generated by specialists/admins, not only AI-generated reports
CREATE TABLE reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    generated_by  UUID REFERENCES users(id),
    report_type   VARCHAR(50) NOT NULL, -- e.g. 'weekly', 'monthly', 'assessment', 'progress'
    title         VARCHAR(200),
    summary       TEXT,
    pdf_url       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System audit logs for admin monitoring and accountability
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(150) NOT NULL,
    entity_name VARCHAR(100),
    entity_id   UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);




-- =====================================================================
-- TRIGGERS: auto-update `updated_at` on row changes
-- =====================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_specialist_profiles_updated_at BEFORE UPDATE ON specialist_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_parent_profiles_updated_at BEFORE UPDATE ON parent_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TRIGGER trg_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_session_requests_updated_at BEFORE UPDATE ON session_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_case_categories_updated_at BEFORE UPDATE ON case_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_case_intake_requests_updated_at BEFORE UPDATE ON case_intake_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- INDEXES — speed up the most common lookups/joins
-- =====================================================================

CREATE INDEX idx_users_role                     ON users(role);
CREATE INDEX idx_patients_created_by            ON patients(created_by);
CREATE INDEX idx_patient_guardians_patient      ON patient_guardians(patient_id);
CREATE INDEX idx_patient_guardians_parent       ON patient_guardians(parent_id);
CREATE INDEX idx_patient_specialists_patient    ON patient_specialists(patient_id);
CREATE INDEX idx_patient_specialists_specialist ON patient_specialists(specialist_id);
CREATE INDEX idx_assessments_patient            ON assessments(patient_id);
CREATE INDEX idx_treatment_plans_patient        ON treatment_plans(patient_id);
CREATE INDEX idx_treatment_plans_status         ON treatment_plans(status);
CREATE INDEX idx_goals_plan                     ON goals(plan_id);
CREATE INDEX idx_assigned_exercises_patient     ON assigned_exercises(patient_id);
CREATE INDEX idx_assigned_exercises_plan        ON assigned_exercises(plan_id);
CREATE INDEX idx_exercise_submissions_assigned  ON exercise_submissions(assigned_exercise_id);
CREATE INDEX idx_exercise_submissions_status    ON exercise_submissions(status);
CREATE INDEX idx_submission_media_submission    ON submission_media(submission_id);
CREATE INDEX idx_messages_conversation          ON messages(conversation_id);
CREATE INDEX idx_conversations_parent           ON conversations(parent_id);
CREATE INDEX idx_conversations_specialist       ON conversations(specialist_id);
CREATE UNIQUE INDEX idx_conversations_case_request_id
    ON conversations(case_request_id)
    WHERE case_request_id IS NOT NULL;
CREATE INDEX idx_sessions_specialist            ON sessions(specialist_id);
CREATE INDEX idx_sessions_patient               ON sessions(patient_id);
CREATE INDEX idx_sessions_scheduled_at          ON sessions(scheduled_at);
CREATE INDEX idx_session_requests_specialist_status ON session_requests(specialist_id, status);
CREATE INDEX idx_session_requests_parent_id     ON session_requests(parent_id);
CREATE INDEX idx_session_requests_patient_id    ON session_requests(patient_id);
CREATE UNIQUE INDEX idx_session_requests_approved_session
    ON session_requests(approved_session_id)
    WHERE approved_session_id IS NOT NULL;
CREATE UNIQUE INDEX idx_session_requests_one_pending
    ON session_requests(patient_id, parent_id, specialist_id)
    WHERE status = 'pending';
CREATE INDEX idx_notifications_user_unread      ON notifications(user_id, is_read);
CREATE UNIQUE INDEX idx_speech_analyses_submission_id_unique
    ON speech_analyses(submission_id);
CREATE INDEX idx_ai_recommendations_patient     ON ai_recommendations(patient_id);
CREATE INDEX idx_progress_snapshots_patient     ON progress_snapshots(patient_id, period);

CREATE INDEX idx_parent_profiles_user          ON parent_profiles(user_id);
CREATE INDEX idx_refresh_tokens_user           ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at     ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_active_user    ON refresh_tokens(user_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_resources_uploaded_by         ON resources(uploaded_by);
CREATE INDEX idx_reports_patient               ON reports(patient_id);
CREATE INDEX idx_reports_generated_by          ON reports(generated_by);
CREATE INDEX idx_audit_logs_user               ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity             ON audit_logs(entity_name, entity_id);
