import { resolveUploadedAssetUrl } from "../../../services/apiConfig.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";
import {
  formatPatientDisplayDate,
  formatPatientDisplayDateTime,
  getPatientExerciseStatusLabel,
  getPatientGoalTermLabel,
  getPatientMediaTypeLabel,
  getPatientPlanStatusMeta,
  getPatientReviewStatusLabel,
} from "./specialistPatientsLocalization.js";

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readDateValue(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (value == null || value === "") {
      continue;
    }
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return null;
}

function readNumber(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function readBoolean(record, keys) {
  if (!record || typeof record !== "object") {
    return false;
  }
  for (const key of keys) {
    const value = record[key];
    if (value === true || value === false) {
      return value;
    }
  }
  return false;
}

function resolveProfileImageUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  const trimmed = fileUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return resolveUploadedAssetUrl(trimmed) ?? trimmed;
  }

  return resolveUploadedAssetUrl(trimmed);
}

function readProfileImageUrl(record) {
  const raw = readString(record, [
    "profile_image_url",
    "profileImageUrl",
    "profile_image",
    "profileImage",
    "image_url",
    "avatarUrl",
    "avatar",
  ]);

  return resolveProfileImageUrl(raw);
}

export function calculateAgeFromBirthDate(dateValue) {
  if (!dateValue) {
    return null;
  }
  const birth = new Date(dateValue);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years -= 1;
  }
  return years >= 0 ? years : null;
}

export function formatPatientDate(dateValue, locale = "en") {
  return formatPatientDisplayDate(dateValue, locale);
}

export function formatPatientDateTime(dateValue, locale = "en") {
  return formatPatientDisplayDateTime(dateValue, locale);
}

function normalizeImprovementPercentage(map) {
  if (!map) {
    return null;
  }
  const raw = readNumber(map, ["improvement_percentage", "improvementPercentage", "percentage"]);
  if (raw == null) {
    return null;
  }
  const normalized = raw > 1 ? raw / 100 : raw;
  return Math.max(0, Math.min(1, normalized));
}

function formatReviewStatus(status, t = null) {
  return getPatientReviewStatusLabel(status, t);
}

export function mediaTypeFromRaw(raw, t = null) {
  return getPatientMediaTypeLabel(raw, t);
}

function formatGoalTerm(term, t = null) {
  return getPatientGoalTermLabel(term, t);
}

function formatPlanStatus(status, t = null) {
  return getPatientPlanStatusMeta(status, t);
}

export function mapSpecialistPatientListItem(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  return {
    id,
    name: readString(row, ["full_name", "fullName", "name"]) || "Patient",
    dateOfBirth: readDateValue(row, ["date_of_birth", "dateOfBirth"]),
    diagnosis: readString(row, ["primary_diagnosis", "diagnosis"]) || null,
    profileImageUrl: readProfileImageUrl(row),
  };
}

export function mapSpecialistPatientList(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(mapSpecialistPatientListItem).filter(Boolean);
}

export function mapPatientProfile(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const dateOfBirth = readDateValue(row, ["date_of_birth", "dateOfBirth"]);
  return {
    id,
    fullName: readString(row, ["full_name", "fullName", "name"]) || "Patient",
    dateOfBirth,
    age: calculateAgeFromBirthDate(dateOfBirth),
    gender: readString(row, ["gender"]) || null,
    profileImageUrl: readProfileImageUrl(row),
  };
}

export function mapPatientDiagnosisSummary(diagnosisRows) {
  if (!Array.isArray(diagnosisRows) || diagnosisRows.length === 0) {
    return null;
  }
  const first = diagnosisRows[0];
  return readString(first, ["diagnosis_title", "diagnosisTitle", "title"]) || null;
}

