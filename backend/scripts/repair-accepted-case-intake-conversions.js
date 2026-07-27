/**
 * Repair case intake requests stuck in accepted status without a patient_id.
 * Idempotent: safe to run multiple times for the same request.
 *
 * Usage:
 *   node scripts/repair-accepted-case-intake-conversions.js
 *   node scripts/repair-accepted-case-intake-conversions.js <request-id>
 *   node scripts/repair-accepted-case-intake-conversions.js --child-name bana
 */
require("dotenv").config();

const pool = require("../src/database/db");
const {
  repairAcceptedCaseRequestConversion,
} = require("../src/modules/caseIntake/caseIntake.service");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    requestId: null,
    childName: null,
    all: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--all") {
      options.all = true;
      continue;
    }
    if (arg === "--child-name") {
      options.childName = args[index + 1]?.trim().toLowerCase() || null;
      index += 1;
      continue;
    }
    if (!options.requestId) {
      options.requestId = arg.trim();
    }
  }

  if (!options.requestId && !options.childName && !options.all) {
    options.all = true;
  }

  return options;
};

const loadRepairCandidates = async ({ requestId, childName, all }) => {
  if (requestId) {
    const result = await pool.query(
      `SELECT id, child_name, status, patient_id, assigned_specialist_id
       FROM case_intake_requests
       WHERE id = $1`,
      [requestId]
    );
    return result.rows;
  }

  const filters = ["status = 'accepted'::case_intake_status", "patient_id IS NULL"];
  const params = [];

  if (childName) {
    params.push(`%${childName}%`);
    filters.push(`child_name ILIKE $${params.length}`);
  }

  if (!all && !childName) {
    return [];
  }

  const result = await pool.query(
    `SELECT id, child_name, status, patient_id, assigned_specialist_id
     FROM case_intake_requests
     WHERE ${filters.join(" AND ")}
     ORDER BY accepted_at NULLS LAST, created_at ASC`,
    params
  );

  return result.rows;
};

const printVerification = async (requestId, patientId) => {
  const requestResult = await pool.query(
    `SELECT id, child_name, status, patient_id, accepted_at, converted_at
     FROM case_intake_requests
     WHERE id = $1`,
    [requestId]
  );

  const guardianResult = await pool.query(
    `SELECT patient_id, parent_id, relationship, is_primary_contact
     FROM patient_guardians
     WHERE patient_id = $1`,
    [patientId]
  );

  const specialistResult = await pool.query(
    `SELECT patient_id, specialist_id, is_primary
     FROM patient_specialists
     WHERE patient_id = $1`,
    [patientId]
  );

  console.log("\nVerification:");
  console.log("  request:", requestResult.rows[0]);
  console.log("  guardian:", guardianResult.rows[0] || null);
  console.log("  specialist:", specialistResult.rows[0] || null);
};

(async () => {
  const options = parseArgs();
  const candidates = await loadRepairCandidates(options);

  if (candidates.length === 0) {
    console.log("No eligible accepted-without-patient case requests found.");
    await pool.end();
    return;
  }

  console.log(`Found ${candidates.length} repair candidate(s).`);

  for (const candidate of candidates) {
    console.log(`\nRepairing request ${candidate.id} (${candidate.child_name})...`);

    try {
      const result = await repairAcceptedCaseRequestConversion(candidate.id);
      const patientId = result.patient?.id || result.request?.patient_id;

      console.log(
        result.alreadyConverted
          ? "  Already converted; no changes made."
          : "  Conversion completed."
      );
      console.log("  request id:", candidate.id);
      console.log("  patient id:", patientId);
      console.log("  final status:", result.request?.status);
      console.log("  parent link:", result.parent_link || null);
      console.log("  specialist link:", result.specialist_link || null);

      if (patientId) {
        await printVerification(candidate.id, patientId);
      }
    } catch (error) {
      console.error(
        `  Failed for ${candidate.id}:`,
        error.message || error
      );
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 750));
  await pool.end();
  process.exit(0);
})().catch((error) => {
  console.error("Repair script failed:", error.message || error);
  process.exit(1);
});
