const pool = require("../../database/db");

const ALLOWED_PLATFORMS = new Set(["android", "ios"]);

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const trimToNull = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const registerDeviceToken = async ({
  userId,
  deviceToken,
  platform,
  deviceName,
}) => {
  const trimmedToken = trimToNull(deviceToken);

  if (!trimmedToken) {
    throw createError("A device token is required.", 400);
  }

  const trimmedPlatform = trimToNull(platform);

  if (!trimmedPlatform || !ALLOWED_PLATFORMS.has(trimmedPlatform)) {
    throw createError("Platform must be android or ios.", 400);
  }

  const trimmedDeviceName = trimToNull(deviceName);

  const result = await pool.query(
    `INSERT INTO user_device_tokens
       (user_id, device_token, platform, device_name, is_active, last_seen_at)
     VALUES ($1, $2, $3, $4, TRUE, now())
     ON CONFLICT (device_token) DO UPDATE
     SET user_id = EXCLUDED.user_id,
         platform = EXCLUDED.platform,
         device_name = EXCLUDED.device_name,
         is_active = TRUE,
         last_seen_at = now()
     RETURNING *`,
    [userId, trimmedToken, trimmedPlatform, trimmedDeviceName]
  );

  return result.rows[0];
};

const unregisterDeviceToken = async ({ userId, deviceToken }) => {
  const trimmedToken = trimToNull(deviceToken);

  if (!trimmedToken) {
    throw createError("A device token is required.", 400);
  }

  const result = await pool.query(
    `UPDATE user_device_tokens
     SET is_active = FALSE,
         last_seen_at = now()
     WHERE user_id = $1
       AND device_token = $2
       AND is_active = TRUE
     RETURNING *`,
    [userId, trimmedToken]
  );

  return result.rows[0] || null;
};

module.exports = {
  registerDeviceToken,
  unregisterDeviceToken,
};
