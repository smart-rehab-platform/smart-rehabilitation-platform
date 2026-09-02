/**
 * Family Pattern pool-safety and request-shape tests.
 * Run: node scripts/test-family-patterns-pool-safety.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const servicePath = path.join(
  __dirname,
  "../src/modules/familyPatterns/familyPatterns.service.js"
);

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const serviceSource = fs.readFileSync(servicePath, "utf8");

assert.ok(serviceSource.includes("loadFamilyPatternContextsBatch"));
assert.ok(!/getFamilyPatterns[\s\S]*Promise\.all\([\s\S]*loadPatientPatternContext/.test(serviceSource));
assert.ok(!/loadPatientPatternContext[\s\S]*Promise\.all/.test(serviceSource));
pass("family patterns avoid parallel per-patient context bursts");

assert.ok(serviceSource.includes("WHERE id = ANY($1::uuid[])"));
assert.ok(serviceSource.includes("WHERE patient_id = ANY($1::uuid[])"));
assert.ok(serviceSource.includes("DISTINCT ON (cir.patient_id)"));
pass("family pattern context uses batched sequential pool.query calls");

const dbSource = fs.readFileSync(
  path.join(__dirname, "../src/database/db.js"),
  "utf8"
);
assert.ok(dbSource.includes("isConnectionExhaustedError"));
pass("shared pool exposes connection exhaustion helpers");

const controllerSource = fs.readFileSync(
  path.join(__dirname, "../src/modules/familyPatterns/familyPatterns.controller.js"),
  "utf8"
);
assert.ok(controllerSource.includes("isConnectionExhaustedError"));
assert.ok(controllerSource.includes("503"));
pass("family pattern controller maps exhaustion to HTTP 503");

const webHookSource = fs.readFileSync(
  path.join(
    __dirname,
    "../../frontend_web/src/features/specialist-dashboard/hooks/useSpecialistPatientDetails.js"
  ),
  "utf8"
);
assert.ok(webHookSource.includes("loadFamilyPatternRef"));
assert.ok(!webHookSource.includes("[patientId, specialistUserId, refreshToken, loadFamilyPattern, t]"));
pass("web patient details hook avoids locale-driven duplicate family-pattern loads");

const flutterProviderSource = fs.readFileSync(
  path.join(
    __dirname,
    "../../mobile_app/lib/features/dashboard/providers/specialist_patient_details_provider.dart"
  ),
  "utf8"
);
assert.ok(flutterProviderSource.includes("_initializeFuture"));
assert.ok(flutterProviderSource.includes("_familyPatternFuture"));
pass("flutter specialist patient details deduplicates initialize/family-pattern requests");

console.log(`\n${passed} passed`);
