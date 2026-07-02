CREATE TYPE ai_progress_note_type AS ENUM (
    'speech_analysis',
    'clinical_summary',
    'weekly_summary',
    'monthly_summary'
);

CREATE TABLE ai_progress_notes (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id               UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    speech_analysis_id       UUID REFERENCES speech_analyses(id) ON DELETE SET NULL,
    note_type                ai_progress_note_type NOT NULL DEFAULT 'speech_analysis',
    generated_by_ai_provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
    transcript_summary       TEXT,
    improvement_summary      TEXT,
    detected_changes         JSONB,
    clinical_note            TEXT,
    recommended_action       TEXT,
    treatment_analysis       TEXT,
    decision_support         JSONB,
    confidence_score         NUMERIC(4,2),
    raw_ai_output            JSONB,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_progress_notes_patient_id
    ON ai_progress_notes(patient_id);

CREATE INDEX idx_ai_progress_notes_speech_analysis_id
    ON ai_progress_notes(speech_analysis_id);

CREATE INDEX idx_ai_progress_notes_created_at
    ON ai_progress_notes(created_at);