export function mapPatientDiagnosis(row, context = {}) {
  const { locale } = resolveSpecialistMapperContext(context);
  const title = readString(row, ["diagnosis_title", "diagnosisTitle", "title"]);
  if (!title) {
    return null;
  }

  const diagnosedAt = readDateValue(row, ["diagnosed_at", "diagnosedAt"]);
  const description = readString(row, ["description"]) || null;

  return {
    id: readString(row, ["id", "_id"]) || null,
    title,
    description,
    diagnosedAt,
    diagnosedAtLabel: formatPatientDisplayDate(diagnosedAt, locale) || null,
    diagnosedByName: readString(row, ["diagnosed_by_name", "diagnosedByName"]) || null,
  };
}

export function mapPatientDiagnosisList(diagnosisRows, context = {}) {
  if (!Array.isArray(diagnosisRows)) {
    return [];
  }

  return diagnosisRows
    .map((row) => mapPatientDiagnosis(row, context))
    .filter(Boolean);
}

export function selectActiveTreatmentPlan(planRows, context = {}) {
  if (!Array.isArray(planRows) || planRows.length === 0) {
    return null;
  }
  const mapped = planRows.map((row) => mapTreatmentPlan(row, context)).filter(Boolean);
  return mapped.find((plan) => plan.isActive) || mapped[0] || null;
}

export function mapTreatmentPlan(row, context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const status = readString(row, ["status"]) || "active";
  const statusMeta = formatPlanStatus(status, t);
  const startDate = readDateValue(row, ["start_date", "startDate"]);
  const endDate = readDateValue(row, ["end_date", "endDate"]);
  return {
    id,
    title: readString(row, ["title"]) || "Treatment Plan",
    status,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    isActive: status.trim().toLowerCase() === "active",
    startDate,
    endDate,
    startDateLabel: formatPatientDate(startDate, locale),
    endDateLabel: formatPatientDate(endDate, locale),
  };
}

export function mapPatientGoal(row, completionPercentage = 0, context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const isAchieved = readBoolean(row, ["is_achieved", "isAchieved"]);
  const normalized = completionPercentage > 1 ? completionPercentage / 100 : completionPercentage;
  const percent = isAchieved
    ? 100
    : Math.round(Math.max(0, Math.min(1, normalized)) * 100);
  const term = readString(row, ["term"]) || "short_term";
  const targetValue = readNumber(row, ["target_value", "targetValue"]);
  const targetDate = readDateValue(row, ["target_date", "targetDate"]);
  return {
    id,
    title: readString(row, ["title"]) || "Goal",
    term,
    termLabel: formatGoalTerm(term, t),
    isAchieved,
    completionPercent: percent,
    description: readString(row, ["description"]) || null,
    targetValue,
    targetDate,
    targetDateLabel: formatPatientDisplayDate(targetDate, locale),
  };
}

export function mapAssignedExercise(row, context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const isActive = readBoolean(row, ["is_active", "isActive"]);
  const dueDate = readDateValue(row, ["due_date", "dueDate"]);
  const exerciseId = readString(row, ["exercise_id", "exerciseId"]) || null;
  return {
    id,
    exerciseId,
    exerciseTitle: readString(row, ["exercise_title", "exerciseTitle", "title"]) || "Exercise",
    category: readString(row, ["category_name", "categoryName", "category"]) || null,
    dueDate,
    dueDateLabel: formatPatientDate(dueDate, locale),
    statusLabel: getPatientExerciseStatusLabel(isActive, t),
    isActive,
  };
}

/**
 * Full assigned-exercise detail mapping (Flutter PatientAssignedExerciseItem.fromMap).
 * @param {Record<string, unknown>} row
 * @param {{ t?: Function, locale?: string }} [context]
 */
