/**
 * Family Pattern Detection details endpoint tests.
 * Run: node scripts/test-family-patterns-details.js
 */
const assert = require("assert");
const Module = require("module");
const path = require("path");

const servicePath = path.join(
  __dirname,
  "../src/modules/familyPatterns/familyPatterns.service.js"
);
const patientsServicePath = path.join(
  __dirname,
  "../src/modules/patients/patients.service.js"
);
const dbPath = path.join(__dirname, "../src/database/db.js");

const IDS = {
  indexPatient: "11111111-1111-4111-8111-111111111111",
  siblingOne: "22222222-2222-4222-8222-222222222222",
  siblingTwo: "33333333-3333-4333-8333-333333333333",
  siblingHidden: "44444444-4444-4444-8444-444444444444",
  parentLinked: "55555555-5555-4555-8555-555555555555",
  parentOther: "66666666-6666-4666-8666-666666666666",
  specialistAssigned: "77777777-7777-4777-8777-777777777777",
  specialistOther: "88888888-8888-4888-8888-888888888888",
  adminUser: "99999999-9999-4999-8999-999999999999",
  categorySpeech: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
};

const PATIENT_NAMES = {
  [IDS.siblingOne]: "Layla Al-Rashid",
  [IDS.siblingTwo]: "Ahmad Hassan",
  [IDS.siblingHidden]: "Hidden Child"
};

const FORBIDDEN_RESPONSE_KEYS = [
  "date_of_birth",
  "dateOfBirth",
  "gender",
  "family_history",
  "familyHistory",
  "observed_difficulties",
  "observedDifficulties",
  "previous_diagnosis_details",
  "previousDiagnosisDetails",
  "notes",
  "assessments",
  "treatment_plan",
  "treatmentPlan",
  "profile_image_url",
  "profileImageUrl"
];

let passed = 0;

const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const buildBatchDbRows = (normalizedSql, params, loadContextByPatientId) => {
  if (!normalizedSql.includes("ANY($1::uuid[])")) {
    return null;
  }

  const patientIds = params[0];

  if (normalizedSql.includes("FROM patients")) {
    return {
      rows: patientIds.map((id) => ({
        id,
        full_name:
          id === IDS.indexPatient
            ? "Index Child"
            : PATIENT_NAMES[id] || "Sibling Child"
      }))
    };
  }

  if (normalizedSql.includes("FROM diagnoses")) {
    const rows = [];
    for (const id of patientIds) {
      for (const item of loadContextByPatientId[id]?.diagnoses || []) {
        rows.push({
          patient_id: id,
          diagnosis_title: item.diagnosis_title,
          created_at: "2026-01-01T00:00:00.000Z"
        });
      }
    }
    return { rows };
  }

  if (normalizedSql.includes("FROM patient_medical_info")) {
    return {
      rows: patientIds
        .map((id) => {
          const medicalInfo = loadContextByPatientId[id]?.medicalInfo;
          if (!medicalInfo) {
            return null;
          }
          return {
            patient_id: id,
            family_history: medicalInfo.family_history ?? null
          };
        })
        .filter(Boolean)
    };
  }

  if (normalizedSql.includes("FROM case_intake_requests")) {
    return {
      rows: patientIds
        .map((id) => {
          const intake = loadContextByPatientId[id]?.caseIntakeRow;
          if (!intake) {
            return null;
          }
          return { patient_id: id, ...intake };
        })
        .filter(Boolean)
    };
  }

  return null;
};

