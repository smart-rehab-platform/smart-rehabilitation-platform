const pool = require("../../database/db");
const patientsService = require("../patients/patients.service");

const DISCLAIMER =
  "This feature identifies repeated characteristics among children linked to the same parent account. It does not diagnose hereditary or genetic conditions.";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const RULE_WEIGHTS = {
  shared_diagnosis: 60,
  shared_case_category: 20,
  shared_difficulties: 15,
  previous_diagnosis_similarity: 10,
  family_history_similarity: 5
};

const PATTERN_REASONS = {
  shared_diagnosis:
    "Multiple linked children share the same or an equivalent confirmed diagnosis.",
  shared_case_category:
    "Multiple linked children were registered under the same case category.",
  shared_difficulties:
    "Similar observed difficulties were recorded for multiple linked children.",
  previous_diagnosis_similarity:
    "Similar previous diagnosis details were recorded for multiple linked children.",
  family_history_similarity:
    "Similar family-history terms were found in multiple linked patient records."
};

const PATTERN_LABELS = {
  shared_diagnosis: "Shared Diagnosis",
  shared_case_category: "Shared Case Category",
  shared_difficulties: "Observed Difficulties",
  previous_diagnosis_similarity: "Previous Diagnosis",
  family_history_similarity: "Family History"
};

const SUMMARY_FRAGMENTS = {
  shared_diagnosis: "a confirmed diagnosis",
  shared_case_category: "the same case category",
  shared_difficulties: "similar observed difficulties",
  previous_diagnosis_similarity: "similar previous diagnosis details",
  family_history_similarity: "similar family-history terms"
};

const SUMMARY_TYPE_ORDER = [
  "shared_diagnosis",
  "shared_case_category",
  "shared_difficulties",
  "previous_diagnosis_similarity",
  "family_history_similarity"
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "being",
  "but",
  "by",
  "case",
  "child",
  "condition",
  "difficulty",
  "for",
  "from",
  "had",
  "has",
  "have",
  "he",
  "her",
  "hers",
  "him",
  "his",
  "history",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "patient",
  "problem",
  "she",
  "that",
  "the",
  "their",
  "them",
  "there",
  "these",
  "they",
  "therapy",
  "this",
  "to",
  "was",
  "were",
  "with",
  "you",
  "your",
  "الطفل",
  "المريض",
  "حالة",
  "مشكلة",
  "مشاكل",
  "صعوبة",
  "صعوبات",
  "عنده",
  "لديه",
  "مع",
  "في",
  "من",
  "على",
  "و"
]);

const SAFE_SINGLE_KEYWORD_TERMS = new Set([
  "adhd",
  "autism",
  "dyslexia",
  "dyspraxia",
  "stuttering",
  "tourette"
]);

const DIAGNOSIS_ALIAS_GROUPS = [
  {
    canonical: "speech language delay",
    variants: [
      "speech delay",
      "delayed speech",
      "speech development delay",
      "speech developmental delay",
      "language delay",
      "speech and language delay"
    ]
  },
  {
    canonical: "autism spectrum disorder",
    variants: ["autism", "autism spectrum disorder", "asd"]
  },
  {
    canonical: "developmental delay",
    variants: [
      "development delay",
      "developmental delay",
      "global developmental delay"
    ]
  },
  {
    canonical: "learning difficulties",
    variants: [
      "learning difficulty",
      "learning difficulties",
      "learning disability"
    ]
  }
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildDiagnosisAliasMap = () => {
  const aliasMap = new Map();

  for (const group of DIAGNOSIS_ALIAS_GROUPS) {
    aliasMap.set(group.canonical, group.canonical);

    for (const variant of group.variants) {
      aliasMap.set(normalizeText(variant), group.canonical);
    }
  }

  return aliasMap;
};

const DIAGNOSIS_ALIAS_MAP = buildDiagnosisAliasMap();

const normalizeComparableText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
};

const normalizeDiagnosisTitle = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  return DIAGNOSIS_ALIAS_MAP.get(normalized) || normalized;
};

const isNumericToken = (token) => /^\d+$/.test(token);

const extractMeaningfulKeywords = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }

  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => !isNumericToken(token));

  return [...new Set(tokens)];
};

