/**
 * Pure helpers for specialist AI recommendation draft editing before assign/reject.
 * Editable clinical content fields only — metadata is preserved by merge.
 */

const EDITABLE_STRING_FIELDS = Object.freeze([
  "clinical_analysis",
  "clinical_reasoning",
]);

const EDITABLE_ARRAY_FIELDS = Object.freeze([
  "treatment_plan_adjustments",
]);

const EDITABLE_EXERCISE_FIELD = "suggested_exercises";

const ALLOWED_UPDATE_KEYS = new Set([
  ...EDITABLE_STRING_FIELDS,
  ...EDITABLE_ARRAY_FIELDS,
  EDITABLE_EXERCISE_FIELD,
]);

const parseDetailsObject = (details) => {
  if (details == null) {
    return {};
  }

  if (typeof details === "object" && !Array.isArray(details)) {
    return { ...details };
  }

  if (typeof details !== "string") {
    return {};
  }

  const trimmed = details.trim();
  if (!trimmed) {
    return {};
  }

  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { clinical_reasoning: trimmed, reason: trimmed };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { clinical_reasoning: trimmed, reason: trimmed };
    }
    return { ...parsed };
  } catch {
    return { clinical_reasoning: trimmed, reason: trimmed };
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

const normalizeSuggestedExercise = (item) => {
  if (item == null) {
    return null;
  }

  if (typeof item === "string") {
    const text = item.trim();
    if (!text) {
      return null;
    }

    const separatorMatch = text.match(/\s+[—–-]\s+/);
    if (separatorMatch) {
      const index = text.search(/\s+[—–-]\s+/);
      const title = text.slice(0, index).trim();
      const reason = text.slice(index + separatorMatch[0].length).trim();
      return {
        exercise_id: null,
        title: title || text,
        reason: reason || null,
      };
    }

    return {
      exercise_id: null,
      title: text,
      reason: null,
    };
  }

  if (typeof item !== "object" || Array.isArray(item)) {
    return null;
  }

  const title = normalizeStringField(item.title ?? item.name);
  const reason = normalizeStringField(item.reason ?? item.summary);
  const exerciseIdRaw = item.exercise_id ?? item.exerciseId ?? item.id;
  const exerciseId =
    exerciseIdRaw == null || exerciseIdRaw === ""
      ? null
      : String(exerciseIdRaw).trim() || null;

  if (!title && !reason) {
    return null;
  }

  return {
    exercise_id: exerciseId,
    title: title || null,
    reason: reason || null,
  };
};

const normalizeSuggestedExercisesField = (value) => {
  if (!Array.isArray(value)) {
    if (typeof value === "string") {
      return value
        .split(/\r?\n/)
        .map((line) => normalizeSuggestedExercise(line))
        .filter(Boolean);
    }
    return [];
  }

  return value.map((item) => normalizeSuggestedExercise(item)).filter(Boolean);
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

  if (Object.prototype.hasOwnProperty.call(body, EDITABLE_EXERCISE_FIELD)) {
    updates[EDITABLE_EXERCISE_FIELD] = normalizeSuggestedExercisesField(
      body[EDITABLE_EXERCISE_FIELD]
    );
    hasAny = true;
  }

  return hasAny ? updates : null;
};

const hasClinicalContent = (detailsObject) => {
  if (!detailsObject || typeof detailsObject !== "object") {
    return false;
  }

  for (const key of EDITABLE_STRING_FIELDS) {
    if (normalizeStringField(detailsObject[key])) {
      return true;
    }
  }

  for (const key of EDITABLE_ARRAY_FIELDS) {
    if (normalizeStringArrayField(detailsObject[key]).length > 0) {
      return true;
    }
  }

  if (normalizeSuggestedExercisesField(detailsObject[EDITABLE_EXERCISE_FIELD]).length > 0) {
    return true;
  }

  return false;
};

/**
 * Merges editable clinical fields into an existing AI recommendation details object.
 * Non-editable metadata keys are preserved. Keeps legacy aliases in sync.
 */
const mergeAiRecommendationDraftDetails = (currentDetails, updates) => {
  const next = parseDetailsObject(currentDetails);
  const normalizedUpdates = extractEditableUpdates(updates);

  if (!normalizedUpdates) {
    const error = new Error(
      "At least one editable recommendation field is required."
    );
    error.statusCode = 400;
    throw error;
  }

  Object.assign(next, normalizedUpdates);

  if (Object.prototype.hasOwnProperty.call(normalizedUpdates, "clinical_reasoning")) {
    next.reason = normalizedUpdates.clinical_reasoning;
  }

  if (Object.prototype.hasOwnProperty.call(normalizedUpdates, "treatment_plan_adjustments")) {
    const adjustments = normalizedUpdates.treatment_plan_adjustments;
    next.suggestion =
      adjustments[0]
      || normalizeStringField(next.clinical_analysis)
      || "No specific treatment plan adjustment was generated.";
  }

  if (!hasClinicalContent(next)) {
    const error = new Error("Recommendation content cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  return next;
};

module.exports = {
  EDITABLE_STRING_FIELDS,
  EDITABLE_ARRAY_FIELDS,
  EDITABLE_EXERCISE_FIELD,
  ALLOWED_UPDATE_KEYS,
  parseDetailsObject,
  extractEditableUpdates,
  hasClinicalContent,
  mergeAiRecommendationDraftDetails,
  normalizeStringField,
  normalizeStringArrayField,
  normalizeSuggestedExercisesField,
};
