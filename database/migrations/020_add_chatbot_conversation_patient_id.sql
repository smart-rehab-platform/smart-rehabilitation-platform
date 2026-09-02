-- Associate AI chatbot conversations with a specific patient (child).
ALTER TABLE chatbot_conversations
  ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_patient
  ON chatbot_conversations (user_id, patient_id);