const findOverlappingKeywords = (leftText, rightText) => {
  const leftKeywords = new Set(extractMeaningfulKeywords(leftText));
  const rightKeywords = new Set(extractMeaningfulKeywords(rightText));
  const overlap = [];

  for (const keyword of leftKeywords) {
    if (rightKeywords.has(keyword)) {
      overlap.push(keyword);
    }
  }

  overlap.sort();

  if (overlap.length >= 2) {
    return overlap;
  }

  if (overlap.length === 1 && SAFE_SINGLE_KEYWORD_TERMS.has(overlap[0])) {
    return overlap;
  }

  return [];
};

const toMatchedPatient = (patient) => ({
  patientId: patient.id
});

const joinSummaryFragments = (fragments) => {
  if (fragments.length === 0) {
    return "";
  }

  if (fragments.length === 1) {
    return fragments[0];
  }

  if (fragments.length === 2) {
    return `${fragments[0]} and ${fragments[1]}`;
  }

  const head = fragments.slice(0, -1).join(", ");
  const tail = fragments[fragments.length - 1];
  return `${head}, and ${tail}`;
};

const buildSummaryReason = ({ hasSiblings, patterns }) => {
  if (!hasSiblings) {
    return "No other patients are linked to the same parent account.";
  }

  if (!patterns || patterns.length === 0) {
    return "No repeated clinical characteristics were detected in the available records.";
  }

  const triggeredTypes = new Set(patterns.map((pattern) => pattern.type));
  const fragments = SUMMARY_TYPE_ORDER.filter((type) =>
    triggeredTypes.has(type)
  ).map((type) => SUMMARY_FRAGMENTS[type]);

  return `Multiple children linked to the same parent account share ${joinSummaryFragments(fragments)}.`;
};

const calculatePatternScore = (patterns) => {
  const seenTypes = new Set();
  let score = 0;

  for (const pattern of patterns) {
    if (seenTypes.has(pattern.type)) {
      continue;
    }

    score += RULE_WEIGHTS[pattern.type] || 0;
    seenTypes.add(pattern.type);
  }

  return Math.min(score, 100);
};

const calculateEvidenceLevel = (patternScore) => {
  if (patternScore >= 60) {
    return "HIGH";
  }

  if (patternScore >= 25) {
    return "MODERATE";
  }

  return "LOW";
};

const getUniqueMatchedPatientIds = (patterns) => {
  const matchedIds = new Set();

  for (const pattern of patterns) {
    for (const patient of pattern.matchedPatients || []) {
      if (patient.patientId) {
        matchedIds.add(patient.patientId);
      }
    }
  }

  return matchedIds;
};

const isAdmin = (user) => user?.role === "admin";

const isParentLinkedToPatient = async (parentId, patientId) => {
  const result = await pool.query(
    `SELECT 1
     FROM patient_guardians
     WHERE parent_id = $1
       AND patient_id = $2
     LIMIT 1`,
    [parentId, patientId]
  );

  return result.rows.length > 0;
};

const isSpecialistAssignedToPatient = async (specialistId, patientId) => {
  const result = await pool.query(
    `SELECT 1
     FROM patient_specialists
     WHERE specialist_id = $1
       AND patient_id = $2
     LIMIT 1`,
    [specialistId, patientId]
  );

  return result.rows.length > 0;
};

const assertCanAccessPatient = async (patientId, user) => {
  if (!user?.id) {
    throw createError("Authentication required", 401);
  }

  if (isAdmin(user)) {
    return;
  }

  if (user.role === "parent") {
    const linked = await isParentLinkedToPatient(user.id, patientId);
    if (!linked) {
      throw createError("You do not have permission to access this patient.", 403);
    }
    return;
  }

  if (user.role === "specialist") {
    const assigned = await isSpecialistAssignedToPatient(user.id, patientId);
    if (!assigned) {
      throw createError("You do not have permission to access this patient.", 403);
    }
    return;
  }

  throw createError("You do not have permission to access this patient.", 403);
};

