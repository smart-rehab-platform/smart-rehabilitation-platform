-- Migration 018: allow 'web' platform in user_device_tokens.platform check constraint
-- Idempotent: only drops & recreates constraint if it does not already allow 'web'.

DO $$
BEGIN
  -- Check if the constraint exists and does NOT include 'web'
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'user_device_tokens'
      AND c.conname = 'user_device_tokens_platform_check'
      AND position('web' in pg_get_constraintdef(c.oid)) = 0
  ) THEN
    RAISE NOTICE 'Updating user_device_tokens_platform_check to include web';
    ALTER TABLE user_device_tokens DROP CONSTRAINT user_device_tokens_platform_check;
    ALTER TABLE user_device_tokens
      ADD CONSTRAINT user_device_tokens_platform_check
      CHECK (platform IN ('android', 'ios', 'web'));
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'user_device_tokens'
      AND c.conname = 'user_device_tokens_platform_check'
  ) THEN
    -- Constraint missing entirely: create it
    RAISE NOTICE 'Creating user_device_tokens_platform_check including web';
    ALTER TABLE user_device_tokens
      ADD CONSTRAINT user_device_tokens_platform_check
      CHECK (platform IN ('android', 'ios', 'web'));
  ELSE
    -- Constraint already includes web; do nothing
    RAISE NOTICE 'user_device_tokens_platform_check already allows web; no action';
  END IF;
END$$;
