/**
 * Apply database/migrations/004_create_session_requests.sql to the configured DB.
 * Skips enum types that already exist (e.g. preferred_time_period from migration 005).
 * Run: node scripts/apply-migration-004-session-requests.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/database/db");

const migrationPath = path.resolve(
  __dirname,
  "..",
  "..",
  "database",
  "migrations",
  "004_create_session_requests.sql"
);

(async () => {
  const exists = await pool.query(
    `SELECT to_regclass('public.session_requests') AS reg`
  );
  if (exists.rows[0]?.reg) {
    console.log("session_requests already exists; nothing to apply.");
    await pool.end();
    return;
  }

  const sql = fs.readFileSync(migrationPath, "utf8");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Split on semicolons at statement boundaries (migration has no semicolons in strings).
    const statements = sql
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const statement of statements) {
      const upper = statement.toUpperCase();
      if (upper.startsWith("CREATE TYPE PREFERRED_TIME_PERIOD")) {
        console.log("SKIP preferred_time_period (already present from migration 005)");
        continue;
      }

      try {
        await client.query(statement);
        const preview = statement.replace(/\s+/g, " ").slice(0, 72);
        console.log("OK:", preview);
      } catch (error) {
        if (error.code === "42710" || error.code === "42P07") {
          console.log("SKIP (already exists):", statement.split("\n")[0]);
          continue;
        }
        throw error;
      }
    }

    await client.query("COMMIT");

    const verify = await pool.query(
      `SELECT to_regclass('public.session_requests') AS reg`
    );
    console.log("\nVerified session_requests:", verify.rows[0].reg);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
})().catch((error) => {
  console.error("Migration 004 failed:", error.message);
  process.exit(1);
});