const assertCanAccessPatientDetails = async (patientId, user) => {
  if (!user?.id) {
    throw createError("Authentication required", 401);
  }

  if (isAdmin(user)) {
    return;
  }

  if (user.role === "specialist") {
    const assigned = await isSpecialistAssignedToPatient(user.id, patientId);
    if (!assigned) {
      throw createError("You do not have permission to access this patient.", 403);
    }
    return;
  }

  throw createError("You do not have permission to access this patient.", 403);
};

const getAuthorizedPatientIds = async (user, patientIds) => {
  if (!patientIds.length) {
    return new Set();
  }

  if (isAdmin(user)) {
    return new Set(patientIds);
  }

  if (user.role !== "specialist") {
    return new Set();
  }

  const result = await pool.query(
    `SELECT patient_id::text AS patient_id
     FROM patient_specialists
     WHERE specialist_id = $1
       AND patient_id = ANY($2::uuid[])`,
    [user.id, patientIds]
  );

  return new Set(result.rows.map((row) => row.patient_id));
};

const getPatientDisplayName = (patient) => {
  if (!patient) {
    return "Unknown";
  }

  return (
    patient.full_name ||
    patient.fullName ||
    patient.name ||
    "Unknown"
  );
};

const getSiblingDiagnosisMatchValue = (siblingContext, pattern) => {
  const targetKey = normalizeDiagnosisTitle(pattern.condition);
  const match = (siblingContext?.diagnoses || []).find(
    (item) => item.matchKey === targetKey
  );

  return match?.title || pattern.condition || "";
};

const getPairKeywordOverlap = (indexContext, siblingContext, type) => {
  let indexText = "";
  let siblingText = "";

  switch (type) {
    case "shared_difficulties":
      indexText = indexContext.caseIntake?.observedDifficulties || "";
      siblingText = siblingContext?.caseIntake?.observedDifficulties || "";
      break;
    case "previous_diagnosis_similarity":
      indexText = indexContext.caseIntake?.previousDiagnosisDetails || "";
      siblingText = siblingContext?.caseIntake?.previousDiagnosisDetails || "";
      break;
    case "family_history_similarity":
      indexText = indexContext.familyHistory || "";
      siblingText = siblingContext?.familyHistory || "";
      break;
    default:
      return [];
  }

  return findOverlappingKeywords(indexText, siblingText);
};

const buildMatchedChildEntry = ({
  pattern,
  siblingContext,
  indexContext,
  patientId,
  patientName
}) => {
  const entry = {
    patientId,
    patientName
  };

  switch (pattern.type) {
    case "shared_diagnosis":
      entry.matchedValue = getSiblingDiagnosisMatchValue(
        siblingContext,
        pattern
      );
      break;
    case "shared_case_category":
      entry.matchedValue =
        siblingContext?.caseIntake?.categoryName || pattern.category || "";
      break;
    case "shared_difficulties":
    case "previous_diagnosis_similarity":
    case "family_history_similarity":
      entry.matchedKeywords = getPairKeywordOverlap(
        indexContext,
        siblingContext,
        pattern.type
      );
      break;
    default:
      break;
  }

  return entry;
};

const buildDetailsGroups = ({
  patterns,
  indexContext,
  siblingContextById,
  patientNameById,
  authorizedIds
}) => {
  const groups = [];

  for (const pattern of patterns) {
    const children = [];

    for (const matched of pattern.matchedPatients || []) {
      const matchedId = matched.patientId;
      if (!matchedId || !authorizedIds.has(matchedId)) {
        continue;
      }

      const siblingContext = siblingContextById.get(matchedId);
      const patientName = patientNameById.get(matchedId) || "Unknown";

      children.push(
        buildMatchedChildEntry({
          pattern,
          siblingContext,
          indexContext,
          patientId: matchedId,
          patientName
        })
      );
    }

    const group = {
      type: pattern.type,
      label: PATTERN_LABELS[pattern.type] || "Repeated Characteristic",
      reason: pattern.reason || PATTERN_REASONS[pattern.type] || "",
      children
    };

    if (pattern.condition) {
      group.condition = pattern.condition;
    }

    if (pattern.category) {
      group.category = pattern.category;
    }

    if (pattern.overlappingKeywords?.length) {
      group.overlappingKeywords = pattern.overlappingKeywords;
    }

    groups.push(group);
  }

  return groups;
};

