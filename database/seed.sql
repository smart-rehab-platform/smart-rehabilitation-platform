INSERT INTO users (full_name, email, password_hash, phone, role, is_email_verified)
VALUES
('Admin User', 'admin@smartrehab.com', '123456', '0599000000', 'admin', true),
('Speech Specialist', 'specialist@smartrehab.com', '123456', '0599111111', 'specialist', true),
('Parent User', 'parent@smartrehab.com', '123456', '0599222222', 'parent', true);

INSERT INTO specialist_profiles (user_id, specialization, license_number, bio, years_of_experience)
SELECT id, 'Speech Therapist', 'SP-1001', 'Speech and language therapy specialist', 5
FROM users
WHERE email = 'specialist@smartrehab.com';

INSERT INTO patients (full_name, date_of_birth, gender, created_by)
SELECT 'Ahmad Ali', '2018-05-10', 'male', id
FROM users
WHERE email = 'parent@smartrehab.com';

-- Exercise categories (general rehabilitation taxonomy; unique on name)
INSERT INTO exercise_categories (name, description)
VALUES
('Speech Articulation', 'Sound production and pronunciation drills'),
('Fluency', 'Pacing, easy onset, and repetition exercises'),
('Language Development', 'Vocabulary, comprehension, and sentence building'),
('Voice & Breathing', 'Breath support, phonation, and voice control practice'),
('Fine Motor Skills', 'Hand strength, grasp, and precise finger movements'),
('Gross Motor Skills', 'Balance, coordination, and large-movement practice'),
('Sensory Integration', 'Sensory exploration and regulation activities'),
('Daily Living Skills', 'Everyday self-care and practical independence tasks'),
('Motor Rehabilitation', 'Movement recovery, strengthening, and mobility practice'),
('Behavioral Skills', 'Routine following, waiting, and positive choice practice'),
('Social Communication', 'Turn-taking, emotion recognition, and interaction skills'),
('Autism Support', 'Structured supports for attention, routines, and engagement'),
('Developmental Activities', 'Early developmental play and milestone-support activities'),
('Learning & Cognitive Skills', 'Memory, sequencing, attention, and problem-solving practice')
ON CONFLICT (name) DO NOTHING;

-- Case intake categories (idempotent; unique on lower(trim(name)))
-- Separate taxonomy from exercise_categories — do not merge.
INSERT INTO case_categories (name, description)
VALUES
(
    'Speech and Language Therapy',
    'Support for speech clarity, language development, and communication skills.'
),
(
    'Behavioral Therapy',
    'Guidance for managing behavior, emotional regulation, and social interaction.'
),
(
    'Occupational Therapy',
    'Help with daily living skills, motor coordination, and sensory processing.'
),
(
    'Learning Difficulties',
    'Support for academic learning challenges and cognitive skill building.'
),
(
    'Autism Support',
    'Specialized support for children on the autism spectrum and related needs.'
),
(
    'Developmental Delay',
    'Early intervention for milestones in speech, motor, and social development.'
),
(
    'Motor Rehabilitation',
    'Recovery and strengthening of movement, balance, and physical function.'
)
ON CONFLICT ((lower(trim(name)))) DO NOTHING;

INSERT INTO exercises (category_id, title, description, instructions, created_by)
SELECT
  ec.id,
  'Pronounce Letter R',
  'Practice pronouncing the letter R clearly',
  'Repeat the sound R for 5 minutes and upload an audio recording.',
  u.id
FROM exercise_categories ec, users u
WHERE ec.name = 'Speech Articulation'
AND u.email = 'specialist@smartrehab.com'
AND NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.title = 'Pronounce Letter R' AND e.category_id = ec.id
);
