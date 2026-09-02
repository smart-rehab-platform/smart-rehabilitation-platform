import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

export function formatPatientDisplayDate(dateValue, locale = "en") {
  return formatAppDate(dateValue, locale);
}

export function formatPatientDisplayDateTime(dateValue, locale = "en") {
  return formatAppDateTime(dateValue, locale);
}

export function getPatientReviewStatusLabel(status, t = null) {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "reviewed") {
    return translateKey(t, "specialist.patientDetails.reviewStatus.reviewed", "Reviewed");
  }
  if (normalized === "needs_retry") {
    return translateKey(t, "specialist.patientDetails.reviewStatus.needsRetry", "Needs retry");
  }
  return translateKey(t, "specialist.patientDetails.reviewStatus.pending", "Pending");
}

export function getPatientPlanStatusMeta(status, t = null) {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "completed") {
    return {
      label: translateKey(t, "specialist.patientDetails.planStatus.completed", "Completed"),
      tone: "gray",
    };
  }
  if (normalized === "archived") {
    return {
      label: translateKey(t, "specialist.patientDetails.planStatus.archived", "Archived"),
      tone: "gray",
    };
  }
  return {
    label: translateKey(t, "specialist.patientDetails.planStatus.active", "Active"),
    tone: "success",
  };
}

export function getPatientGoalTermLabel(term, t = null) {
  const normalized = (term || "").trim().toLowerCase();
  if (normalized === "short_term") {
    return translateKey(t, "specialist.patientDetails.goalTerm.shortTerm", "Short-term");
  }
  if (normalized === "long_term") {
    return translateKey(t, "specialist.patientDetails.goalTerm.longTerm", "Long-term");
  }
  return term || translateKey(t, "specialist.patientDetails.goalTerm.default", "Goal");
}

export function getPatientExerciseStatusLabel(isActive, t = null) {
  return isActive
    ? translateKey(t, "specialist.patientDetails.exerciseStatus.active", "Active")
    : translateKey(t, "specialist.patientDetails.exerciseStatus.inactive", "Inactive");
}

export function getPatientMediaTypeLabel(raw, t = null) {
  const normalized = (raw || "").trim().toLowerCase();
  if (!normalized) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }
  if (normalized.includes("video")) {
    return translateKey(t, "specialist.patientDetails.mediaType.video", "Video");
  }
  if (normalized.includes("audio")) {
    return translateKey(t, "specialist.patientDetails.mediaType.audio", "Audio");
  }
  if (normalized.includes("image")) {
    return translateKey(t, "specialist.patientDetails.mediaType.image", "Image");
  }
  return raw.trim();
}

export function formatPatientAgeLabel(age, t = null) {
  if (age == null) {
    return null;
  }
  if (age === 1) {
    return translateKey(t, "specialist.patientDetails.ageOneYear", "1 year");
  }
  return translateKey(t, "specialist.patientDetails.ageYears", "{count} years", { count: age });
}

export function formatPatientAgeDiagnosisMeta(age, diagnosis, t = null) {
  const ageLabel = formatPatientAgeLabel(age, t);
  const diagnosisText = diagnosis
    || translateKey(t, "specialist.patientDetails.noDiagnosis", "No diagnosis recorded");

  if (ageLabel) {
    return translateKey(
      t,
      "specialist.patientDetails.ageDiagnosis",
      "Age {age} • {diagnosis}",
      { age: ageLabel, diagnosis: diagnosisText },
    );
  }

  return diagnosis ? diagnosisText : translateKey(
    t,
    "specialist.patientDetails.noDiagnosis",
    "No diagnosis recorded",
  );
}

export function formatPatientDueDateLabel(dueDate, locale, t = null) {
  const formatted = formatPatientDisplayDate(dueDate, locale);
  if (!formatted) {
    return null;
  }
  return translateKey(t, "specialist.patientDetails.dueDate", "Due {date}", { date: formatted });
}

export function getPatientLoadErrorMessage(error, t = null) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (message.includes("not found") || message.includes("not assigned")) {
    return translateKey(
      t,
      "specialist.patientDetails.errors.notFoundOrUnassigned",
      "Patient not found or not assigned to you.",
    );
  }
  return translateKey(
    t,
    "specialist.patientDetails.errors.loadFailed",
    "Failed to load patient details.",
  );
}

export function getPatientFamilyPatternErrorMessage(t = null) {
  return translateKey(
    t,
    "specialist.patientDetails.errors.familyPatternLoadFailed",
    "Failed to load family pattern insight.",
  );
}

export const FAMILY_PATTERN_DISCLAIMER_EN =
  "This feature identifies repeated characteristics among children linked to the same parent account. It does not diagnose hereditary or genetic conditions.";

export function getFamilyPatternDisclaimerLabel(t = null) {
  return translateKey(
    t,
    "specialist.patientDetails.familyPatternDisclaimer",
    FAMILY_PATTERN_DISCLAIMER_EN,
  );
}

/**
 * Localizes the known system-generated family pattern disclaimer.
 * Unknown backend disclaimer text is returned unchanged.
 */
export function localizeFamilyPatternDisclaimer(disclaimer, t = null) {
  const raw = typeof disclaimer === "string" ? disclaimer.trim() : "";
  if (!raw) {
    return null;
  }

  if (raw === FAMILY_PATTERN_DISCLAIMER_EN) {
    return getFamilyPatternDisclaimerLabel(t);
  }

  return raw;
}