const buildDetailsResponse = ({
  patientId,
  hasSiblings,
  patterns = [],
  groups = [],
  hiddenMatchedChildrenCount = 0
}) => {
  const summary = buildEmptyResponse({ hasSiblings, patterns });
  const visibleMatchedChildren = new Set();

  for (const group of groups) {
    for (const child of group.children || []) {
      if (child.patientId) {
        visibleMatchedChildren.add(child.patientId);
      }
    }
  }

  return {
    patientId,
    patternScore: summary.patternScore,
    evidenceLevel: summary.evidenceLevel,
    matchedChildren: summary.matchedChildren,
    visibleMatchedChildren: visibleMatchedChildren.size,
    hiddenMatchedChildrenCount,
    summaryReason: summary.summaryReason,
    groups,
    disclaimer: DISCLAIMER
  };
};

const getSiblingPatients = async (patientId) => {
  const result = await pool.query(
    `SELECT DISTINCT p.id
     FROM patient_guardians pg_self
     JOIN patient_guardians pg_sibling
       ON pg_self.parent_id = pg_sibling.parent_id
     JOIN patients p
       ON p.id = pg_sibling.patient_id
     WHERE pg_self.patient_id = $1
       AND pg_sibling.patient_id <> $1
     ORDER BY p.id ASC`,
    [patientId]
  );

  return result.rows;
};

const getLatestCaseIntakeContext = async (patientId) => {
  const result = await pool.query(
    `SELECT
       cir.category_id,
       cir.observed_difficulties,
       cir.previous_diagnosis_details,
       cc.name AS category_name
     FROM case_intake_requests cir
     JOIN case_categories cc ON cc.id = cir.category_id
     WHERE cir.patient_id = $1
     ORDER BY
       CASE
         WHEN cir.status = 'converted_to_patient'::case_intake_status THEN 0
         ELSE 1
       END ASC,
       cir.converted_at DESC NULLS LAST,
       cir.submitted_at DESC
     LIMIT 1`,
    [patientId]
  );

  return result.rows[0] || null;
};

const categoriesMatch = (indexCategory, siblingCategory) => {
  if (!indexCategory?.categoryId || !siblingCategory?.categoryId) {
    return false;
  }

  if (indexCategory.categoryId === siblingCategory.categoryId) {
    return true;
  }

  return (
    Boolean(indexCategory.categoryMatchKey) &&
    indexCategory.categoryMatchKey === siblingCategory.categoryMatchKey
  );
};

const loadPatientPatternContext = async (patientId) => {
  const [patient, diagnoses, medicalInfo, caseIntake] = await Promise.all([
    patientsService.getPatientById(patientId),
    patientsService.getDiagnoses(patientId),
    patientsService.getMedicalInfo(patientId),
    getLatestCaseIntakeContext(patientId)
  ]);

  return {
    patient,
    diagnoses: diagnoses.map((row) => ({
      title: normalizeComparableText(row.diagnosis_title),
      matchKey: normalizeDiagnosisTitle(row.diagnosis_title)
    })),
    caseIntake: caseIntake
      ? {
          categoryId: caseIntake.category_id,
          categoryName: normalizeComparableText(caseIntake.category_name),
          categoryMatchKey: normalizeText(caseIntake.category_name),
          observedDifficulties: caseIntake.observed_difficulties || "",
          previousDiagnosisDetails: caseIntake.previous_diagnosis_details || ""
        }
      : null,
    familyHistory: medicalInfo?.family_history || ""
  };
};

