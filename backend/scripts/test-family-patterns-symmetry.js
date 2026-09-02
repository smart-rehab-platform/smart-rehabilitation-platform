/**
 * Family Pattern symmetry, authorization visibility, and details rendering tests.
 * Run: node scripts/test-family-patterns-symmetry.js
 */
const assert = require("assert");
const Module = require("module");
const path = require("path");

const servicePath = path.join(
  __dirname,
  "../src/modules/familyPatterns/familyPatterns.service.js"
);
const dbPath = path.join(__dirname, "../src/database/db.js");

const IDS = {
  patientA: "11111111-1111-4111-8111-111111111111",
  patientB: "22222222-2222-4222-8222-222222222222",
  patientC: "33333333-3333-4333-8333-333333333333",
  patientD: "44444444-4444-4444-8444-444444444444",
  patientHidden: "55555555-5555-4555-8555-555555555555",
  parentLinked: "66666666-6666-4666-8666-666666666666",
  specialistAssigned: "77777777-7777-4777-8777-777777777777",
  categorySpeech: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
};

const PATIENT_NAMES = {
  [IDS.patientA]: "Omar Hassan",
  [IDS.patientB]: "Bana Hassan",
  [IDS.patientC]: "Ahmad Hassan",
  [IDS.patientD]: "Layla Hassan",
  [IDS.patientHidden]: "Hidden Child"
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
  patient: { id: patientId, full_name: PATIENT_NAMES[patientId] || "Child" },
  diagnoses: diagnoses.map((title) => ({
    title,
    matchKey: service.normalizeDiagnosisTitle(title)
  })),
  caseIntake,
  familyHistory
});

