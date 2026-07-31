/**
 * Family Pattern Detection v1.1 tests.
 * Run: node scripts/test-family-patterns-v1_1.js
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
  parentLinked: "44444444-4444-4444-8444-444444444444",
  parentOther: "55555555-5555-4555-8555-555555555555",
  specialistAssigned: "66666666-6666-4666-8666-666666666666",
  specialistOther: "77777777-7777-4777-8777-777777777777",
  categorySpeech: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  categoryBehavior: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
};

let passed = 0;

const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const makeContext = ({
  patientId,
  diagnoses = [],
  caseIntake = null,
  familyHistory = ""
}) => ({
  patient: { id: patientId },
  diagnoses: diagnoses.map((title) => ({
    title,
    matchKey: service.normalizeDiagnosisTitle(title)
  })),
  caseIntake,
  familyHistory
});

const loadServiceWithMocks = ({
  siblingRows = [],
  patientExists = true,
  parentLinked = true,
  specialistAssigned = true,
  loadContextByPatientId = {}
}) => {
  const originalLoad = Module._load;

  const patientsServiceMock = {
    getPatientById: async (id) =>
      patientExists && id === IDS.indexPatient
        ? { id: IDS.indexPatient, full_name: "Index Child" }
        : patientExists
          ? { id, full_name: "Sibling Child" }
          : null,
    getDiagnoses: async (id) => loadContextByPatientId[id]?.diagnoses || [],
    getMedicalInfo: async (id) =>
      loadContextByPatientId[id]?.medicalInfo || { family_history: null }
  };

  Module._load = function mockLoad(request, parent, isMain) {
    const filename = Module._resolveFilename(request, parent, false);
    const normalizedFilename = filename.replace(/\\/g, "/");

    if (filename === patientsServicePath) {
      return patientsServiceMock;
    }

    if (filename === dbPath) {
      return {
        query: async (sql, params) => {
          const normalizedSql = sql.replace(/\s+/g, " ").trim();

          if (normalizedSql.includes("FROM patient_guardians") && normalizedSql.includes("parent_id = $1 AND patient_id = $2")) {
            const [parentId, patientId] = params;
            const linked =
              parentId === IDS.parentLinked && patientId === IDS.indexPatient
                ? parentLinked
                : false;
            return { rows: linked ? [{ exists: 1 }] : [] };
          }

          if (normalizedSql.includes("FROM patient_specialists")) {
            const [specialistId, patientId] = params;
            const assigned =
              specialistId === IDS.specialistAssigned &&
              patientId === IDS.indexPatient
                ? specialistAssigned
                : false;
            return { rows: assigned ? [{ exists: 1 }] : [] };
          }

          if (normalizedSql.includes("SELECT DISTINCT p.id") && normalizedSql.includes("pg_sibling")) {
            return { rows: siblingRows };
          }

          if (normalizedSql.includes("FROM case_intake_requests")) {
            const [patientId] = params;
            const intake = loadContextByPatientId[patientId]?.caseIntakeRow;
            return { rows: intake ? [intake] : [] };
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

let service = require(servicePath);

// --- Pure helper tests ---
assert.strictEqual(service.normalizeDiagnosisTitle("Speech Delay"), "speech language delay");
assert.strictEqual(service.normalizeDiagnosisTitle("Delayed Speech"), "speech language delay");
assert.strictEqual(service.normalizeDiagnosisTitle("Autism"), "autism spectrum disorder");
assert.strictEqual(service.normalizeDiagnosisTitle("ASD"), "autism spectrum disorder");
assert.strictEqual(service.normalizeDiagnosisTitle("Learning Disability"), "learning difficulties");
pass("diagnosis alias normalization");

assert.deepStrictEqual(
  service.extractMeaningfulKeywords("speech delay, articulation problems"),
  ["speech", "delay", "articulation", "problems"]
);
assert.deepStrictEqual(
  service.extractMeaningfulKeywords("child has speech delay"),
  ["speech", "delay"]
);
assert.deepStrictEqual(
  service.extractMeaningfulKeywords("تأخر نطق وصعوبات لغوية"),
  ["تأخر", "نطق", "وصعوبات", "لغوية"]
);
pass("keyword extraction with English and Arabic text");

assert.deepStrictEqual(
  service.findOverlappingKeywords("speech delay articulation", "articulation speech"),
  ["articulation", "speech"]
);
assert.deepStrictEqual(
  service.findOverlappingKeywords("speech delay", "delay only"),
  []
);
assert.deepStrictEqual(
  service.findOverlappingKeywords("autism traits", "autism observed"),
  ["autism"]
);
pass("keyword overlap requires two meaningful terms unless safe single term");

assert.strictEqual(service.calculatePatternScore([]), 0);
assert.strictEqual(
  service.calculatePatternScore([
    { type: "shared_diagnosis" },
    { type: "shared_case_category" },
    { type: "shared_difficulties" }
  ]),
  95
);
assert.strictEqual(
  service.calculatePatternScore([
    { type: "shared_diagnosis" },
    { type: "shared_case_category" },
    { type: "shared_difficulties" },
    { type: "previous_diagnosis_similarity" },
    { type: "family_history_similarity" }
  ]),
  100
);
pass("pattern score accumulation and cap at 100");

assert.strictEqual(service.calculateEvidenceLevel(0), "LOW");
assert.strictEqual(service.calculateEvidenceLevel(24), "LOW");
assert.strictEqual(service.calculateEvidenceLevel(25), "MODERATE");
assert.strictEqual(service.calculateEvidenceLevel(59), "MODERATE");
assert.strictEqual(service.calculateEvidenceLevel(60), "HIGH");
assert.strictEqual(service.calculateEvidenceLevel(95), "HIGH");
pass("evidence level ranges");

const indexContext = makeContext({
  patientId: IDS.indexPatient,
  diagnoses: ["Speech and Language Delay"],
  caseIntake: {
    categoryId: IDS.categorySpeech,
    categoryName: "Speech & Language Therapy",
    categoryMatchKey: service.normalizeText("Speech & Language Therapy"),
    observedDifficulties: "speech delay, articulation problems",
    previousDiagnosisDetails: ""
  },
  familyHistory: ""
});

const siblingOneContext = makeContext({
  patientId: IDS.siblingOne,
  diagnoses: ["Delayed Speech"],
  caseIntake: {
    categoryId: IDS.categorySpeech,
    categoryName: "Speech & Language Therapy",
    categoryMatchKey: service.normalizeText("Speech & Language Therapy"),
    observedDifficulties: "articulation problems and speech delay",
    previousDiagnosisDetails: ""
  },
  familyHistory: ""
});

const siblingTwoContext = makeContext({
  patientId: IDS.siblingTwo,
  diagnoses: ["Unrelated Condition"],
  caseIntake: {
    categoryId: IDS.categoryBehavior,
    categoryName: "Behavioral Therapy",
    categoryMatchKey: service.normalizeText("Behavioral Therapy"),
    observedDifficulties: "attention issues",
    previousDiagnosisDetails: ""
  },
  familyHistory: ""
});

const detectedPatterns = service.detectPatterns(indexContext, [
  siblingOneContext,
  siblingTwoContext
]);

assert.ok(
  detectedPatterns.some(
    (pattern) =>
      pattern.type === "shared_diagnosis" &&
      pattern.condition === "Speech and Language Delay"
  )
);
const exactDiagnosisPatterns = service.detectPatterns(
  makeContext({
    patientId: IDS.indexPatient,
    diagnoses: ["ADHD"]
  }),
  [
    makeContext({
      patientId: IDS.siblingOne,
      diagnoses: ["ADHD"]
    })
  ]
);
assert.strictEqual(exactDiagnosisPatterns.length, 1);
assert.strictEqual(exactDiagnosisPatterns[0].type, "shared_diagnosis");
assert.ok(detectedPatterns.some((pattern) => pattern.type === "shared_case_category"));
assert.ok(detectedPatterns.some((pattern) => pattern.type === "shared_difficulties"));
assert.strictEqual(service.calculatePatternScore(detectedPatterns), 95);
assert.strictEqual(
  service.calculateEvidenceLevel(service.calculatePatternScore(detectedPatterns)),
  "HIGH"
);
assert.strictEqual(service.getUniqueMatchedPatientIds(detectedPatterns).size, 1);
assert.ok(
  detectedPatterns.every((pattern) =>
    pattern.matchedPatients.every(
      (patient) => patient.patientId && !Object.prototype.hasOwnProperty.call(patient, "patientName")
    )
  )
);
pass("exact and equivalent diagnosis matching");
pass("detectPatterns for diagnosis, category, and difficulties");

const categoryOnlyPatterns = service.detectPatterns(
  makeContext({
    patientId: IDS.indexPatient,
    caseIntake: {
      categoryId: IDS.categorySpeech,
      categoryName: "Speech & Language Therapy",
      categoryMatchKey: service.normalizeText("Speech & Language Therapy"),
      observedDifficulties: "",
      previousDiagnosisDetails: ""
    }
  }),
  [
    makeContext({
      patientId: IDS.siblingOne,
      caseIntake: {
        categoryId: IDS.categorySpeech,
        categoryName: "Speech & Language Therapy",
        categoryMatchKey: service.normalizeText("Speech & Language Therapy"),
        observedDifficulties: "",
        previousDiagnosisDetails: ""
      }
    })
  ]
);

assert.deepStrictEqual(
  categoryOnlyPatterns.map((pattern) => pattern.type),
  ["shared_case_category"]
);
assert.strictEqual(service.calculatePatternScore(categoryOnlyPatterns), 20);
pass("category-only match");

const emptyFieldPatterns = service.detectPatterns(
  makeContext({
    patientId: IDS.indexPatient,
    diagnoses: [],
    caseIntake: null,
    familyHistory: ""
  }),
  [
    makeContext({
      patientId: IDS.siblingOne,
      diagnoses: [],
      caseIntake: null,
      familyHistory: ""
    })
  ]
);
assert.deepStrictEqual(emptyFieldPatterns, []);
pass("empty medical fields do not cause errors");

assert.strictEqual(
  service.buildSummaryReason({
    hasSiblings: false,
    patterns: []
  }),
  "No other patients are linked to the same parent account."
);
assert.strictEqual(
  service.buildSummaryReason({
    hasSiblings: true,
    patterns: []
  }),
  "No repeated clinical characteristics were detected in the available records."
);
assert.strictEqual(
  service.buildSummaryReason({
    hasSiblings: true,
    patterns: detectedPatterns
  }),
  "Multiple children linked to the same parent account share a confirmed diagnosis, the same case category, and similar observed difficulties."
);
pass("summaryReason generation");

(async () => {
  service = loadServiceWithMocks({
    siblingRows: []
  });

  const noSiblingResult = await service.getFamilyPatterns(IDS.indexPatient, {
    id: IDS.parentLinked,
    role: "parent"
  });

  assert.strictEqual(noSiblingResult.hasSiblings, false);
  assert.strictEqual(noSiblingResult.matchedChildren, 0);
  assert.strictEqual(noSiblingResult.patternScore, 0);
  assert.strictEqual(noSiblingResult.evidenceLevel, "LOW");
  assert.deepStrictEqual(noSiblingResult.patterns, []);
  pass("no siblings response shape");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }],
    loadContextByPatientId: {
      [IDS.indexPatient]: {
        diagnoses: [],
        medicalInfo: { family_history: null },
        caseIntakeRow: null
      },
      [IDS.siblingOne]: {
        diagnoses: [],
        medicalInfo: { family_history: null },
        caseIntakeRow: null
      }
    }
  });

  const siblingsNoPatterns = await service.getFamilyPatterns(IDS.indexPatient, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });

  assert.strictEqual(siblingsNoPatterns.hasSiblings, true);
  assert.strictEqual(siblingsNoPatterns.matchedChildren, 0);
  assert.strictEqual(siblingsNoPatterns.patternScore, 0);
  assert.deepStrictEqual(siblingsNoPatterns.patterns, []);
  pass("siblings exist but no patterns");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }],
    parentLinked: false,
    loadContextByPatientId: {
      [IDS.indexPatient]: { diagnoses: [], medicalInfo: {}, caseIntakeRow: null },
      [IDS.siblingOne]: { diagnoses: [], medicalInfo: {}, caseIntakeRow: null }
    }
  });

  let unauthorizedParentError = null;
  try {
    await service.getFamilyPatterns(IDS.indexPatient, {
      id: IDS.parentOther,
      role: "parent"
    });
  } catch (error) {
    unauthorizedParentError = error;
  }

  assert.strictEqual(unauthorizedParentError?.statusCode, 403);
  pass("unauthorized parent is blocked");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }],
    specialistAssigned: false,
    loadContextByPatientId: {
      [IDS.indexPatient]: { diagnoses: [], medicalInfo: {}, caseIntakeRow: null },
      [IDS.siblingOne]: { diagnoses: [], medicalInfo: {}, caseIntakeRow: null }
    }
  });

  let unauthorizedSpecialistError = null;
  try {
    await service.getFamilyPatterns(IDS.indexPatient, {
      id: IDS.specialistOther,
      role: "specialist"
    });
  } catch (error) {
    unauthorizedSpecialistError = error;
  }

  assert.strictEqual(unauthorizedSpecialistError?.statusCode, 403);
  pass("unassigned specialist is blocked");

  service = loadServiceWithMocks({
    siblingRows: [{ id: IDS.siblingOne }, { id: IDS.siblingTwo }],
    loadContextByPatientId: {
      [IDS.indexPatient]: {
        diagnoses: [{ diagnosis_title: "Speech Delay" }],
        medicalInfo: { family_history: null },
        caseIntakeRow: {
          category_id: IDS.categorySpeech,
          category_name: "Speech & Language Therapy",
          observed_difficulties: "speech delay, articulation problems",
          previous_diagnosis_details: null
        }
      },
      [IDS.siblingOne]: {
        diagnoses: [{ diagnosis_title: "Delayed Speech" }],
        medicalInfo: { family_history: null },
        caseIntakeRow: {
          category_id: IDS.categorySpeech,
          category_name: "Speech & Language Therapy",
          observed_difficulties: "articulation problems, speech delay",
          previous_diagnosis_details: null
        }
      },
      [IDS.siblingTwo]: {
        diagnoses: [{ diagnosis_title: "Other Diagnosis" }],
        medicalInfo: { family_history: null },
        caseIntakeRow: {
          category_id: IDS.categoryBehavior,
          category_name: "Behavioral Therapy",
          observed_difficulties: "attention issues only",
          previous_diagnosis_details: null
        }
      }
    }
  });

  const fullResult = await service.getFamilyPatterns(IDS.indexPatient, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });

  assert.strictEqual(fullResult.patternScore, 95);
  assert.strictEqual(fullResult.evidenceLevel, "HIGH");
  assert.strictEqual(fullResult.matchedChildren, 1);
  assert.ok(
    JSON.stringify(fullResult).includes("patientId") === true &&
      JSON.stringify(fullResult).includes("patientName") === false
  );
  assert.ok(
    fullResult.patterns.every(
      (pattern) =>
        typeof pattern.reason === "string" &&
        typeof pattern.weight === "number"
    )
  );
  pass("integrated score 95/HIGH with privacy-safe response");

  console.log(`\nFamily Pattern Detection v1.1: ${passed} tests passed.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