const detectSharedDiagnosisPatterns = (indexContext, siblingContexts) => {
  const indexDiagnoses = indexContext.diagnoses.filter((item) => item.matchKey);
  if (indexDiagnoses.length === 0) {
    return [];
  }

  const patternsByKey = new Map();

  for (const diagnosis of indexDiagnoses) {
    const matchedPatients = [];

    for (const siblingContext of siblingContexts) {
      const hasMatch = siblingContext.diagnoses.some(
        (item) => item.matchKey === diagnosis.matchKey
      );

      if (hasMatch && siblingContext.patient) {
        matchedPatients.push(toMatchedPatient(siblingContext.patient));
      }
    }

    if (matchedPatients.length === 0) {
      continue;
    }

    const existing = patternsByKey.get(diagnosis.matchKey);
    if (existing) {
      const mergedIds = new Set(
        existing.matchedPatients.map((patient) => patient.patientId)
      );
      for (const patient of matchedPatients) {
        mergedIds.add(patient.patientId);
      }
      existing.matchedPatients = [...mergedIds].map((patientId) => ({
        patientId
      }));
      continue;
    }

    patternsByKey.set(diagnosis.matchKey, {
      type: "shared_diagnosis",
      weight: RULE_WEIGHTS.shared_diagnosis,
      reason: PATTERN_REASONS.shared_diagnosis,
      condition: diagnosis.title,
      matchedPatients
    });
  }

  return [...patternsByKey.values()];
};

const detectSharedCategoryPatterns = (indexContext, siblingContexts) => {
  const indexCategory = indexContext.caseIntake;
  if (!indexCategory?.categoryId) {
    return [];
  }

  const matchedPatients = [];

  for (const siblingContext of siblingContexts) {
    if (
      categoriesMatch(indexCategory, siblingContext.caseIntake) &&
      siblingContext.patient
    ) {
      matchedPatients.push(toMatchedPatient(siblingContext.patient));
    }
  }

  if (matchedPatients.length === 0) {
    return [];
  }

  return [
    {
      type: "shared_case_category",
      weight: RULE_WEIGHTS.shared_case_category,
      reason: PATTERN_REASONS.shared_case_category,
      category: indexCategory.categoryName,
      matchedPatients
    }
  ];
};

const detectKeywordOverlapPatterns = ({
  indexContext,
  siblingContexts,
  field,
  type
}) => {
  const indexText = indexContext[field] || "";
  if (!normalizeComparableText(indexText)) {
    return [];
  }

  const matchedPatients = [];
  const overlappingKeywords = new Set();

  for (const siblingContext of siblingContexts) {
    const siblingText = siblingContext[field] || "";
    const overlap = findOverlappingKeywords(indexText, siblingText);

    if (overlap.length > 0 && siblingContext.patient) {
      matchedPatients.push(toMatchedPatient(siblingContext.patient));
      overlap.forEach((keyword) => overlappingKeywords.add(keyword));
    }
  }

  if (matchedPatients.length === 0) {
    return [];
  }

  return [
    {
      type,
      weight: RULE_WEIGHTS[type],
      reason: PATTERN_REASONS[type],
      overlappingKeywords: Array.from(overlappingKeywords).sort(),
      matchedPatients
    }
  ];
};

const detectPatterns = (indexContext, siblingContexts) => [
  ...detectSharedDiagnosisPatterns(indexContext, siblingContexts),
  ...detectSharedCategoryPatterns(indexContext, siblingContexts),
  ...detectKeywordOverlapPatterns({
    indexContext: {
      ...indexContext,
      observedDifficultiesText: indexContext.caseIntake?.observedDifficulties || ""
    },
    siblingContexts: siblingContexts.map((context) => ({
      ...context,
      observedDifficultiesText: context.caseIntake?.observedDifficulties || ""
    })),
    field: "observedDifficultiesText",
    type: "shared_difficulties"
  }),
  ...detectKeywordOverlapPatterns({
    indexContext: {
      ...indexContext,
      previousDiagnosisText:
        indexContext.caseIntake?.previousDiagnosisDetails || ""
    },
    siblingContexts: siblingContexts.map((context) => ({
      ...context,
      previousDiagnosisText: context.caseIntake?.previousDiagnosisDetails || ""
    })),
    field: "previousDiagnosisText",
    type: "previous_diagnosis_similarity"
  }),
  ...detectKeywordOverlapPatterns({
    indexContext,
    siblingContexts,
    field: "familyHistory",
    type: "family_history_similarity"
  })
];

const buildEmptyResponse = ({ hasSiblings, patterns = [] }) => {
  const patternScore = calculatePatternScore(patterns);

  return {
    hasSiblings,
    matchedChildren: getUniqueMatchedPatientIds(patterns).size,
    patternScore,
    evidenceLevel: calculateEvidenceLevel(patternScore),
    summaryReason: buildSummaryReason({ hasSiblings, patterns }),
    patterns,
    disclaimer: DISCLAIMER
  };
};

