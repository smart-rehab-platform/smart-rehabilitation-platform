-- Expand exercise_categories for a general rehabilitation platform.
-- Safe to re-run: no duplicate names, preserves existing exercise/assignment FKs.

-- ---------------------------------------------------------------------
-- 1) Rename Language → Language Development (by current name; ID-safe)
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM exercise_categories WHERE lower(trim(name)) = 'language'
  ) AND NOT EXISTS (
    SELECT 1 FROM exercise_categories
    WHERE lower(trim(name)) = 'language development'
  ) THEN
    UPDATE exercise_categories
    SET
      name = 'Language Development',
      description = 'Vocabulary, comprehension, and sentence building'
    WHERE lower(trim(name)) = 'language';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 2) Ensure core + expanded taxonomy (idempotent)
-- Fixed UUIDs align with local demo seed conventions where present.
-- ON CONFLICT DO NOTHING covers both id and name unique violations.
-- ---------------------------------------------------------------------
INSERT INTO exercise_categories (id, name, description)
VALUES
  (
    'de000010-0001-4001-8001-000000000001',
    'Speech Articulation',
    'Sound production and pronunciation drills'
  ),
  (
    'de000010-0001-4001-8001-000000000002',
    'Fluency',
    'Pacing, easy onset, and repetition exercises'
  ),
  (
    'de000010-0001-4001-8001-000000000003',
    'Language Development',
    'Vocabulary, comprehension, and sentence building'
  ),
  (
    'de000010-0001-4001-8001-000000000004',
    'Voice & Breathing',
    'Breath support, phonation, and voice control practice'
  ),
  (
    'de000010-0001-4001-8001-000000000005',
    'Fine Motor Skills',
    'Hand strength, grasp, and precise finger movements'
  ),
  (
    'de000010-0001-4001-8001-000000000006',
    'Gross Motor Skills',
    'Balance, coordination, and large-movement practice'
  ),
  (
    'de000010-0001-4001-8001-000000000007',
    'Sensory Integration',
    'Sensory exploration and regulation activities'
  ),
  (
    'de000010-0001-4001-8001-000000000008',
    'Daily Living Skills',
    'Everyday self-care and practical independence tasks'
  ),
  (
    'de000010-0001-4001-8001-000000000009',
    'Motor Rehabilitation',
    'Movement recovery, strengthening, and mobility practice'
  ),
  (
    'de000010-0001-4001-8001-000000000010',
    'Behavioral Skills',
    'Routine following, waiting, and positive choice practice'
  ),
  (
    'de000010-0001-4001-8001-000000000011',
    'Social Communication',
    'Turn-taking, emotion recognition, and interaction skills'
  ),
  (
    'de000010-0001-4001-8001-000000000012',
    'Autism Support',
    'Structured supports for attention, routines, and engagement'
  ),
  (
    'de000010-0001-4001-8001-000000000013',
    'Developmental Activities',
    'Early developmental play and milestone-support activities'
  ),
  (
    'de000010-0001-4001-8001-000000000014',
    'Learning & Cognitive Skills',
    'Memory, sequencing, attention, and problem-solving practice'
  )
ON CONFLICT DO NOTHING;

-- Name-only insert for databases that already have these names under other IDs
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