const loadServiceWithMocks = ({
  siblingRows = [],
  patientExists = true,
  parentLinked = true,
  specialistAssignedToIndex = true,
  specialistAssignedPatientIds = null,
  loadContextByPatientId = {}
}) => {
  const originalLoad = Module._load;
  const assignedPatientIds =
    specialistAssignedPatientIds ||
    (specialistAssignedToIndex ? [IDS.indexPatient] : []);

  const patientsServiceMock = {
    getPatientById: async (id) => {
      if (!patientExists) {
        return null;
      }

      if (id === IDS.indexPatient) {
        return { id: IDS.indexPatient, full_name: "Index Child" };
      }

      return {
        id,
        full_name: PATIENT_NAMES[id] || "Sibling Child"
      };
    },
    getDiagnoses: async (id) => loadContextByPatientId[id]?.diagnoses || [],
    getMedicalInfo: async (id) =>
      loadContextByPatientId[id]?.medicalInfo || { family_history: null }
  };

  Module._load = function mockLoad(request, parent, isMain) {
    const filename = Module._resolveFilename(request, parent, false);

    if (filename === patientsServicePath) {
      return patientsServiceMock;
    }

    if (filename === dbPath) {
      return {
        query: async (sql, params) => {
          const normalizedSql = sql.replace(/\s+/g, " ").trim();

          if (
            normalizedSql.includes("FROM patient_guardians") &&
            normalizedSql.includes("parent_id = $1 AND patient_id = $2")
          ) {
            const [parentId, patientId] = params;
            const linked =
              parentId === IDS.parentLinked && patientId === IDS.indexPatient
                ? parentLinked
                : false;
            return { rows: linked ? [{ exists: 1 }] : [] };
          }

          if (
            normalizedSql.includes("FROM patient_specialists") &&
            normalizedSql.includes("patient_id = $2")
          ) {
            const [specialistId, patientId] = params;
            const assigned =
              specialistId === IDS.specialistAssigned &&
              assignedPatientIds.includes(patientId);
            return { rows: assigned ? [{ exists: 1 }] : [] };
          }

          if (
            normalizedSql.includes("FROM patient_specialists") &&
            normalizedSql.includes("ANY($2::uuid[])")
          ) {
            const [specialistId, patientIds] = params;
            const rows = patientIds
              .filter(
                (patientId) =>
                  specialistId === IDS.specialistAssigned &&
                  assignedPatientIds.includes(patientId)
              )
              .map((patientId) => ({ patient_id: patientId }));
            return { rows };
          }

          if (
            normalizedSql.includes("SELECT DISTINCT p.id") &&
            normalizedSql.includes("pg_sibling")
          ) {
            return { rows: siblingRows };
          }

          const batchRows = buildBatchDbRows(
            normalizedSql,
            params,
            loadContextByPatientId
          );
          if (batchRows) {
            return batchRows;
          }

          return { rows: [] };
        }
      };
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  delete require.cache[servicePath];
  const loadedService = require(servicePath);
  Module._load = originalLoad;
  return loadedService;
};

const sharedContext = {
  [IDS.indexPatient]: {
    diagnoses: [{ diagnosis_title: "Speech and Language Delay" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: {
      category_id: IDS.categorySpeech,
      category_name: "Speech & Language Therapy",
      observed_difficulties: "speech delay, articulation problems",
      previous_diagnosis_details: "prior speech evaluation noted"
    }
  },
  [IDS.siblingOne]: {
    diagnoses: [{ diagnosis_title: "Delayed Speech" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: {
      category_id: IDS.categorySpeech,
      category_name: "Speech & Language Therapy",
      observed_difficulties: "articulation problems, speech delay",
      previous_diagnosis_details: "prior speech evaluation noted"
    }
  },
  [IDS.siblingTwo]: {
    diagnoses: [{ diagnosis_title: "Delayed Speech" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: {
      category_id: IDS.categorySpeech,
      category_name: "Speech & Language Therapy",
      observed_difficulties: "speech delay only",
      previous_diagnosis_details: null
    }
  },
  [IDS.siblingHidden]: {
    diagnoses: [{ diagnosis_title: "Delayed Speech" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: {
      category_id: IDS.categorySpeech,
      category_name: "Speech & Language Therapy",
      observed_difficulties: "speech delay, articulation problems",
      previous_diagnosis_details: null
    }
  }
};

const assertNoForbiddenFields = (payload) => {
  const json = JSON.stringify(payload).toLowerCase();
  for (const key of FORBIDDEN_RESPONSE_KEYS) {
    assert.strictEqual(
      json.includes(`"${key.toLowerCase()}"`),
      false,
      `forbidden field leaked: ${key}`
    );
  }
};

(async () => {
  let service = loadServiceWithMocks({
    siblingRows: [],
    loadContextByPatientId: sharedContext
  });

  const noSiblingDetails = await service.getFamilyPatternDetails(
    IDS.indexPatient,
    { id: IDS.specialistAssigned, role: "specialist" }
  );

  assert.strictEqual(noSiblingDetails.matchedChildren, 0);
  assert.deepStrictEqual(noSiblingDetails.groups, []);
  pass("no siblings returns empty groups");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }],
    loadContextByPatientId: {
      [IDS.indexPatient]: sharedContext[IDS.indexPatient],
      [IDS.siblingOne]: {
        diagnoses: [],
        medicalInfo: { family_history: null },
        caseIntakeRow: null
      }
    }
  });

  const siblingsNoPatterns = await service.getFamilyPatternDetails(
    IDS.indexPatient,
    { id: IDS.specialistAssigned, role: "specialist" }
  );

  assert.strictEqual(siblingsNoPatterns.matchedChildren, 0);
  assert.deepStrictEqual(siblingsNoPatterns.groups, []);
  pass("siblings with no patterns returns empty groups");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }],
    loadContextByPatientId: sharedContext
  });

  let parentDetailsError = null;
  try {
    await service.getFamilyPatternDetails(IDS.indexPatient, {
      id: IDS.parentLinked,
      role: "parent"
    });
  } catch (error) {
    parentDetailsError = error;
  }
  assert.strictEqual(parentDetailsError?.statusCode, 403);
  pass("parent receives 403 on details");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }],
    specialistAssignedToIndex: false,
    loadContextByPatientId: sharedContext
  });

  let unassignedSpecialistError = null;
  try {
    await service.getFamilyPatternDetails(IDS.indexPatient, {
      id: IDS.specialistOther,
      role: "specialist"
    });
  } catch (error) {
    unassignedSpecialistError = error;
  }
  assert.strictEqual(unassignedSpecialistError?.statusCode, 403);
  pass("unassigned specialist receives 403 on details");

  let missingTokenError = null;
  try {
    await service.getFamilyPatternDetails(IDS.indexPatient, null);
  } catch (error) {
    missingTokenError = error;
  }
  assert.strictEqual(missingTokenError?.statusCode, 401);
  pass("missing token receives 401 on details");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }, { id: IDS.siblingTwo }],
    specialistAssignedPatientIds: [
      IDS.indexPatient,
      IDS.siblingOne,
      IDS.siblingTwo
    ],
    loadContextByPatientId: sharedContext
  });

  const adminDetails = await service.getFamilyPatternDetails(IDS.indexPatient, {
    id: IDS.adminUser,
    role: "admin"
  });
  assert.ok(adminDetails.groups.length > 0);
  assert.ok(
    adminDetails.groups.some((group) =>
      group.children.some((child) => child.patientName === "Layla Al-Rashid")
    )
  );
  pass("admin can access details with child names");

  const assignedDetails = await service.getFamilyPatternDetails(
    IDS.indexPatient,
    { id: IDS.specialistAssigned, role: "specialist" }
  );

  assert.strictEqual(
    assignedDetails.patternScore,
    service.calculatePatternScore(
      service.detectPatterns(
        {
          patient: { id: IDS.indexPatient },
          diagnoses: sharedContext[IDS.indexPatient].diagnoses.map((row) => ({
            title: row.diagnosis_title,
            matchKey: service.normalizeDiagnosisTitle(row.diagnosis_title)
          })),
          caseIntake: {
            categoryId: IDS.categorySpeech,
            categoryName: "Speech & Language Therapy",
            categoryMatchKey: service.normalizeText("Speech & Language Therapy"),
            observedDifficulties: "speech delay, articulation problems",
            previousDiagnosisDetails: "prior speech evaluation noted"
          },
          familyHistory: ""
        },
        [
          {
            patient: { id: IDS.siblingOne },
            diagnoses: sharedContext[IDS.siblingOne].diagnoses.map((row) => ({
              title: row.diagnosis_title,
              matchKey: service.normalizeDiagnosisTitle(row.diagnosis_title)
            })),
            caseIntake: {
              categoryId: IDS.categorySpeech,
              categoryName: "Speech & Language Therapy",
              categoryMatchKey: service.normalizeText(
                "Speech & Language Therapy"
              ),
              observedDifficulties: "articulation problems, speech delay",
              previousDiagnosisDetails: "prior speech evaluation noted"
            },
            familyHistory: ""
          },
          {
            patient: { id: IDS.siblingTwo },
            diagnoses: sharedContext[IDS.siblingTwo].diagnoses.map((row) => ({
              title: row.diagnosis_title,
              matchKey: service.normalizeDiagnosisTitle(row.diagnosis_title)
            })),
            caseIntake: {
              categoryId: IDS.categorySpeech,
              categoryName: "Speech & Language Therapy",
              categoryMatchKey: service.normalizeText(
                "Speech & Language Therapy"
              ),
              observedDifficulties: "speech delay only",
              previousDiagnosisDetails: null
            },
            familyHistory: ""
          }
        ]
      )
    )
  );
  assert.ok(assignedDetails.groups.some((group) => group.type === "shared_diagnosis"));
  assert.ok(
    assignedDetails.groups
      .find((group) => group.type === "shared_diagnosis")
      .children.some((child) => child.patientName === "Layla Al-Rashid")
  );
  pass("assigned specialist can access details");

  const summaryResult = await service.getFamilyPatterns(IDS.indexPatient, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });
  assert.strictEqual(JSON.stringify(summaryResult).includes("patientName"), false);
  assert.strictEqual(assignedDetails.patternScore, summaryResult.patternScore);
  assert.strictEqual(assignedDetails.evidenceLevel, summaryResult.evidenceLevel);
  pass("summary endpoint unchanged and score/evidence match details");

  const diagnosisGroup = assignedDetails.groups.find(
    (group) => group.type === "shared_diagnosis"
  );
  assert.ok(diagnosisGroup);
  assert.deepStrictEqual(
    diagnosisGroup.children.map((child) => child.patientId).sort(),
    [IDS.siblingOne, IDS.siblingTwo].sort()
  );
  pass("each child appears only under patterns they matched");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }, { id: IDS.siblingHidden }],
    specialistAssignedPatientIds: [IDS.indexPatient, IDS.siblingOne],
    loadContextByPatientId: sharedContext
  });

  const hiddenDetails = await service.getFamilyPatternDetails(IDS.indexPatient, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });

  assert.strictEqual(hiddenDetails.hiddenMatchedChildrenCount, 1);
  assert.ok(
    hiddenDetails.groups.every((group) =>
      group.children.every((child) => child.patientId !== IDS.siblingHidden)
    )
  );
  assert.ok(
    JSON.stringify(hiddenDetails).includes(PATIENT_NAMES[IDS.siblingHidden]) ===
      false
  );
  pass("unauthorized sibling identities are excluded with hidden count");

  assertNoForbiddenFields(assignedDetails);
  pass("no forbidden medical fields are returned");

  const unknownPatternGroups = service.buildDetailsGroups({
    patterns: [
      {
        type: "future_unknown_rule",
        reason: "Future rule",
        matchedPatients: [{ patientId: IDS.siblingOne }]
      }
    ],
    indexContext: {},
    siblingContextById: new Map([[IDS.siblingOne, { patient: { id: IDS.siblingOne } }]]),
    patientNameById: new Map([[IDS.siblingOne, "Layla Al-Rashid"]]),
    authorizedIds: new Set([IDS.siblingOne])
  });
  assert.strictEqual(unknownPatternGroups.length, 1);
  assert.strictEqual(unknownPatternGroups[0].label, "Repeated Characteristic");
  pass("unknown pattern type does not crash");

  console.log(`\nFamily Pattern Detection details: ${passed} tests passed.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
