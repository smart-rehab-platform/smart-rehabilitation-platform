/**
 * Pure helpers for specialist AI report draft editing before PDF approval.
 * Editable clinical text fields only — metadata is preserved by merge.
 */

const EDITABLE_STRING_FIELDS = Object.freeze([
  "executive_summary",
  "patient_progress_summary",
  "speech_analysis_summary",
  "exercise_adherence_summary",
  "goal_progress_summary",
]);

const EDITABLE_ARRAY_FIELDS = Object.freeze([
  "clinical_insights",
  "risks_or_regressions",
  "recommendations",
  "next_steps",
]);

const ALLOWED_UPDATE_KEYS = new Set([
  ...EDITABLE_STRING_FIELDS,
  ...EDITABLE_ARRAY_FIELDS,
]);

const parseSummaryObject = (summary) => {
  if (summary == null) {
    return {};
  }

  if (typeof summary === "object" && !Array.isArray(summary)) {
    return { ...summary };
  }

  if (typeof summary !== "string") {
    return {};
  }

  const trimmed = summary.trim();
  if (!trimmed) {
    return {};
  }

  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { executive_summary: trimmed };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { executive_summary: trimmed };
    }
    return { ...parsed };
  } catch {
    return { executive_summary: trimmed };
  }
};

const normalizeStringField = (value) => String(value ?? "").trim();

const normalizeStringArrayField = (value) => {
  if (!Array.isArray(value)) {
    if (typeof value === "string") {
      return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
    .filter(Boolean);
};

const extractEditableUpdates = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const updates = {};
  let hasAny = false;

  for (const key of EDITABLE_STRING_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates[key] = normalizeStringField(body[key]);
      hasAny = true;
    }
  }

  for (const key of EDITABLE_ARRAY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates[key] = normalizeStringArrayField(body[key]);
      hasAny = true;
    }
  }

  return hasAny ? updates : null;
};

const hasClinicalContent = (summaryObject) => {
  if (!summaryObject || typeof summaryObject !== "object") {
    return false;
  }

  for (const key of EDITABLE_STRING_FIELDS) {
    if (normalizeStringField(summaryObject[key])) {
      return true;
    }
  }

  for (const key of EDITABLE_ARRAY_FIELDS) {
    if (normalizeStringArrayField(summaryObject[key]).length > 0) {
      return true;
    }
  }

  return false;
};

/**
 * Merges editable clinical fields into an existing AI report summary object.
 * Non-editable metadata keys are preserved.
 */
const mergeAiReportDraftSummary = (currentSummary, updates) => {
  const next = parseSummaryObject(currentSummary);
  const normalizedUpdates = extractEditableUpdates(updates);

  if (!normalizedUpdates) {
    const error = new Error(
      "At least one editable report field is required.",
    );
    error.statusCode = 400;
    throw error;
  }

  Object.assign(next, normalizedUpdates);

  if (!hasClinicalContent(next)) {
    const error = new Error("Report content cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  return next;
};

module.exports = {
  EDITABLE_STRING_FIELDS,
  EDITABLE_ARRAY_FIELDS,
  ALLOWED_UPDATE_KEYS,
  parseSummaryObject,
  extractEditableUpdates,
  hasClinicalContent,
  mergeAiReportDraftSummary,
  normalizeStringField,
  normalizeStringArrayField,
};