-- Refresh descriptions for known names (does not change IDs or FKs)
UPDATE exercise_categories SET description = 'Sound production and pronunciation drills'
WHERE name = 'Speech Articulation';
UPDATE exercise_categories SET description = 'Pacing, easy onset, and repetition exercises'
WHERE name = 'Fluency';
UPDATE exercise_categories SET description = 'Vocabulary, comprehension, and sentence building'
WHERE name = 'Language Development';
UPDATE exercise_categories SET description = 'Breath support, phonation, and voice control practice'
WHERE name = 'Voice & Breathing';
UPDATE exercise_categories SET description = 'Hand strength, grasp, and precise finger movements'
WHERE name = 'Fine Motor Skills';
UPDATE exercise_categories SET description = 'Balance, coordination, and large-movement practice'
WHERE name = 'Gross Motor Skills';
UPDATE exercise_categories SET description = 'Sensory exploration and regulation activities'
WHERE name = 'Sensory Integration';
UPDATE exercise_categories SET description = 'Everyday self-care and practical independence tasks'
WHERE name = 'Daily Living Skills';
UPDATE exercise_categories SET description = 'Movement recovery, strengthening, and mobility practice'
WHERE name = 'Motor Rehabilitation';
UPDATE exercise_categories SET description = 'Routine following, waiting, and positive choice practice'
WHERE name = 'Behavioral Skills';
UPDATE exercise_categories SET description = 'Turn-taking, emotion recognition, and interaction skills'
WHERE name = 'Social Communication';
UPDATE exercise_categories SET description = 'Structured supports for attention, routines, and engagement'
WHERE name = 'Autism Support';
UPDATE exercise_categories SET description = 'Early developmental play and milestone-support activities'
WHERE name = 'Developmental Activities';
UPDATE exercise_categories SET description = 'Memory, sequencing, attention, and problem-solving practice'
WHERE name = 'Learning & Cognitive Skills';

-- ---------------------------------------------------------------------
-- 3) Speech Therapy: move clear pronunciation exercises; keep category
-- ---------------------------------------------------------------------
UPDATE exercise_categories
SET description = 'Legacy general speech category (prefer specific speech categories for new exercises)'
WHERE name = 'Speech Therapy';

UPDATE exercises e
SET
  category_id = artic.id,
  updated_at = now()
FROM exercise_categories artic
WHERE artic.name = 'Speech Articulation'
  AND e.category_id IN (
    SELECT id FROM exercise_categories WHERE name = 'Speech Therapy'
  )
  AND (
    lower(e.title) LIKE '%pronunciation%'
    OR lower(e.title) LIKE '%articulation%'
    OR lower(coalesce(e.description, '')) LIKE '%pronunciation%'
  );

-- ---------------------------------------------------------------------
-- 4) Sample exercises for new categories (fixed IDs; safe to re-run)
-- Does not modify existing exercise IDs or assigned_exercises rows.
-- ---------------------------------------------------------------------
INSERT INTO exercises (
  id,
  category_id,
  title,
  description,
  instructions,
  created_by
)
SELECT
  v.id::uuid,
  ec.id,
  v.title,
  v.description,
  v.instructions,
  (
    SELECT u.id
    FROM users u
    WHERE u.role = 'specialist' AND u.is_active = TRUE
    ORDER BY u.created_at ASC NULLS LAST
    LIMIT 1
  )