export function localizedFamilyPatternType(t, type) {
  const normalized = (type || "").trim().toLowerCase();
  switch (normalized) {
    case "shared_diagnosis":
      return translateKey(t, "specialist.patientDetails.familyPattern.patternTypes.sharedDiagnosis", "Shared Diagnosis");
    case "shared_case_category":
      return translateKey(t, "specialist.patientDetails.familyPattern.patternTypes.sharedCaseCategory", "Shared Case Category");
    case "shared_difficulties":
      return translateKey(t, "specialist.patientDetails.familyPattern.patternTypes.observedDifficulties", "Observed Difficulties");
    case "previous_diagnosis_similarity":
      return translateKey(t, "specialist.patientDetails.familyPattern.patternTypes.previousDiagnosis", "Previous Diagnosis");
    case "family_history_similarity":
      return translateKey(t, "specialist.patientDetails.familyPattern.patternTypes.familyHistory", "Family History");
    default:
      return translateKey(
        t,
        "specialist.patientDetails.familyPattern.patternTypes.repeatedCharacteristic",
        "Repeated Characteristic",
      );
  }
}

export function localizedFamilyPatternEvidenceLevel(t, level) {
  const normalized = (level || "").trim().toUpperCase();
  switch (normalized) {
    case "HIGH":
      return translateKey(t, "specialist.patientDetails.familyPattern.evidenceHigh", "High Evidence");
    case "MODERATE":
      return translateKey(t, "specialist.patientDetails.familyPattern.evidenceModerate", "Moderate Evidence");
    case "LOW":
    default:
      return translateKey(t, "specialist.patientDetails.familyPattern.evidenceLow", "Low Evidence");
  }
}

export function localizedFamilyPatternScoreCaption(t, level) {
  const normalized = (level || "").trim().toUpperCase();
  switch (normalized) {
    case "HIGH":
      return translateKey(
        t,
        "specialist.patientDetails.familyPattern.scoreCaptionHigh",
        "High confidence based on available records.",
      );
    case "MODERATE":
      return translateKey(
        t,
        "specialist.patientDetails.familyPattern.scoreCaptionModerate",
        "Moderate repeated characteristics detected.",
      );
    case "LOW":
    default:
      return translateKey(
        t,
        "specialist.patientDetails.familyPattern.scoreCaptionLow",
        "Limited repeated characteristics detected.",
      );
  }
}

export function localizedFamilyPatternMatchedChildrenLabel(t, count) {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  if (safeCount === 1) {
    return translateKey(
      t,
      "specialist.patientDetails.familyPattern.matchedChildrenOne",
      "1 Child Matched",
      { count: safeCount },
    );
  }
  return translateKey(
    t,
    "specialist.patientDetails.familyPattern.matchedChildrenMany",
    "{count} Children Matched",
    { count: safeCount },
  );
}

export function localizedFamilyPatternHiddenMatchesNotice(t, count) {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  if (safeCount === 1) {
    return translateKey(
      t,
      "specialist.patientDetails.familyPattern.hiddenMatchesOne",
      "Some matched children are not shown because you are not assigned to their records.",
    );
  }
  return translateKey(
    t,
    "specialist.patientDetails.familyPattern.hiddenMatchesMany",
    "{count} matched children are not shown because you are not assigned to their records.",
    { count: safeCount },
  );
}

export function localizedFamilyPatternMatchedValue(t, value) {
  return translateKey(
    t,
    "specialist.patientDetails.familyPattern.matchedValue",
    "Matched value: {value}",
    { value },
  );
}

export function getPatientMessageParentErrorMessage(error, t = null) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (message.includes("No parent")) {
    return translateKey(
      t,
      "specialist.patientDetails.errors.noParentLinked",
      "No parent is linked to this patient yet.",
    );
  }
  return translateKey(
    t,
    "specialist.patientDetails.errors.openConversationFailed",
    "Unable to open conversation.",
  );
}

/**
 * Reapply locale-aware labels on an already-mapped patient details bundle.
 * @param {object|null} details
 * @param {{ t?: Function, locale?: string }} context
 */
export function applyPatientDetailsLocalization(details, context = {}) {
  if (!details) {
    return details;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);
  const emptyDisplay = translateKey(t, "parent.common.emptyDisplay", "—");

  const treatmentPlan = details.treatmentPlan
    ? {
      ...details.treatmentPlan,
      statusLabel: getPatientPlanStatusMeta(details.treatmentPlan.status, t).label,
      startDateLabel: formatPatientDisplayDate(details.treatmentPlan.startDate, locale) || emptyDisplay,
      endDateLabel: formatPatientDisplayDate(details.treatmentPlan.endDate, locale) || emptyDisplay,
    }
    : null;

  const goals = (details.goals || []).map((goal) => ({
    ...goal,
    termLabel: getPatientGoalTermLabel(goal.term, t),
  }));

  const assignedExercises = (details.assignedExercises || []).map((exercise) => ({
    ...exercise,
    statusLabel: getPatientExerciseStatusLabel(exercise.isActive, t),
    dueDateLabel: exercise.dueDate
      ? formatPatientDueDateLabel(exercise.dueDate, locale, t)
      : exercise.dueDateLabel,
  }));

  const recentSubmissions = (details.recentSubmissions || []).map((submission) => ({
    ...submission,
    reviewStatus: getPatientReviewStatusLabel(submission.reviewStatusRaw, t),
    submittedAtLabel: formatPatientDisplayDateTime(submission.submittedAt, locale),
  }));

  const notes = (details.notes || []).map((note) => ({
    ...note,
    createdAtLabel: formatPatientDisplayDateTime(note.createdAt, locale),
  }));

  const diagnoses = (details.diagnoses || []).map((entry) => ({
    ...entry,
    diagnosedAtLabel: formatPatientDisplayDate(entry.diagnosedAt, locale) || emptyDisplay,
  }));

  return {
    ...details,
    treatmentPlan,
    goals,
    assignedExercises,
    recentSubmissions,
    notes,
    diagnoses,
  };
}
