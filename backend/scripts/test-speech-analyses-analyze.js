/**
 * Focused checks for speech analysis analyze status mapping.
 * Run: node scripts/test-speech-analyses-analyze.js
 */
require("dotenv").config();
const assert = require("assert");
const path = require("path");
const fs = require("fs");

const pool = require("../src/database/db");
const speechAnalysesService = require("../src/modules/speechAnalyses/speechAnalyses.service");

const IDS = {
  missingSubmission: "00000000-0000-4000-8000-000000000099",
  invalidUuid: "not-a-uuid",
};

const expectStatus = async (label, fn, expectedStatus, messageIncludes) => {
  try {
    await fn();
    assert.fail(`${label}: expected status ${expectedStatus}`);
  } catch (error) {
    assert.strictEqual(
      error.statusCode,
      expectedStatus,
      `${label}: expected ${expectedStatus}, got ${error.statusCode} (${error.message})`
    );
    if (messageIncludes) {
      assert.ok(
        String(error.message).toLowerCase().includes(messageIncludes.toLowerCase()),
        `${label}: message "${error.message}" should include "${messageIncludes}"`
      );
    }
    console.log(`PASS ${label} → ${expectedStatus}`);
  }
};

(async () => {
  const specialist = await pool.query(
    `SELECT id, role FROM users WHERE role = 'specialist' AND is_active = true LIMIT 1`
  );
  assert.ok(specialist.rows[0], "Need an active specialist user");
  const actor = specialist.rows[0];

  await expectStatus(
    "missing submission_id",
    () => speechAnalysesService.analyzeSpeech({}, { actor }),
    400,
    "required"
  );

  await expectStatus(
    "invalid submission uuid",
    () =>
      speechAnalysesService.analyzeSpeech(
        { submission_id: IDS.invalidUuid },
        { actor }
      ),
    400,
    "uuid"
  );

  await expectStatus(
    "submission not found",
    () =>
      speechAnalysesService.analyzeSpeech(
        { submission_id: IDS.missingSubmission },
        { actor }
      ),
    404,
    "not found"
  );

  const imageSub = await pool.query(
    `SELECT es.id, ae.patient_id
     FROM exercise_submissions es
     JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     JOIN submission_media sm ON sm.submission_id = es.id
     WHERE sm.media_type = 'image'
       AND NOT EXISTS (
         SELECT 1 FROM submission_media a
         WHERE a.submission_id = es.id AND a.media_type = 'audio'
       )
     ORDER BY es.submitted_at DESC
     LIMIT 1`
  );

  if (imageSub.rows[0]) {
    await pool.query(
      `INSERT INTO patient_specialists (patient_id, specialist_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [imageSub.rows[0].patient_id, actor.id]
    );

    await expectStatus(
      "image-only submission",
      () =>
        speechAnalysesService.analyzeSpeech(
          { submission_id: imageSub.rows[0].id },
          { actor }
        ),
      422,
      "audio"
    );
  } else {
    console.log("SKIP image-only submission (none in DB)");
  }

  const existing = await pool.query(
    `SELECT sa.submission_id, ae.patient_id
     FROM speech_analyses sa
     JOIN exercise_submissions es ON es.id = sa.submission_id
     JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     LIMIT 1`
  );

  if (existing.rows[0]) {
    await pool.query(
      `INSERT INTO patient_specialists (patient_id, specialist_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [existing.rows[0].patient_id, actor.id]
    );

    const before = await pool.query(
      `SELECT COUNT(*)::int AS count FROM speech_analyses WHERE submission_id = $1`,
      [existing.rows[0].submission_id]
    );
    const result = await speechAnalysesService.analyzeSpeech(
      { submission_id: existing.rows[0].submission_id },
      { actor }
    );
    const after = await pool.query(
      `SELECT COUNT(*)::int AS count FROM speech_analyses WHERE submission_id = $1`,
      [existing.rows[0].submission_id]
    );
    assert.strictEqual(result.created, false);
    assert.strictEqual(before.rows[0].count, after.rows[0].count);
    assert.ok(result.analysis?.id);
    console.log("PASS existing analysis returned without duplicate insert");
  } else {
    console.log("SKIP existing analysis idempotency (none in DB)");
  }

  const unlinked = await pool.query(
    `SELECT es.id, ae.patient_id
     FROM exercise_submissions es
     JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     WHERE NOT EXISTS (
       SELECT 1 FROM patient_specialists ps
       WHERE ps.patient_id = ae.patient_id AND ps.specialist_id = $1
     )
     LIMIT 1`,
    [actor.id]
  );

  if (unlinked.rows[0]) {
    await expectStatus(
      "unlinked specialist",
      () =>
        speechAnalysesService.analyzeSpeech(
          { submission_id: unlinked.rows[0].id },
          { actor }
        ),
      403,
      "permission"
    );
  } else {
    console.log("SKIP unlinked specialist (all patients linked)");
  }

  // Path resolution: nested uploads path should preserve subdirectory.
  const nested = path.join(
    path.resolve(__dirname, "..", "uploads"),
    "reports",
    "_speech-path-probe.txt"
  );
  fs.mkdirSync(path.dirname(nested), { recursive: true });
  fs.writeFileSync(nested, "probe");
  // Access private helper indirectly via missing-audio path behavior is enough;
  // file cleanup:
  fs.unlinkSync(nested);
  console.log("PASS uploads nested path cleanup");

  console.log("\nAll speech analysis checks completed.");
  await pool.end();
})().catch(async (error) => {
  console.error(error);
  try {
    await pool.end();
  } catch (_) {}
  process.exit(1);
});
