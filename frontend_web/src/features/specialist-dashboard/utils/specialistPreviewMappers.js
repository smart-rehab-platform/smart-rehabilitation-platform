import { formatSpecialistSubmittedAgo } from "./specialistDashboardLocalization.js";

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

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param {Record<string, unknown>} row
 * @param {{ t?: Function, locale?: string, now?: Date }} [context]
 */
export function mapPendingReviewRow(row, context = {}) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const submittedAt = parseDateValue(row.submitted_at ?? row.submittedAt);
  const now = context.now instanceof Date ? context.now : new Date();

  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]),
    patientName: readString(row, ["patient_name", "patientName"]) || "Patient",
    exerciseTitle: readString(row, ["exercise_title", "exerciseTitle", "title"])
      || "Exercise review",
    submittedAt,
    submittedAgo: formatSpecialistSubmittedAgo(submittedAt, now, context),
    status: readString(row, ["status"]) || "pending",
  };
}

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {{ limit?: number, t?: Function, locale?: string, now?: Date }} [options]
 */
export function mapPendingReviewPreview(rows, options = {}) {
  const limit = options.limit ?? 4;

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => mapPendingReviewRow(row, options))
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = a.submittedAt?.getTime() ?? 0;
      const bTime = b.submittedAt?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

function readSnapshotSortTime(row) {
  const periodStart = parseDateValue(row.period_start ?? row.periodStart);
  if (periodStart) {
    return periodStart.getTime();
  }

  const createdAt = parseDateValue(row.created_at ?? row.createdAt);
  return createdAt?.getTime() ?? 0;
}

function normalizeProgressPercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  if (value > 1 && value <= 100) {
    return Math.round(value);
  }

  if (value >= 0 && value <= 1) {
    return Math.round(value * 100);
  }

  return Math.round(Math.max(0, Math.min(100, value)));
}

/**
 * @param {Record<string, unknown>} row
 */
function readSnapshotPercent(row) {
  const improvement = readNumber(row, ["improvement_percentage", "improvementPercentage"]);
  if (improvement != null) {
    return normalizeProgressPercent(improvement);
  }

  const averagePerformance = readNumber(row, ["average_performance", "averagePerformance"]);
  if (averagePerformance != null) {
    return normalizeProgressPercent(averagePerformance);
  }

  return null;
}

/**
 * @param {Array<Record<string, unknown>>} patients
 * @param {Array<Record<string, unknown>>} snapshots
 * @param {{ limit?: number|null }} [options]
 */
export function buildSpecialistPatientProgressList(patients, snapshots, options = {}) {
  const { limit = null } = options;

  if (!Array.isArray(patients) || patients.length === 0) {
    return [];
  }

  const patientNames = new Map();
  const patientAvatars = new Map();
  const patientIds = new Set();

  patients.forEach((patient) => {
    const id = readString(patient, ["id", "_id"]);
    if (!id) {
      return;
    }

    patientIds.add(id);
    patientNames.set(
      id,
      readString(patient, ["full_name", "fullName", "patient_name", "patientName"]) || "Patient",
    );
    patientAvatars.set(
      id,
      readString(patient, ["profile_image_url", "profileImageUrl"]) || null,
    );
  });

  if (patientIds.size === 0) {
    return [];
  }

  const latestByPatient = new Map();

  if (Array.isArray(snapshots)) {
    snapshots.forEach((row) => {
      const patientId = readString(row, ["patient_id", "patientId"]);
      if (!patientId || !patientIds.has(patientId)) {
        return;
      }

      const percent = readSnapshotPercent(row);
      if (percent == null) {
        return;
      }

      const sortTime = readSnapshotSortTime(row);
      const existing = latestByPatient.get(patientId);
      if (!existing || sortTime > existing.sortTime) {
        latestByPatient.set(patientId, {
          patientId,
          patientName: patientNames.get(patientId) || "Patient",
          profileImageUrl: patientAvatars.get(patientId) || null,
          percent,
          sortTime,
          updatedAt: sortTime > 0 ? new Date(sortTime) : null,
        });
      }
    });
  }

  const items = Array.from(latestByPatient.values())
    .sort((a, b) => b.sortTime - a.sortTime)
    .map(({ patientId, patientName, profileImageUrl, percent, updatedAt }) => ({
      patientId,
      patientName,
      profileImageUrl,
      percent,
      updatedAt,
    }));

  if (typeof limit === "number" && limit >= 0) {
    return items.slice(0, limit);
  }

  return items;
}

/**
 * @param {Array<Record<string, unknown>>} patients
 * @param {Array<Record<string, unknown>>} snapshots
 * @param {{ limit?: number }} [options]
 */
export function buildRecentPatientProgressPreview(patients, snapshots, options = {}) {
  const limit = options.limit ?? 4;
  return buildSpecialistPatientProgressList(patients, snapshots, { limit });
}
