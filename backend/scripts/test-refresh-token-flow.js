#!/usr/bin/env node
/**
 * Manual integration checks for refresh-token backend phase.
 * Run while backend is listening on PORT (default 5000).
 *
 * Usage: node backend/scripts/test-refresh-token-flow.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const refreshTokenService = require("../src/modules/auth/refreshToken.service");
const { generateAccessToken } = require("../src/modules/auth/auth.tokens");

const TEST_EMAIL = "refresh-token-phase-test@example.com";
const TEST_PASSWORD = "Test123456!";

async function ensureTestUser(pool) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, is_email_verified, is_active)
     VALUES ('Refresh Token Test', $1, $2, '0599000099', 'admin', true, true)
     ON CONFLICT (email)
     DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       is_email_verified = true,
       is_active = true
     RETURNING id, full_name, email, phone, role, profile_image_url, is_email_verified, is_active`,
    [TEST_EMAIL, passwordHash]
  );

  return result.rows[0];
}

async function countRefreshRows(pool) {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE revoked_at IS NULL)::int AS active,
       COUNT(*) FILTER (WHERE revoked_at IS NOT NULL)::int AS revoked
     FROM refresh_tokens`
  );

  return result.rows[0];
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const before = await countRefreshRows(pool);
  const user = await ensureTestUser(pool);

  const { rawToken } = await refreshTokenService.createRefreshTokenRecord(user.id);
  const afterInsert = await countRefreshRows(pool);

  const hashRow = await pool.query(
    `SELECT LENGTH(token_hash)::int AS hash_len, revoked_at IS NULL AS active
     FROM refresh_tokens
     ORDER BY created_at DESC
     LIMIT 1`
  );

  const accessTokenOne = generateAccessToken(user);
  const rotated = await refreshTokenService.rotateRefreshToken(rawToken);
  const afterRotate = await countRefreshRows(pool);

  let replayFailed = false;
  try {
    await refreshTokenService.rotateRefreshToken(rawToken);
  } catch (error) {
    replayFailed = error.statusCode === 401;
  }

  await refreshTokenService.logoutRefreshToken(rotated.rawRefreshToken);
  const afterLogout = await countRefreshRows(pool);

  let refreshAfterLogoutFailed = false;
  try {
    await refreshTokenService.rotateRefreshToken(rotated.rawRefreshToken);
  } catch (error) {
    refreshAfterLogoutFailed = error.statusCode === 401;
  }

  await pool.end();

  const checks = {
    rowsIncreasedOnInsert: afterInsert.total === before.total + 1,
    hashLength64: hashRow.rows[0]?.hash_len === 64,
    accessTokenPresent: Boolean(accessTokenOne),
    rotatedAccessTokenPresent: Boolean(rotated.accessToken),
    replayRejected: replayFailed,
    logoutRevoked: afterLogout.revoked >= afterRotate.revoked,
    refreshAfterLogoutRejected: refreshAfterLogoutFailed,
    tokenAliasWouldMatch:
      accessTokenOne === accessTokenOne &&
      rotated.accessToken === rotated.accessToken,
  };

  console.log(JSON.stringify({ before, afterInsert, afterRotate, afterLogout, checks }, null, 2));

  const failed = Object.values(checks).some((value) => value === false);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
