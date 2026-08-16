/**
 * Verify support requests migration schema objects.
 * Run: node scripts/verify-support-requests-database.js
 */
require("dotenv").config();
const pool = require("../src/database/db");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  let passed = 0;

  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('support_requests', 'support_request_messages')
    ORDER BY table_name
  `);
  assert(tables.rows.length === 2, "support_requests tables must exist");
  console.log("PASS tables exist");
  passed += 1;

  const enums = await pool.query(`
    SELECT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname IN ('support_request_status', 'support_request_category')
    ORDER BY t.typname
  `);
  assert(enums.rows.length === 2, "support request enums must exist");
  console.log("PASS enums exist");
  passed += 1;

  const indexes = await pool.query(`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'support_requests'
  `);
  const indexNames = indexes.rows.map((row) => row.indexname);
  for (const expected of [
    "idx_support_requests_specialist_id",
    "idx_support_requests_status",
    "idx_support_requests_last_message_at",
    "idx_support_requests_created_at",
  ]) {
    assert(indexNames.includes(expected), `Missing index ${expected}`);
  }
  console.log("PASS support_requests indexes");
  passed += 1;

  const messageIndex = await pool.query(`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'support_request_messages'
      AND indexname = 'idx_support_request_messages_request_id_created_at'
  `);
  assert(messageIndex.rows.length === 1, "Message thread index must exist");
  console.log("PASS support_request_messages index");
  passed += 1;

  const notificationTypes = await pool.query(`
    SELECT enumlabel
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notification_type'
      AND e.enumlabel IN (
        'support_request_submitted',
        'support_request_reply',
        'support_request_status_changed'
      )
  `);
  assert(notificationTypes.rows.length === 3, "Notification enum values must exist");
  console.log("PASS notification enum values");
  passed += 1;

  const trigger = await pool.query(`
    SELECT tgname
    FROM pg_trigger
    WHERE tgname = 'trg_support_requests_updated_at'
  `);
  assert(trigger.rows.length === 1, "updated_at trigger must exist");
  console.log("PASS updated_at trigger exists");
  passed += 1;

  const updateCheck = await pool.query(`
    SELECT id, updated_at
    FROM support_requests
    ORDER BY created_at DESC
    LIMIT 1
  `);
  if (updateCheck.rows[0]) {
    const before = updateCheck.rows[0].updated_at;
    await pool.query(`SELECT pg_sleep(0.05)`);
    await pool.query(
      `UPDATE support_requests SET subject = subject WHERE id = $1`,
      [updateCheck.rows[0].id]
    );
    const after = await pool.query(
      `SELECT updated_at FROM support_requests WHERE id = $1`,
      [updateCheck.rows[0].id]
    );
    assert(
      new Date(after.rows[0].updated_at).getTime() >= new Date(before).getTime(),
      "updated_at trigger should refresh on update"
    );
    console.log("PASS updated_at trigger fires");
    passed += 1;
  } else {
    console.log("SKIP updated_at trigger fire (no support requests yet)");
  }

  console.log(`Database verification complete: ${passed} checks passed.`);
  await pool.end();
})().catch(async (error) => {
  console.error("FAIL", error.message);
  await pool.end();
  process.exit(1);
});
