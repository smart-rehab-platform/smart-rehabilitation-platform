const admin = require("../../config/firebaseAdmin");
const pool = require("../../database/db");

const PERMANENT_TOKEN_ERROR_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

const MULTICAST_LIMIT = 500;
const WEB_PLATFORM = "web";
const MOBILE_PLATFORMS = new Set(["android", "ios"]);
// Relative same-origin path only. Absolute FRONTEND_URL hosts break on HTTPS
// Vercel when Railway FRONTEND_URL is still http://localhost:5173 (mixed content).
const WEB_PUSH_NOTIFICATION_ICON_PATH = "/branding/smart_rehab_horizontal_logo.png";

const resolveWebPushNotificationIconUrl = () => WEB_PUSH_NOTIFICATION_ICON_PATH;

const emptyResult = (attempted = 0) => ({
  attempted,
  successCount: 0,
  failureCount: 0,
  deactivatedTokens: [],
});

const maskToken = (token) => {
  if (typeof token !== "string" || token.length === 0) {
    return "[unavailable]";
  }

  if (token.length <= 10) {
    return "***";
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`;
};

const toFcmData = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }

  const converted = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === "string") {
      converted[key] = value;
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      converted[key] = String(value);
      continue;
    }

    try {
      converted[key] = JSON.stringify(value);
    } catch (_error) {
      continue;
    }
  }

  return Object.keys(converted).length > 0 ? converted : undefined;
};

const deactivateTokens = async (tokens) => {
  if (!tokens.length) {
    return [];
  }

  const result = await pool.query(
    `UPDATE user_device_tokens
     SET is_active = FALSE,
         last_seen_at = now()
     WHERE device_token = ANY($1::text[])
       AND is_active = TRUE
     RETURNING device_token`,
    [tokens]
  );

  return result.rows.map((row) => maskToken(row.device_token));
};

const sendToTokenChunk = async (tokens, messageBase) => {
  const response = await admin.messaging().sendEachForMulticast({
    ...messageBase,
    tokens,
  });

  const invalidTokens = [];
  let successCount = 0;
  let failureCount = 0;

  response.responses.forEach((item, index) => {
    if (item.success) {
      successCount += 1;
      return;
    }

    failureCount += 1;
    const code = item.error?.code;
    const tokenPreview = maskToken(tokens[index]);

    if (PERMANENT_TOKEN_ERROR_CODES.has(code)) {
      invalidTokens.push(tokens[index]);
      console.warn(
        `[push] Deactivating invalid FCM token ${tokenPreview} (${code})`
      );
      return;
    }

    console.warn(
      `[push] FCM delivery failed for token ${tokenPreview}${
        code ? ` (${code})` : ""
      }`
    );
  });

  return { successCount, failureCount, invalidTokens };
};

const sendToTokenGroups = async (tokens, messageBase) => {
  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  for (let index = 0; index < tokens.length; index += MULTICAST_LIMIT) {
    const chunk = tokens.slice(index, index + MULTICAST_LIMIT);
    const chunkResult = await sendToTokenChunk(chunk, messageBase);
    successCount += chunkResult.successCount;
    failureCount += chunkResult.failureCount;
    invalidTokens.push(...chunkResult.invalidTokens);
  }

  return { successCount, failureCount, invalidTokens };
};

const buildMobileMessage = ({ title, body, fcmData }) => {
  const messageBase = {
    notification: {
      title: title == null ? "" : String(title),
      body: body == null ? "" : String(body),
    },
    android: {
      priority: "high",
      notification: {
        sound: "default",
      },
    },
  };

  if (fcmData) {
    messageBase.data = fcmData;
  }

  return messageBase;
};

/**
 * Web receives data-only FCM so the service worker is the sole desktop displayer.
 * Title/body live in data (all values must be strings).
 */
const buildWebMessage = ({ title, body, fcmData }) => {
  const data = {
    ...(fcmData || {}),
    title: title == null ? "" : String(title),
    body: body == null ? "" : String(body),
    icon: resolveWebPushNotificationIconUrl(),
  };

  return sanitizeWebPushMessage({
    data: toFcmData(data) || {
      title: title == null ? "" : String(title),
      body: body == null ? "" : String(body),
      icon: resolveWebPushNotificationIconUrl(),
    },
  });
};

const sanitizeWebPushMessage = (message) => {
  if (!message || typeof message !== "object") {
    return message;
  }

  const sanitized = { ...message };
  delete sanitized.notification;

  if (sanitized.webpush && typeof sanitized.webpush === "object") {
    const { notification: _notification, ...webpushRest } = sanitized.webpush;
    sanitized.webpush =
      Object.keys(webpushRest).length > 0 ? webpushRest : undefined;
  }

  return sanitized;
};

const partitionActiveTokens = (rows) => {
  const webTokens = [];
  const mobileTokens = [];

  for (const row of rows) {
    const token =
      typeof row.device_token === "string" ? row.device_token.trim() : "";
    if (!token) {
      continue;
    }

    const platform = String(row.platform || "")
      .trim()
      .toLowerCase();

    if (platform === WEB_PLATFORM) {
      webTokens.push(token);
      continue;
    }

    if (MOBILE_PLATFORMS.has(platform)) {
      mobileTokens.push(token);
    }
  }

  return { webTokens, mobileTokens };
};

const sendPushToUser = async ({ userId, title, body, data } = {}) => {
  if (!userId) {
    return emptyResult(0);
  }

  let rows = [];

  try {
    const result = await pool.query(
      `SELECT device_token, platform
       FROM user_device_tokens
       WHERE user_id = $1
         AND is_active = TRUE`,
      [userId]
    );
    rows = result.rows;
  } catch (error) {
    console.error("[push] Failed to load device tokens:", error.message);
    return emptyResult(0);
  }

  const { webTokens, mobileTokens } = partitionActiveTokens(rows);
  const attempted = webTokens.length + mobileTokens.length;

  if (attempted === 0) {
    return emptyResult(0);
  }

  const fcmData = toFcmData(data);
  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  try {
    if (mobileTokens.length > 0) {
      const mobileResult = await sendToTokenGroups(
        mobileTokens,
        buildMobileMessage({ title, body, fcmData })
      );
      successCount += mobileResult.successCount;
      failureCount += mobileResult.failureCount;
      invalidTokens.push(...mobileResult.invalidTokens);
    }

    if (webTokens.length > 0) {
      const webResult = await sendToTokenGroups(
        webTokens,
        buildWebMessage({ title, body, fcmData })
      );
      successCount += webResult.successCount;
      failureCount += webResult.failureCount;
      invalidTokens.push(...webResult.invalidTokens);
    }
  } catch (error) {
    console.error("[push] Firebase send failed:", error.message);
    return {
      attempted,
      successCount,
      failureCount: attempted - successCount,
      deactivatedTokens: [],
    };
  }

  let deactivatedTokens = [];
  try {
    deactivatedTokens = await deactivateTokens(invalidTokens);
  } catch (error) {
    console.error("[push] Failed to deactivate invalid tokens:", error.message);
  }

  return {
    attempted,
    successCount,
    failureCount,
    deactivatedTokens,
  };
};

module.exports = {
  sendPushToUser,
  // Exported for focused unit tests only
  buildMobileMessage,
  buildWebMessage,
  partitionActiveTokens,
  resolveWebPushNotificationIconUrl,
  sanitizeWebPushMessage,
};
