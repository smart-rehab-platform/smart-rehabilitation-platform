import {
  fetchGoalsWithProgress,
  formatPatientDate,
  mapPatientGoal,
  mapTreatmentPlan,
} from "./specialistPatientMappers";
import {
  formatTreatmentPlanDisplayDate,
  formatTreatmentPlanDateRange,
  getTreatmentPlanStatusMeta as getLocalizedTreatmentPlanStatusMeta,
} from "./specialistTreatmentPlansLocalization.js";

export { TREATMENT_PLAN_FILTER_IDS } from "./specialistTreatmentPlansLocalization.js";

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

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

export function parseDateOnlyValue(value) {
  if (!value) {
    return null;
  }
  const text = String(value).trim();
  const match = DATE_ONLY_RE.exec(text);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year
      && date.getMonth() === month - 1
      && date.getDate() === day
    ) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateOnlyForApi(value) {
  return parseDateOnlyValue(value);
}

export function formatDateOnlyLabel(value, locale = "en") {
  return formatTreatmentPlanDisplayDate(value, locale);
}

export function getTreatmentPlanStatusMeta(status, t = null) {
  return getLocalizedTreatmentPlanStatusMeta(status, t);
}

export function mapTreatmentPlanListItem(row, patientNameMap = new Map()) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const patientId = readString(row, ["patient_id", "patientId"]);
  const patientName = readString(row, ["patient_name", "patientName"])
    || patientNameMap.get(patientId)
    || "Patient";
  const specialistId = readString(row, ["specialist_id", "specialistId"]);
  const status = readString(row, ["status"]) || "active";
  const statusMeta = getTreatmentPlanStatusMeta(status);
  const startDate = parseDateOnlyValue(row.start_date ?? row.startDate);
  const endDate = parseDateOnlyValue(row.end_date ?? row.endDate);

  return {
    id,
    title: readString(row, ["title"]) || "Treatment Plan",
    patientId,
    patientName,
    specialistId,
    status,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    iconTone: statusMeta.iconTone,
    isActive: status.trim().toLowerCase() === "active",
    startDate,
    endDate,
    startDateLabel: formatTreatmentPlanDisplayDate(startDate, "en"),
    endDateLabel: formatTreatmentPlanDisplayDate(endDate, "en"),
    dateRangeLabel: formatTreatmentPlanDateRange(startDate, endDate, "en"),
  };
}

export function mapTreatmentPlanList(rows, { patientNameMap = new Map(), specialistUserId, assignedIds } = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => mapTreatmentPlanListItem(row, patientNameMap))
    .filter(Boolean)
    .filter((plan) => {
      if (specialistUserId && plan.specialistId && plan.specialistId !== specialistUserId) {
        return false;
      }
      if (assignedIds && plan.patientId && !assignedIds.has(plan.patientId)) {
        return false;
      }
      return true;
    });
}

export function filterVisibleTreatmentPlans(plans, { filterId = "all", searchQuery = "" } = {}) {
  const query = searchQuery.trim().toLowerCase();
  return plans.filter((plan) => {
    const status = (plan.status || "active").trim().toLowerCase();
    if (filterId !== "all" && status !== filterId) {
      return false;
    }
    if (!query) {
      return true;
    }
    return plan.title.toLowerCase().includes(query)
      || plan.patientName.toLowerCase().includes(query);
  });
}

export function getActivePatientIds(plans) {
  return new Set(
    plans
      .filter((plan) => plan.isActive && plan.patientId)
      .map((plan) => plan.patientId),
  );
}

export function mapEditableTreatmentPlan(row) {
  return mapTreatmentPlan(row);
}

export async function buildEditTreatmentPlanBundle(
  planRow,
  { getTreatmentPlanGoalsFn, getGoalProgressFn },
) {
  const plan = mapEditableTreatmentPlan(planRow);
  if (!plan) {
    return null;
  }

  const patientId = readString(planRow, ["patient_id", "patientId"]);
  const patientName = readString(planRow, ["patient_name", "patientName"]) || "Patient";
  const goals = plan.id
    ? await fetchGoalsWithProgress(plan.id, getTreatmentPlanGoalsFn, getGoalProgressFn)
    : [];

  return {
    patientId,
    patientName,
    plan,
    goals,
  };
}

export function mapPatientPickerItem(row) {
  const id = readString(row, ["id", "_id", "patient_id", "patientId"]);
  if (!id) {
    return null;
  }
  return {
    id,
    name: readString(row, ["full_name", "fullName", "name"]) || "Patient",
  };
}

export { mapPatientGoal, formatPatientDate };