const buildBatchDbRows = (normalizedSql, params, loadContextByPatientId) => {
  if (!normalizedSql.includes("ANY($1::uuid[])")) {
    return null;
  }

  const patientIds = params[0];

  if (normalizedSql.includes("FROM patients")) {
    return {
      rows: patientIds.map((id) => ({
        id,
        full_name: PATIENT_NAMES[id] || "Child"
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
  siblingMap = {},
  specialistAssignedPatientIds = [],
  loadContextByPatientId = {}
}) => {
  const originalLoad = Module._load;

  Module._load = function mockLoad(request, parent, isMain) {
    const filename = Module._resolveFilename(request, parent, false);

    if (filename === dbPath) {
      return {
        query: async (sql, params) => {
          const normalizedSql = sql.replace(/\s+/g, " ").trim();

          if (
            normalizedSql.includes("FROM patient_guardians") &&
            normalizedSql.includes("parent_id = $1 AND patient_id = $2")
          ) {
            return { rows: [{ exists: 1 }] };
          }

          if (
            normalizedSql.includes("FROM patient_specialists") &&
            normalizedSql.includes("patient_id = $2")
          ) {
            const [specialistId, patientId] = params;
            const assigned =
              specialistId === IDS.specialistAssigned &&
              specialistAssignedPatientIds.includes(patientId);
            return { rows: assigned ? [{ exists: 1 }] : [] };
          }

          if (
            normalizedSql.includes("FROM patient_specialists") &&
            normalizedSql.includes("ANY($2::uuid[])")
          ) {
            const [, patientIds] = params;
            const rows = patientIds
              .filter((patientId) =>
                specialistAssignedPatientIds.includes(patientId)
              )
              .map((patientId) => ({ patient_id: patientId }));
            return { rows };
          }

          if (normalizedSql.includes("SELECT DISTINCT p.id") && normalizedSql.includes("pg_sibling")) {
            const [indexPatientId] = params;
            const siblingRows = (siblingMap[indexPatientId] || []).map((id) => ({ id }));
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

let service = require(servicePath);

const sharedDiagnosisContext = {
  [IDS.patientA]: {
    diagnoses: [{ diagnosis_title: "Speech and Language Delay" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: null
  },
  [IDS.patientB]: {
    diagnoses: [{ diagnosis_title: "Speech and Language Therapy" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: null
  },
  [IDS.patientC]: {
    diagnoses: [{ diagnosis_title: "Delayed Speech" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: null
  },
  [IDS.patientD]: {
    diagnoses: [{ diagnosis_title: "Speech Delay" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: null
  },
  [IDS.patientHidden]: {
    diagnoses: [{ diagnosis_title: "Speech Delay" }],
    medicalInfo: { family_history: null },
    caseIntakeRow: null
  }
};

const siblingMapFour = {
  [IDS.patientA]: [IDS.patientB, IDS.patientC, IDS.patientD],
  [IDS.patientB]: [IDS.patientA, IDS.patientC, IDS.patientD],
  [IDS.patientC]: [IDS.patientA, IDS.patientB, IDS.patientD],
  [IDS.patientD]: [IDS.patientA, IDS.patientB, IDS.patientC]
};

assert.strictEqual(
  service.normalizeDiagnosisTitle("Speech and Language Therapy"),
  "speech language delay"
);
pass("therapy and delay diagnoses normalize to the same canonical key");

const summaryA = service.detectPatterns(
  makeContext({
    patientId: IDS.patientA,
    diagnoses: ["Speech and Language Delay"]
  }),
  [
    makeContext({
      patientId: IDS.patientB,
      diagnoses: ["Speech and Language Therapy"]
    })
  ]
);
const summaryB = service.detectPatterns(
  makeContext({
    patientId: IDS.patientB,
    diagnoses: ["Speech and Language Therapy"]
  }),
  [
    makeContext({
      patientId: IDS.patientA,
      diagnoses: ["Speech and Language Delay"]
    })
  ]
);

assert.ok(summaryA.some((pattern) => pattern.type === "shared_diagnosis"));
assert.ok(summaryB.some((pattern) => pattern.type === "shared_diagnosis"));
assert.deepStrictEqual(
  service.getUniqueMatchedPatientIds(summaryA),
  new Set([IDS.patientB])
);
assert.deepStrictEqual(
  service.getUniqueMatchedPatientIds(summaryB),
  new Set([IDS.patientA])
);
pass("equivalent diagnosis matching is symmetric between two siblings");

for (const patientId of [IDS.patientA, IDS.patientB, IDS.patientC, IDS.patientD]) {
  const siblings = siblingMapFour[patientId]
    .map((id) =>
      makeContext({
        patientId: id,
        diagnoses: sharedDiagnosisContext[id].diagnoses.map((row) => row.diagnosis_title)
      })
    );

  const patterns = service.detectPatterns(
    makeContext({
      patientId,
      diagnoses: sharedDiagnosisContext[patientId].diagnoses.map(
        (row) => row.diagnosis_title
      )
    }),
    siblings
  );

  assert.ok(
    patterns.some((pattern) => pattern.type === "shared_diagnosis"),
    `expected shared diagnosis for ${patientId}`
  );
  assert.strictEqual(
    service.getUniqueMatchedPatientIds(patterns).size,
    3,
    `expected three matched siblings for ${patientId}`
  );
}
pass("four siblings produce symmetric shared-diagnosis matches for each child");

(async () => {
  service = loadServiceWithMocks({
    siblingMap: {
      [IDS.patientA]: [IDS.patientB, IDS.patientHidden]
    },
    specialistAssignedPatientIds: [IDS.patientA, IDS.patientB],
    loadContextByPatientId: sharedDiagnosisContext
  });

  const mixedAuthDetails = await service.getFamilyPatternDetails(IDS.patientA, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });

  assert.strictEqual(mixedAuthDetails.hiddenMatchedChildrenCount, 1);
  assert.ok(mixedAuthDetails.visibleMatchedChildren >= 1);
  assert.ok(
    mixedAuthDetails.groups.some((group) =>
      group.children.some((child) => child.patientName === "Bana Hassan")
    )
  );
  assert.ok(
    JSON.stringify(mixedAuthDetails).includes(PATIENT_NAMES[IDS.patientHidden]) ===
      false
  );
  assert.ok(
    mixedAuthDetails.groups.every((group) => group.children.length > 0)
  );
  pass("authorized visible child renders alongside hidden-match notice");

  service = loadServiceWithMocks({
    siblingMap: {
      [IDS.patientA]: [IDS.patientHidden]
    },
    specialistAssignedPatientIds: [IDS.patientA],
    loadContextByPatientId: sharedDiagnosisContext
  });

  const allHiddenDetails = await service.getFamilyPatternDetails(IDS.patientA, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });

  assert.strictEqual(allHiddenDetails.hiddenMatchedChildrenCount, 1);
  assert.strictEqual(allHiddenDetails.visibleMatchedChildren, 0);
  assert.deepStrictEqual(allHiddenDetails.groups, []);
  assert.ok(
    JSON.stringify(allHiddenDetails).includes(PATIENT_NAMES[IDS.patientHidden]) ===
      false
  );
  pass("all matches unauthorized returns no names and only hidden count");

  service = loadServiceWithMocks({
    siblingMap: siblingMapFour,
    specialistAssignedPatientIds: [
      IDS.patientA,
      IDS.patientB,
      IDS.patientC,
      IDS.patientD
    ],
    loadContextByPatientId: sharedDiagnosisContext
  });

  const detailsA = await service.getFamilyPatternDetails(IDS.patientA, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });
  const detailsB = await service.getFamilyPatternDetails(IDS.patientB, {
    id: IDS.specialistAssigned,
    role: "specialist"
  });

  const visibleNamesA = detailsA.groups.flatMap((group) =>
    group.children.map((child) => child.patientName)
  );
  const visibleNamesB = detailsB.groups.flatMap((group) =>
    group.children.map((child) => child.patientName)
  );

  assert.ok(visibleNamesA.includes("Bana Hassan"));
  assert.ok(visibleNamesA.includes("Ahmad Hassan"));
  assert.ok(visibleNamesB.includes("Omar Hassan"));
  assert.ok(
    detailsA.groups.some(
      (group) =>
        group.type === "shared_diagnosis" &&
        group.children.some(
          (child) =>
            child.patientName === "Bana Hassan" &&
            child.matchedValue === "Speech and Language Therapy"
        )
    )
  );
  assert.ok(
    detailsB.groups.some(
      (group) =>
        group.type === "shared_diagnosis" &&
        group.children.some(
          (child) =>
            child.patientName === "Omar Hassan" &&
            child.matchedValue === "Speech and Language Delay"
        )
    )
  );
  pass("details modal renders authorized child names and matched values symmetrically");

  const mixedCaseInsensitiveAuth = service.buildDetailsGroups({
    patterns: [
      {
        type: "shared_diagnosis",
        reason:
          "Multiple linked children share the same or an equivalent confirmed diagnosis.",
        condition: "Speech and Language Delay",
        matchedPatients: [{ patientId: IDS.patientB.toUpperCase() }]
      }
    ],
    indexContext: makeContext({
      patientId: IDS.patientA,
      diagnoses: ["Speech and Language Delay"]
    }),
    siblingContextById: new Map([
      [
        service.normalizePatientId(IDS.patientB),
        makeContext({
          patientId: IDS.patientB,
          diagnoses: ["Speech and Language Therapy"]
        })
      ]
    ]),
    patientNameById: new Map([
      [service.normalizePatientId(IDS.patientB), "Bana Hassan"]
    ]),
    authorizedIds: new Set([service.normalizePatientId(IDS.patientB)])
  });

  assert.strictEqual(mixedCaseInsensitiveAuth.length, 1);
  assert.strictEqual(mixedCaseInsensitiveAuth[0].children[0].patientName, "Bana Hassan");
  pass("patient id normalization preserves authorized child rendering");

  console.log(`\nFamily Pattern symmetry: ${passed} tests passed.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
