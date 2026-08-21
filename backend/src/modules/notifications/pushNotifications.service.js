const admin = require("../../config/firebaseAdmin");
const pool = require("../../database/db");

const PERMANENT_TOKEN_ERROR_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

const MULTICAST_LIMIT = 500;

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

const sendPushToUser = async ({ userId, title, body, data } = {}) => {
  if (!userId) {
    return emptyResult(0);
  }

  let tokens = [];

  try {
    const result = await pool.query(
      `SELECT device_token
       FROM user_device_tokens
       WHERE user_id = $1
         AND is_active = TRUE`,
      [userId]
    );
    tokens = result.rows
      .map((row) => row.device_token)
      .filter((token) => typeof token === "string" && token.trim().length > 0);
  } catch (error) {
    console.error("[push] Failed to load device tokens:", error.message);
    return emptyResult(0);
  }

  if (tokens.length === 0) {
    return emptyResult(0);
  }

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

  const fcmData = toFcmData(data);
  if (fcmData) {
    messageBase.data = fcmData;
  }

  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  try {
    for (let index = 0; index < tokens.length; index += MULTICAST_LIMIT) {
      const chunk = tokens.slice(index, index + MULTICAST_LIMIT);
      const chunkResult = await sendToTokenChunk(chunk, messageBase);
      successCount += chunkResult.successCount;
      failureCount += chunkResult.failureCount;
      invalidTokens.push(...chunkResult.invalidTokens);
    }
  } catch (error) {
    console.error("[push] Firebase send failed:", error.message);
    return {
      attempted: tokens.length,
      successCount,
      failureCount: tokens.length - successCount,
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
    attempted: tokens.length,
    successCount,
    failureCount,
    deactivatedTokens,
  };
};

module.exports = {
  sendPushToUser,
};
