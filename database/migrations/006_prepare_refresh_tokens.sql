-- Prepare refresh_tokens for hashed refresh token storage (HttpOnly cookie phase 1)
-- Safe to run manually; idempotent for empty or already-migrated databases.

DO $$
BEGIN
  IF to_regclass('public.refresh_tokens') IS NULL THEN
    RAISE NOTICE 'refresh_tokens table does not exist; skipping migration.';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'refresh_tokens'
      AND column_name = 'token'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'refresh_tokens'
      AND column_name = 'token_hash'
  ) THEN
    ALTER TABLE refresh_tokens RENAME COLUMN token TO token_hash;
    RAISE NOTICE 'Renamed refresh_tokens.token to token_hash.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'refresh_tokens_token_key'
      AND conrelid = 'public.refresh_tokens'::regclass
  ) THEN
    ALTER TABLE refresh_tokens
      RENAME CONSTRAINT refresh_tokens_token_key TO refresh_tokens_token_hash_key;
    RAISE NOTICE 'Renamed unique constraint to refresh_tokens_token_hash_key.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'refresh_tokens'
      AND indexname = 'idx_refresh_tokens_token'
  ) THEN
    DROP INDEX public.idx_refresh_tokens_token;
    RAISE NOTICE 'Dropped redundant idx_refresh_tokens_token index.';
  END IF;
END $$;

-- Ensure token_hash stores SHA-256 hex (64 chars) for new writes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'refresh_tokens'
      AND column_name = 'token_hash'
      AND data_type <> 'character varying'
  ) THEN
    ALTER TABLE refresh_tokens
      ALTER COLUMN token_hash TYPE VARCHAR(64);
    RAISE NOTICE 'Set refresh_tokens.token_hash type to VARCHAR(64).';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user
  ON refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
  ON refresh_tokens (expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active_user
  ON refresh_tokens (user_id, expires_at)
  WHERE revoked_at IS NULL;
