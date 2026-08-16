import { resolveProfileImageUrl } from "./adminPatientsMappers";
import {
  buildPatientQuickStats,
  mapPatientDiagnosisSummary,
  mapPatientGoal,
  mapPatientNote,
  mapPatientSubmission,
  mediaTypeFromRaw,
} from "../../specialist-dashboard/utils/specialistPatientMappers";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

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

function readRawField(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (value != null && value !== "") {
      return value;
    }
  }

  return null;
}

/**
 * Preserves the literal calendar date from backend date-only values.
 * Avoids UTC midnight parsing that shifts display in local timezones.
 */
export function extractDateOnlyParts(value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const dateOnlyMatch = DATE_ONLY_PATTERN.exec(trimmed);
    if (dateOnlyMatch) {
      return {
        year: Number(dateOnlyMatch[1]),
        month: Number(dateOnlyMatch[2]),
        day: Number(dateOnlyMatch[3]),
      };
    }

    const prefixMatch = DATE_ONLY_PATTERN.exec(trimmed.slice(0, 10));
    if (prefixMatch) {
      return {
        year: Number(prefixMatch[1]),
        month: Number(prefixMatch[2]),
        day: Number(prefixMatch[3]),
      };
    }

    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate(),
    };
  }

  return null;
}

export function formatAdminDateOnlyLabel(value) {
  const parts = extractDateOnlyParts(value);
  if (!parts) {
    return null;
  }

  const date = new Date(parts.year, parts.month - 1, parts.day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function calculateAgeFromDateOnly(value) {
  const parts = extractDateOnlyParts(value);
  if (!parts) {
    return null;
  }

  const birth = new Date(parts.year, parts.month - 1, parts.day);
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

function formatAdminDateTimeLabel(value) {
  if (value == null || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeImprovementPercentage(map) {
  if (!map) {
    return 0;
  }

  const raw = readNumber(map, ["improvement_percentage", "improvementPercentage", "percentage"]);
  if (raw == null) {
    return 0;
  }

  const normalized = raw > 1 ? raw / 100 : raw;
  return Math.max(0, Math.min(1, normalized));
}

export function mapAdminPatientProfile(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const dateOfBirthRaw = readRawField(row, ["date_of_birth", "dateOfBirth"]);
  const imageRaw = readString(row, [
    "profile_image_url",
    "profileImageUrl",
    "child_image_url",
    "childImageUrl",
  ]);

  return {
    id,
    fullName: readString(row, ["full_name", "fullName", "name"]) || "Patient",
    dateOfBirth: dateOfBirthRaw,
    age: calculateAgeFromDateOnly(dateOfBirthRaw),
    gender: readString(row, ["gender"]) || null,
    profileImageUrl: resolveProfileImageUrl(imageRaw),
  };
}

export function mapAdminTreatmentPlan(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = readString(row, ["status"]) || "active";
  const startDateRaw = readRawField(row, ["start_date", "startDate"]);
  const endDateRaw = readRawField(row, ["end_date", "endDate"]);

  return {
    id,
    title: readString(row, ["title"]) || "Treatment Plan",
    status,
    isActive: status.trim().toLowerCase() === "active",
    startDateRaw,
    endDateRaw,
    startDateLabel: formatAdminDateOnlyLabel(startDateRaw),
    endDateLabel: formatAdminDateOnlyLabel(endDateRaw),
  };
}

export function selectAdminActiveTreatmentPlan(planRows) {
  if (!Array.isArray(planRows) || planRows.length === 0) {
    return null;
  }

  const mapped = planRows.map(mapAdminTreatmentPlan).filter(Boolean);
  return mapped.find((plan) => plan.isActive) || mapped[0] || null;
}

export function mapAdminAssignedExercise(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const isActive = row.is_active === true || row.isActive === true;
  const dueDateRaw = readRawField(row, ["due_date", "dueDate"]);

  return {
    id,
    exerciseTitle: readString(row, ["exercise_title", "exerciseTitle", "title"]) || "Exercise",
    category: readString(row, ["category_name", "categoryName", "category"]) || null,
    dueDateRaw,
    dueDateLabel: formatAdminDateOnlyLabel(dueDateRaw),
    isActive,
  };
}

export function mapAdminPatientNote(row) {
  const mapped = mapPatientNote(row);
  if (!mapped) {
    return null;
  }

  const createdAtRaw = readRawField(row, ["created_at", "createdAt"]);
  return {
    ...mapped,
    createdAtRaw,
    createdAtLabel: formatAdminDateTimeLabel(createdAtRaw) || mapped.createdAtLabel,
  };
}

export async function buildAdminRecentSubmissionsWithMedia(submissionRows, getSubmissionMedia) {
  const recentSubmissionRows = (submissionRows || []).slice(0, 5);
  const recentSubmissions = await Promise.all(
    recentSubmissionRows.map(async (row) => {
      const submissionId = readString(row, ["id", "_id"]);
      let mediaTypeLabel = "—";
      if (submissionId) {
        try {
          const mediaRows = await getSubmissionMedia(submissionId);
          if (mediaRows.length > 0) {
            mediaTypeLabel = mediaTypeFromRaw(
              readString(mediaRows[0], ["media_type", "mediaType"]),
            );
          }
        } catch {
          mediaTypeLabel = "—";
        }
      }

      const mapped = mapPatientSubmission(row, mediaTypeLabel);
      if (!mapped) {
        return null;
      }

      const submittedAtRaw = readRawField(row, ["submitted_at", "submittedAt"]);
      return {
        ...mapped,
        submittedAtRaw,
        submittedAtLabel: formatAdminDateTimeLabel(submittedAtRaw) || mapped.submittedAtLabel,
      };
    }),
  );

  return recentSubmissions.filter(Boolean);
}

export function withGoalDisplayPercent(goal) {
  if (!goal) {
    return goal;
  }

  return {
    ...goal,
    completionPercent: goal.isAchieved ? 100 : goal.completionPercent,
  };
}

export async function fetchAdminGoalsWithProgress(planId, getTreatmentPlanGoalsFn, getGoalProgressFn) {
  const goalRows = await getTreatmentPlanGoalsFn(planId);
  if (!Array.isArray(goalRows) || goalRows.length === 0) {
    return [];
  }

  const goals = await Promise.all(
    goalRows.map(async (row) => {
      const goalId = readString(row, ["id", "_id"]);
      let completion = 0;

      if (goalId) {
        try {
          const progressRows = await getGoalProgressFn(goalId);
          if (progressRows.length > 0) {
            completion = readNumber(progressRows[0], [
              "completion_percentage",
              "completionPercentage",
            ]) ?? 0;
          }
        } catch {
          completion = 0;
        }
      }

      return mapPatientGoal(row, completion);
    }),
  );

  return goals.filter(Boolean).map(withGoalDisplayPercent);
}

export function buildAdminPatientDetailsBundle(rawBundle, goals = [], recentSubmissions = []) {
  const patient = mapAdminPatientProfile(rawBundle.patientMap);
  if (!patient) {
    throw new Error("Patient not found.");
  }

  const diagnosis = mapPatientDiagnosisSummary(rawBundle.diagnosisRows);
  const overallProgress = normalizeImprovementPercentage(rawBundle.improvementMap);
  const treatmentPlan = selectAdminActiveTreatmentPlan(rawBundle.treatmentPlanRows);
  const assignedExercises = (rawBundle.assignedExerciseRows || [])
    .map(mapAdminAssignedExercise)
    .filter(Boolean);

  const notes = (rawBundle.noteRows || [])
    .map(mapAdminPatientNote)
    .filter(Boolean);

  const stats = buildPatientQuickStats({
    goals,
    assignedExercises,
    submissionRows: rawBundle.submissionRows,
    reportCount: (rawBundle.reportRows || []).length,
  });

  return {
    patient,
    diagnosis,
    conditionLabel: diagnosis?.trim() || "No condition",
    overallProgress,
    overallProgressPercent: Math.round(overallProgress * 100),
    stats,
    treatmentPlan,
    goals,
    assignedExercises,
    recentSubmissions,
    notes,
  };
}

export async function loadAdminPatientDetailsBundle(
  patientId,
  {
    loadRawBundle,
    getTreatmentPlanGoals,
    getGoalProgress,
    getSubmissionMedia,
  },
) {
  const rawBundle = await loadRawBundle(patientId);
  const activePlan = selectAdminActiveTreatmentPlan(rawBundle.treatmentPlanRows);

  const goals = activePlan?.id
    ? await fetchAdminGoalsWithProgress(activePlan.id, getTreatmentPlanGoals, getGoalProgress)
    : [];

  const recentSubmissions = await buildAdminRecentSubmissionsWithMedia(
    rawBundle.submissionRows,
    getSubmissionMedia,
  );

  return buildAdminPatientDetailsBundle(
    { ...rawBundle, recentSubmissions },
    goals,
    recentSubmissions,
  );
}