export function mapAssignedExerciseDetail(row, context = {}) {
  const mapped = mapAssignedExercise(row, context);
  if (!mapped) {
    return null;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);
  const createdAt = readDateValue(row, ["created_at", "createdAt"]);
  const startDate = readDateValue(row, ["start_date", "startDate"]);
  const frequency = readString(row, ["frequency"]) || null;
  const instructionMediaUrlRaw = readString(row, [
    "instruction_media_url",
    "instructionMediaUrl",
  ]);
  const instructionMediaUrl = instructionMediaUrlRaw
    ? (resolveUploadedAssetUrl(instructionMediaUrlRaw) ?? instructionMediaUrlRaw)
    : null;

  return {
    ...mapped,
    patientId: readString(row, ["patient_id", "patientId"]) || null,
    description:
      readString(row, ["description", "exercise_description", "exerciseDescription"]) || null,
    instructions: readString(row, ["instructions"]) || null,
    instructionMediaUrl,
    hasInstructionMedia: Boolean(instructionMediaUrl),
    frequency,
    createdAt,
    createdAtLabel: formatPatientDate(createdAt, locale),
    startDate,
    startDateLabel: formatPatientDate(startDate, locale),
    assignedAtLabel:
      formatPatientDate(createdAt, locale) || formatPatientDate(startDate, locale) || null,
  };
}

export function mapPatientSubmission(row, mediaTypeLabel = "—", context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const status = readString(row, ["status"]) || "pending";
  const submittedAt = readDateValue(row, ["submitted_at", "submittedAt"]);
  return {
    id,
    exerciseTitle: readString(row, ["exercise_title", "exerciseTitle", "title"]) || "Exercise",
    mediaTypeLabel,
    submittedAt,
    submittedAtLabel: formatPatientDateTime(submittedAt, locale),
    reviewStatus: formatReviewStatus(status, t),
    reviewStatusRaw: status.trim().toLowerCase(),
  };
}

export function mapPatientNote(row, context = {}) {
  const { locale } = resolveSpecialistMapperContext(context);
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const createdAt = readDateValue(row, ["created_at", "createdAt"]);
  return {
    id,
    note: readString(row, ["note"]) || "",
    specialistName: readString(row, ["specialist_name", "specialistName"]) || "Specialist",
    createdAt,
    createdAtLabel: formatPatientDateTime(createdAt, locale),
  };
}

export function mapFamilyPatternInsight(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const patterns = Array.isArray(row.patterns) ? row.patterns : [];
  return {
    hasSiblings: row.hasSiblings === true,
    matchedChildren: readNumber(row, ["matchedChildren"]) ?? 0,
    patternScore: readNumber(row, ["patternScore"]),
    evidenceLevel: readString(row, ["evidenceLevel"]) || null,
    summaryReason: readString(row, ["summaryReason"]) || null,
    disclaimer: readString(row, ["disclaimer"]) || null,
    patterns: patterns.map((pattern) => ({
      type: readString(pattern, ["type"]) || null,
      reason: readString(pattern, ["reason"]) || null,
      condition: readString(pattern, ["condition"]) || null,
    })),
    hasDetectedPatterns: patterns.length > 0,
  };
}

export function mapFamilyPatternDetails(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const groups = Array.isArray(row.groups) ? row.groups : [];
  return {
    groups: groups.map((group) => ({
      type: readString(group, ["type"]) || null,
      children: Array.isArray(group.children)
        ? group.children.map((child) => ({
          patientId: readString(child, ["patientId", "patient_id"]) || null,
          patientName: readString(child, ["patientName", "patient_name"]) || "Patient",
          matchedValue: readString(child, ["matchedValue", "matched_value"]) || null,
          matchedKeywords: Array.isArray(child.matchedKeywords) ? child.matchedKeywords : [],
        }))
        : [],
    })),
  };
}

export function mapPatientGuardian(row) {
  const parentId = readString(row, ["parent_id", "parentId"]);
  if (!parentId) {
    return null;
  }
  return {
    parentId,
    fullName: readString(row, ["full_name", "fullName", "name"]) || "Parent",
    isPrimaryContact: readBoolean(row, ["is_primary_contact", "isPrimaryContact"]),
  };
}