FROM (
  VALUES
    (
      'de000011-0001-4001-8001-000000000010',
      'Fine Motor Skills',
      'Bead Threading',
      'Practice precise finger movements by threading beads.',
      'Use large beads and a firm string. Thread 8–10 beads slowly. Rest if hands tire.'
    ),
    (
      'de000011-0001-4001-8001-000000000011',
      'Fine Motor Skills',
      'Peg Board Practice',
      'Place and remove pegs to build hand control.',
      'Fill one row of the peg board, then empty it. Repeat for 3–5 minutes.'
    ),
    (
      'de000011-0001-4001-8001-000000000012',
      'Gross Motor Skills',
      'Balance Line Walk',
      'Walk along a straight line to practice balance.',
      'Place a tape line on the floor. Walk heel-to-toe along the line 4 times.'
    ),
    (
      'de000011-0001-4001-8001-000000000013',
      'Gross Motor Skills',
      'Supported Sit-to-Stand',
      'Practice standing up from a seated position with support as needed.',
      'From a sturdy chair, stand up and sit down 5 times. Use hand support if needed.'
    ),
    (
      'de000011-0001-4001-8001-000000000014',
      'Sensory Integration',
      'Texture Exploration',
      'Explore safe textures to support sensory awareness.',
      'Present 3–4 safe textures (soft cloth, sponge, smooth plastic). Touch and describe each.'
    ),
    (
      'de000011-0001-4001-8001-000000000015',
      'Sensory Integration',
      'Calm Breathing Routine',
      'A short breathing routine to support calm regulation.',
      'Inhale slowly for 3 counts, exhale for 4 counts. Repeat 5 cycles while seated.'
    ),
    (
      'de000011-0001-4001-8001-000000000016',
      'Daily Living Skills',
      'Buttoning Practice',
      'Practice fastening large buttons on a practice board or shirt.',
      'Fasten and unfasten 3 large buttons. Offer help only when needed.'
    ),
    (
      'de000011-0001-4001-8001-000000000017',
      'Daily Living Skills',
      'Hand-Washing Sequence',
      'Practice the steps of washing hands independently.',
      'Follow: wet, soap, scrub, rinse, dry. Repeat the full sequence twice.'
    ),
    (
      'de000011-0001-4001-8001-000000000018',
      'Behavioral Skills',
      'Waiting Turn Practice',
      'Practice waiting briefly before taking a turn.',
      'Use a simple game. Wait with a calm signal (count of 5) before each turn.'
    ),
    (
      'de000011-0001-4001-8001-000000000019',
      'Behavioral Skills',
      'Positive Choice Routine',
      'Practice choosing between two acceptable options.',
      'Offer two clear choices (for example, red cup or blue cup). Confirm the choice calmly.'
    ),
    (
      'de000011-0001-4001-8001-000000000020',
      'Social Communication',
      'Emotion Matching',
      'Match facial expressions to everyday emotion words.',
      'Show 4 emotion cards. Name each emotion and match it to a simple situation.'
    ),
    (
      'de000011-0001-4001-8001-000000000021',
      'Social Communication',
      'Conversation Turn-Taking',
      'Practice short back-and-forth conversation turns.',
      'Take 4 turns each answering a simple question (favorite color, food, animal, game).'
    ),
    (
      'de000011-0001-4001-8001-000000000022',
      'Learning & Cognitive Skills',
      'Picture Sequencing',
      'Put picture cards in a logical order.',
      'Arrange 3–4 picture cards into a clear sequence, then retell the steps aloud.'
    ),
    (
      'de000011-0001-4001-8001-000000000023',
      'Learning & Cognitive Skills',
      'Memory Card Matching',
      'Find matching pairs to practice attention and memory.',
      'Play with 6–8 cards. Find all matching pairs. Restart once if helpful.'
    ),
    (
      'de000011-0001-4001-8001-000000000024',
      'Autism Support',
      'Visual Schedule Practice',
      'Follow a short visual schedule for a familiar routine.',
      'Use 3–4 picture steps. Complete each step in order, then mark it as done.'
    ),
    (
      'de000011-0001-4001-8001-000000000025',
      'Autism Support',
      'Joint Attention Activity',
      'Practice shared attention with a preferred object or picture.',
      'Look together at one object. Point, name it, and take turns looking and responding.'
    ),
    (
      'de000011-0001-4001-8001-000000000026',
      'Developmental Activities',
      'Shape Sorting',
      'Sort basic shapes into matching openings or groups.',
      'Sort circle, square, and triangle pieces into matching places. Repeat once.'
    ),
    (
      'de000011-0001-4001-8001-000000000027',
      'Developmental Activities',
      'Following Two-Step Instructions',
      'Practice listening and completing two simple steps.',
      'Give one two-step instruction (for example, pick up the cup and place it on the table). Repeat with 3 different instructions.'
    ),
    (
      'de000011-0001-4001-8001-000000000028',
      'Voice & Breathing',
      'Gentle Breath Support',
      'Practice steady breath support for calm voice use.',
      'Sit upright. Take a comfortable breath and blow gently on a tissue for 3–4 seconds. Repeat 5 times.'
    ),
    (
      'de000011-0001-4001-8001-000000000029',
      'Motor Rehabilitation',
      'Seated Reach and Return',
      'Practice controlled reaching while seated.',
      'From a stable seated position, reach forward to a nearby object and return. Repeat 8 times each side.'
    )
) AS v(id, category_name, title, description, instructions)
JOIN exercise_categories ec ON ec.name = v.category_name
ON CONFLICT (id) DO NOTHING;
