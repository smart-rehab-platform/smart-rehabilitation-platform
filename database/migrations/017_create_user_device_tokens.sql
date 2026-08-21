CREATE TABLE user_device_tokens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token  TEXT NOT NULL,
    platform      VARCHAR(20) NOT NULL,
    device_name   VARCHAR(150),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_device_tokens_platform_check
        CHECK (platform IN ('android', 'ios')),
    CONSTRAINT user_device_tokens_device_token_key
        UNIQUE (device_token)
);

CREATE INDEX idx_user_device_tokens_user_id
    ON user_device_tokens (user_id);

CREATE INDEX idx_user_device_tokens_user_id_is_active
    ON user_device_tokens (user_id, is_active);

CREATE INDEX idx_user_device_tokens_device_token
    ON user_device_tokens (device_token);

CREATE TRIGGER trg_user_device_tokens_updated_at
    BEFORE UPDATE ON user_device_tokens
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE user_device_tokens IS
    'Registered mobile devices for a user. One user may have multiple devices. Tokens are used for Firebase Cloud Messaging push delivery. Inactive or expired tokens can be disabled without deleting history.';

COMMENT ON COLUMN user_device_tokens.device_token IS
    'Unique FCM registration token for a single device.';

COMMENT ON COLUMN user_device_tokens.is_active IS
    'When false, the token is disabled for push delivery but retained for history.';