export function pickPrimaryGuardian(guardians) {
  if (!Array.isArray(guardians) || guardians.length === 0) {
    return null;
  }
  return guardians.find((item) => item.isPrimaryContact) || guardians[0];
}

export function buildPatientQuickStats({
  goals,
  assignedExercises,
  submissionRows,
  reportCount,
}) {
  const activeGoals = (goals || []).filter((goal) => !goal.isAchieved).length;
  const activeAssigned = (assignedExercises || []).filter((item) => item.isActive).length;
  const pendingReviews = (submissionRows || []).filter(
    (row) => (readString(row, ["status"]) || "").trim().toLowerCase() === "pending",
  ).length;

  return {
    activeGoals,
    assignedExercises: activeAssigned,
    pendingReviews,
    reports: reportCount || 0,
  };
}

export async function buildPatientDetailsBundle(rawBundle, goals = [], context = {}) {
  const patient = mapPatientProfile(rawBundle.patientMap);
  if (!patient) {
    throw new Error("Patient not found.");
  }

  const diagnoses = mapPatientDiagnosisList(rawBundle.diagnosisRows, context);
  const diagnosis = diagnoses[0]?.title ?? mapPatientDiagnosisSummary(rawBundle.diagnosisRows);
  const overallProgress = normalizeImprovementPercentage(rawBundle.improvementMap);
  const treatmentPlan = selectActiveTreatmentPlan(rawBundle.treatmentPlanRows, context);
  const assignedExercises = (rawBundle.assignedExerciseRows || [])
    .map((row) => mapAssignedExercise(row, context))
    .filter(Boolean);

  const recentSubmissions = rawBundle.recentSubmissions || [];

  const notes = (rawBundle.noteRows || [])
    .map((row) => mapPatientNote(row, context))
    .filter(Boolean)
    .reverse();

  const stats = buildPatientQuickStats({
    goals,
    assignedExercises,
    submissionRows: rawBundle.submissionRows,
    reportCount: (rawBundle.reportRows || []).length,
  });

  return {
    patient,
    diagnosis,
    diagnoses,
    overallProgress,
    overallProgressPercent: overallProgress == null ? null : Math.round(overallProgress * 100),
    stats,
    treatmentPlan,
    goals,
    assignedExercises,
    recentSubmissions,
    notes,
  };
}

export async function buildRecentSubmissionsWithMedia(submissionRows, getSubmissionMedia, context = {}) {
  const { t } = resolveSpecialistMapperContext(context);
  const recentSubmissionRows = (submissionRows || []).slice(0, 5);
  const recentSubmissions = await Promise.all(
    recentSubmissionRows.map(async (row) => {
      const submissionId = readString(row, ["id", "_id"]);
      let mediaTypeLabel = getPatientMediaTypeLabel(null, t);
      if (submissionId) {
        const mediaRows = await getSubmissionMedia(submissionId);
        if (mediaRows.length > 0) {
          mediaTypeLabel = mediaTypeFromRaw(
            readString(mediaRows[0], ["media_type", "mediaType"]),
            t,
          );
        }
      }
      return mapPatientSubmission(row, mediaTypeLabel, context);
    }),
  );
  return recentSubmissions.filter(Boolean);
}

export async function fetchGoalsWithProgress(planId, getTreatmentPlanGoalsFn, getGoalProgressFn, context = {}) {
  const goalRows = await getTreatmentPlanGoalsFn(planId);
  if (!Array.isArray(goalRows) || goalRows.length === 0) {
    return [];
  }

  const goals = await Promise.all(
    goalRows.map(async (row) => {
      const goalId = readString(row, ["id", "_id"]);
      let completion = 0;
      if (goalId) {
        const progressRows = await getGoalProgressFn(goalId);
        if (progressRows.length > 0) {
          completion = readNumber(progressRows[0], [
            "completion_percentage",
            "completionPercentage",
          ]) ?? 0;
        }
      }
      return mapPatientGoal(row, completion, context);
    }),
  );

  return goals.filter(Boolean);
}
