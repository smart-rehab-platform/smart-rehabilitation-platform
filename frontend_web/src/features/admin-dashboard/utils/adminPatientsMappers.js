import { resolveUploadedAssetUrl } from "../../../services/apiConfig";

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
      return date;
    }
  }

  return null;
}

export function resolveProfileImageUrl(fileUrl) {
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

export function getPatientInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "P";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function formatPatientGender(gender) {
  const normalized = (gender || "").trim().toLowerCase();

  if (normalized === "male" || normalized === "m") {
    return "Male";
  }

  if (normalized === "female" || normalized === "f") {
    return "Female";
  }

  return null;
}

export function formatPreviousSessionDateTime(dateValue) {
  if (!dateValue) {
    return null;
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const datePart = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${datePart} • ${timePart}`;
}

export function isPastScheduledNotCompleted(session) {
  if (!session?.scheduledAt || !session.status) {
    return false;
  }

  const normalizedStatus = session.status.trim().toLowerCase();
  if (normalizedStatus !== "scheduled") {
    return false;
  }

  const scheduledAt = session.scheduledAt instanceof Date
    ? session.scheduledAt
    : new Date(session.scheduledAt);

  if (Number.isNaN(scheduledAt.getTime())) {
    return false;
  }

  return scheduledAt.getTime() < Date.now();
}

export function formatSessionStatusLabel(status, isPastScheduled = false) {
  const normalized = (status || "unknown").trim().toLowerCase();

  if (normalized === "completed") {
    return "Completed";
  }

  if (normalized === "cancelled") {
    return "Cancelled";
  }

  if (normalized === "no_show") {
    return "No show";
  }

  if (normalized === "scheduled") {
    return isPastScheduled ? "Not completed" : "Scheduled";
  }

  if (normalized === "pending") {
    return "Pending";
  }

  if (normalized === "inactive" || normalized === "disabled") {
    return "Inactive";
  }

  return normalized.replaceAll("_", " ");
}

export function getSessionStatusTone(status, isPastScheduled = false) {
  const normalized = (status || "unknown").trim().toLowerCase();

  if (normalized === "completed") {
    return "success";
  }

  if (normalized === "cancelled") {
    return "danger";
  }

  if (normalized === "no_show" || normalized === "pending") {
    return "warning";
  }

  if (normalized === "scheduled") {
    return isPastScheduled ? "warning" : "info";
  }

  return "muted";
}

export function mapAdminPatientRecord(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const previousSessionRaw = row.previous_session ?? row.previousSession;
  const previousSessionMap = previousSessionRaw && typeof previousSessionRaw === "object"
    ? previousSessionRaw
    : null;

  const previousSessionId = readString(previousSessionMap, ["id", "_id"]);
  const scheduledAt = readDateValue(previousSessionMap, ["scheduled_at", "scheduledAt"]);
  const sessionStatus = readString(previousSessionMap, ["status"]) || null;

  const previousSession = previousSessionId
    ? {
        id: previousSessionId,
        scheduledAt,
        status: sessionStatus,
        scheduledAtLabel: formatPreviousSessionDateTime(scheduledAt),
        isPastScheduledNotCompleted: isPastScheduledNotCompleted({
          scheduledAt,
          status: sessionStatus,
        }),
        statusLabel: formatSessionStatusLabel(
          sessionStatus,
          isPastScheduledNotCompleted({ scheduledAt, status: sessionStatus }),
        ),
        statusTone: getSessionStatusTone(
          sessionStatus,
          isPastScheduledNotCompleted({ scheduledAt, status: sessionStatus }),
        ),
      }
    : null;

  const fullName = readString(row, ["full_name", "fullName", "name"]) || "Patient";
  const conditionRaw = readString(row, ["condition", "diagnosis_title", "diagnosisTitle"]);

  return {
    id,
    fullName,
    profileImageUrl: resolveProfileImageUrl(
      readString(row, ["profile_image_url", "profileImageUrl", "child_image_url", "childImageUrl"]),
    ),
    gender: readString(row, ["gender"]) || null,
    genderLabel: formatPatientGender(readString(row, ["gender"])) || "—",
    condition: conditionRaw || null,
    conditionLabel: conditionRaw || "No condition",
    hasCondition: Boolean(conditionRaw),
    initials: getPatientInitials(fullName),
    previousSession,
  };
}

export function mapCaseCategory(row) {
  const id = readString(row, ["id", "_id"]);
  const name = readString(row, ["name"]);

  if (!id || !name) {
    return null;
  }

  let isActive = true;
  if (row.is_active === false || row.is_active === 0 || row.is_active === "false") {
    isActive = false;
  } else if (row.isActive === false) {
    isActive = false;
  }

  return { id, name, isActive };
}

export function buildConditionFilterOptions(categories, patients) {
  const options = new Set();

  for (const category of categories) {
    if (category?.isActive !== false && category?.name?.trim()) {
      options.add(category.name.trim());
    }
  }

  for (const patient of patients) {
    if (patient?.condition?.trim()) {
      options.add(patient.condition.trim());
    }
  }

  return Array.from(options).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

export function filterAdminPatients(patients, { search = "", conditionFilter = null } = {}) {
  const query = search.trim().toLowerCase();

  return patients.filter((patient) => {
    const matchesSearch = !query
      || patient.fullName.toLowerCase().includes(query)
      || (patient.condition ?? "").toLowerCase().includes(query);

    const matchesCondition = !conditionFilter
      || patient.condition === conditionFilter;

    return matchesSearch && matchesCondition;
  });
}
