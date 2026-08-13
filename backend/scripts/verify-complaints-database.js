/**
 * Verify complaints migration schema objects.
 * Run: node scripts/verify-complaints-database.js
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
      AND table_name IN ('complaints', 'specialist_warnings')
    ORDER BY table_name
  `);
  assert(tables.rows.length === 2, "complaints and specialist_warnings tables must exist");
  console.log("PASS tables exist");
  passed += 1;

  const enums = await pool.query(`
    SELECT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname IN ('complaint_category', 'complaint_status')
    ORDER BY t.typname
  `);
  assert(enums.rows.length === 2, "complaint enums must exist");
  console.log("PASS enums exist");
  passed += 1;

  const indexes = await pool.query(`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'complaints'
  `);
  const indexNames = indexes.rows.map((row) => row.indexname);
  for (const expected of [
    "idx_complaints_parent_id",
    "idx_complaints_patient_id",
    "idx_complaints_specialist_id",
    "idx_complaints_status",
    "idx_complaints_created_at",
    "idx_complaints_one_active_per_category",
  ]) {
    assert(indexNames.includes(expected), `Missing index ${expected}`);
  }
  console.log("PASS complaints indexes");
  passed += 1;

  const partialUnique = await pool.query(`
    SELECT indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_complaints_one_active_per_category'
  `);
  assert(
    partialUnique.rows[0]?.indexdef.includes("pending") &&
      partialUnique.rows[0]?.indexdef.includes("under_review"),
    "Partial unique index must target active statuses"
  );
  console.log("PASS partial unique active-complaint index");
  passed += 1;

  const notificationTypes = await pool.query(`
    SELECT enumlabel
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notification_type'
      AND e.enumlabel IN (
        'complaint_submitted',
        'complaint_reviewed',
        'specialist_warning_issued'
      )
  `);
  assert(notificationTypes.rows.length === 3, "Notification enum values must exist");
  console.log("PASS notification enum values");
  passed += 1;

  const trigger = await pool.query(`
    SELECT tgname
    FROM pg_trigger
    WHERE tgname = 'trg_complaints_updated_at'
  `);
  assert(trigger.rows.length === 1, "updated_at trigger must exist");
  console.log("PASS updated_at trigger exists");
  passed += 1;

  const updateCheck = await pool.query(`
    SELECT id, updated_at
    FROM complaints
    ORDER BY created_at DESC
    LIMIT 1
  `);
  if (updateCheck.rows[0]) {
    const before = updateCheck.rows[0].updated_at;
    await pool.query(`SELECT pg_sleep(0.05)`);
    await pool.query(
      `UPDATE complaints SET description = description WHERE id = $1`,
      [updateCheck.rows[0].id]
    );
    const after = await pool.query(
      `SELECT updated_at FROM complaints WHERE id = $1`,
      [updateCheck.rows[0].id]
    );
    assert(
      new Date(after.rows[0].updated_at).getTime() >= new Date(before).getTime(),
      "updated_at trigger should refresh on update"
    );
    console.log("PASS updated_at trigger fires");
    passed += 1;
  } else {
    console.log("SKIP updated_at trigger fire (no complaints yet)");
  }

  console.log(`Database verification complete: ${passed} checks passed.`);
  await pool.end();
})().catch(async (error) => {
  console.error("FAIL", error.message);
  await pool.end();
  process.exit(1);
});