const getFamilyPatterns = async (patientId, user) => {
  if (!UUID_RE.test(patientId)) {
    throw createError("Patient id must be a valid UUID", 400);
  }

  await assertCanAccessPatient(patientId, user);

  const indexPatient = await patientsService.getPatientById(patientId);
  if (!indexPatient) {
    return null;
  }

  const siblings = await getSiblingPatients(patientId);
  if (siblings.length === 0) {
    return buildEmptyResponse({ hasSiblings: false });
  }

  const [indexContext, ...siblingContexts] = await Promise.all([
    loadPatientPatternContext(patientId),
    ...siblings.map((sibling) => loadPatientPatternContext(sibling.id))
  ]);

  indexContext.patient = { id: indexPatient.id };
  siblingContexts.forEach((context, index) => {
    context.patient = { id: siblings[index].id };
  });

  const patterns = detectPatterns(indexContext, siblingContexts);

  return buildEmptyResponse({ hasSiblings: true, patterns });
};

const getFamilyPatternDetails = async (patientId, user) => {
  if (!UUID_RE.test(patientId)) {
    throw createError("Patient id must be a valid UUID", 400);
  }

  await assertCanAccessPatientDetails(patientId, user);

  const indexPatient = await patientsService.getPatientById(patientId);
  if (!indexPatient) {
    return null;
  }

  const siblings = await getSiblingPatients(patientId);
  if (siblings.length === 0) {
    return buildDetailsResponse({
      patientId,
      hasSiblings: false
    });
  }

  const [indexContext, ...siblingContexts] = await Promise.all([
    loadPatientPatternContext(patientId),
    ...siblings.map((sibling) => loadPatientPatternContext(sibling.id))
  ]);

  indexContext.patient = indexPatient;
  siblingContexts.forEach((context, index) => {
    context.patient = context.patient || {};
    context.patient.id = siblings[index].id;
  });

  const patterns = detectPatterns(indexContext, siblingContexts);
  if (patterns.length === 0) {
    return buildDetailsResponse({
      patientId,
      hasSiblings: true,
      patterns
    });
  }

  const matchedPatientIds = [...getUniqueMatchedPatientIds(patterns)];
  const authorizedIds = await getAuthorizedPatientIds(user, matchedPatientIds);
  const hiddenMatchedChildrenCount = matchedPatientIds.filter(
    (id) => !authorizedIds.has(id)
  ).length;

  const siblingContextById = new Map();
  siblings.forEach((sibling, index) => {
    siblingContextById.set(sibling.id, siblingContexts[index]);
  });

  const patientNameById = new Map();
  for (const siblingId of matchedPatientIds) {
    const siblingContext = siblingContextById.get(siblingId);
    if (!siblingContext) {
      continue;
    }

    if (!siblingContext.patient?.full_name && !siblingContext.patient?.fullName) {
      siblingContext.patient = await patientsService.getPatientById(siblingId);
    }

    patientNameById.set(siblingId, getPatientDisplayName(siblingContext.patient));
  }

  const groups = buildDetailsGroups({
    patterns,
    indexContext,
    siblingContextById,
    patientNameById,
    authorizedIds
  });

  return buildDetailsResponse({
    patientId,
    hasSiblings: true,
    patterns,
    groups,
    hiddenMatchedChildrenCount
  });
};

module.exports = {
  getFamilyPatterns,
  getFamilyPatternDetails,
  normalizeText,
  normalizeDiagnosisTitle,
  extractMeaningfulKeywords,
  findOverlappingKeywords,
  calculatePatternScore,
  calculateEvidenceLevel,
  buildSummaryReason,
  getUniqueMatchedPatientIds,
  detectPatterns,
  buildEmptyResponse,
  buildDetailsResponse,
  buildDetailsGroups,
  assertCanAccessPatient,
  assertCanAccessPatientDetails,
  getAuthorizedPatientIds,
  RULE_WEIGHTS,
  DISCLAIMER,
  DIAGNOSIS_ALIAS_GROUPS,
  PATTERN_LABELS
};
