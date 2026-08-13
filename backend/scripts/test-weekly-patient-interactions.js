/**
 * Weekly patient interactions consistency checks.
 * Run: node scripts/test-weekly-patient-interactions.js
 */
const assert = require("assert");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const {
  normalizeWeekOffset,
  formatWeekLabel,
  getAppTimezone,
  DEFAULT_APP_TIMEZONE,
} = require("../src/utils/appTimezone");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

(() => {
  assert.strictEqual(DEFAULT_APP_TIMEZONE, "Asia/Hebron");
  pass("default timezone is Asia/Hebron");

  assert.strictEqual(normalizeWeekOffset(0), 0);
  assert.strictEqual(normalizeWeekOffset(-1), -1);
  assert.strictEqual(normalizeWeekOffset(-2), -2);
  assert.strictEqual(normalizeWeekOffset(1), 1);
  assert.strictEqual(normalizeWeekOffset("1"), 1);
  assert.strictEqual(normalizeWeekOffset("-1"), -1);
  assert.strictEqual(normalizeWeekOffset(null), 0);
  assert.strictEqual(normalizeWeekOffset(Number.NaN), 0);
  assert.strictEqual(normalizeWeekOffset(-1), normalizeWeekOffset(1) * -1);
  pass("weekOffset keeps sign (1 and -1 are not equivalent)");

  assert.strictEqual(formatWeekLabel(0), "This Week");
  assert.strictEqual(formatWeekLabel(-1), "Last Week");
  assert.strictEqual(formatWeekLabel(-2), "2 Weeks Ago");
  assert.strictEqual(formatWeekLabel(1), "Next Week");
  pass("week labels follow signed weekOffset semantics");
})();

async function runDatabaseChecks() {
  let pool;
  try {
    pool = require("../src/database/db");
  } catch (error) {
    console.log("  ↷ database module unavailable, skipping SQL checks");
    return;
  }

  const timezone = getAppTimezone();

  const weekBoundCases = [
    { offset: 0, label: "current week" },
    { offset: -1, label: "previous week" },
    { offset: -2, label: "two weeks ago" },
    { offset: 1, label: "next week" },
  ];

  for (const testCase of weekBoundCases) {
    const result = await pool.query(
      `
      WITH local_today AS (
        SELECT (now() AT TIME ZONE $2)::date AS today
      )
      SELECT
        (date_trunc('week', today)::date + ($1 * interval '7 days'))::date AS week_start,
        (date_trunc('week', today)::date + ($1 * interval '7 days') + interval '6 days')::date AS week_end
      FROM local_today
      `,
      [testCase.offset, timezone]
    );

    const { week_start: weekStart, week_end: weekEnd } = result.rows[0];
    const daySpan =
      (weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
    assert.strictEqual(daySpan, 6);
    pass(`weekOffset=${testCase.offset} returns a Monday–Sunday span (${testCase.label})`);
  }

  const midnight = await pool.query(
    `
    SELECT
      ($1::timestamptz AT TIME ZONE $2)::date AS local_date,
      ($3::timestamptz AT TIME ZONE $2)::date AS earlier_local_date
    `,
    ["2026-08-05 22:30:00+00", timezone, "2026-08-05 20:30:00+00"]
  );

  assert.notStrictEqual(
    midnight.rows[0].local_date.toISOString(),
    midnight.rows[0].earlier_local_date.toISOString()
  );
  pass("timestamps near midnight group into distinct local dates");

  const dedupe = await pool.query(
    `
    WITH sample_events AS (
      SELECT *
      FROM (
        VALUES
          ('patient-a'::text, DATE '2026-08-04'),
          ('patient-a'::text, DATE '2026-08-04'),
          ('patient-a'::text, DATE '2026-08-05')
      ) AS events(patient_id, activity_day)
    ),
    daily_patients AS (
      SELECT DISTINCT patient_id, activity_day
      FROM sample_events
    ),
    daily_counts AS (
      SELECT activity_day, COUNT(*)::int AS day_count
      FROM daily_patients
      GROUP BY activity_day
    )
    SELECT
      (SELECT day_count FROM daily_counts WHERE activity_day = DATE '2026-08-04') AS day_one,
      (SELECT day_count FROM daily_counts WHERE activity_day = DATE '2026-08-05') AS day_two,
      (SELECT COUNT(DISTINCT patient_id)::int FROM daily_patients) AS week_total
    `
  );

  assert.strictEqual(dedupe.rows[0].day_one, 1);
  assert.strictEqual(dedupe.rows[0].day_two, 1);
  assert.strictEqual(dedupe.rows[0].week_total, 1);
  pass("duplicate same-day activities count once per day and once per week");
}

(async () => {
  console.log("Weekly patient interactions tests\n");

  try {
    await runDatabaseChecks();
  } catch (error) {
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.message.includes("password authentication failed")
    ) {
      console.log("  ↷ database unavailable, skipping SQL checks");
    } else {
      throw error;
    }
  } finally {
    try {
      const pool = require("../src/database/db");
      await pool.end();
    } catch (_) {
      // ignore when db was never loaded
    }
  }

  console.log(`\n${passed} checks passed`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
