-- Parent feedback & rating for specialists after treatment completion

CREATE TABLE specialist_feedback (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment           TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (parent_id, patient_id, treatment_plan_id)
);

CREATE INDEX idx_specialist_feedback_specialist_id ON specialist_feedback(specialist_id);
CREATE INDEX idx_specialist_feedback_patient_id ON specialist_feedback(patient_id);
CREATE INDEX idx_specialist_feedback_parent_id ON specialist_feedback(parent_id);
