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

INSERT INTO exercise_categories (name, description)
VALUES
('Speech', 'Speech and pronunciation exercises'),
('Behavioral', 'Behavioral therapy activities'),
('Cognitive', 'Cognitive skills activities'),
('Occupational', 'Occupational therapy exercises');

INSERT INTO exercises (category_id, title, description, instructions, created_by)
SELECT 
  ec.id,
  'Pronounce Letter R',
  'Practice pronouncing the letter R clearly',
  'Repeat the sound R for 5 minutes and upload an audio recording.',
  u.id
FROM exercise_categories ec, users u
WHERE ec.name = 'Speech'
AND u.email = 'specialist@smartrehab.com';