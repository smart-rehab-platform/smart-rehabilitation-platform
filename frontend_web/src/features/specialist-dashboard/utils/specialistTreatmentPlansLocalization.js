import { formatAppDate } from "../../../i18n/formatters.js";
import { getPatientGoalTermLabel } from "./specialistPatientsLocalization.js";

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnlyValue(value) {
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

export const TREATMENT_PLAN_FILTER_IDS = ["all", "active", "completed", "archived"];

export const TREATMENT_PLAN_STATUS_VALUES = ["active", "completed", "archived"];

export const TREATMENT_PLAN_VALIDATION_KEYS = {
  PATIENT_REQUIRED: "patientRequired",
  TITLE_REQUIRED: "titleRequired",
  START_DATE_REQUIRED: "startDateRequired",
  END_DATE_BEFORE_START: "endDateBeforeStart",
};

const STATUS_LABEL_KEY_BY_VALUE = {
  active: "specialist.treatmentPlans.status.active",
  completed: "specialist.treatmentPlans.status.completed",
  archived: "specialist.treatmentPlans.status.archived",
};

const FILTER_LABEL_KEY_BY_ID = {
  all: "specialist.treatmentPlans.filters.all",
  active: "specialist.treatmentPlans.status.active",
  completed: "specialist.treatmentPlans.status.completed",
  archived: "specialist.treatmentPlans.status.archived",
};

const VALIDATION_KEY_MAP = {
  [TREATMENT_PLAN_VALIDATION_KEYS.PATIENT_REQUIRED]: "specialist.treatmentPlans.validation.patientRequired",
  [TREATMENT_PLAN_VALIDATION_KEYS.TITLE_REQUIRED]: "specialist.treatmentPlans.validation.titleRequired",
  [TREATMENT_PLAN_VALIDATION_KEYS.START_DATE_REQUIRED]: "specialist.treatmentPlans.validation.startDateRequired",
  [TREATMENT_PLAN_VALIDATION_KEYS.END_DATE_BEFORE_START]: "specialist.treatmentPlans.validation.endDateBeforeStart",
};

const EN_STATUS_LABEL = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const EN_FILTER_LABEL = {
  all: "All",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const EN_VALIDATION_MESSAGE = {
  [TREATMENT_PLAN_VALIDATION_KEYS.PATIENT_REQUIRED]: "Patient is required",
  [TREATMENT_PLAN_VALIDATION_KEYS.TITLE_REQUIRED]: "Plan title is required",
  [TREATMENT_PLAN_VALIDATION_KEYS.START_DATE_REQUIRED]: "Start date is required",
  [TREATMENT_PLAN_VALIDATION_KEYS.END_DATE_BEFORE_START]: "End date cannot be before start date",
};

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
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

export function getTreatmentPlanStatusLabel(status, t = null) {
  const normalized = (status || "").trim().toLowerCase();
  const key = STATUS_LABEL_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_STATUS_LABEL[normalized]);
  }
  return status || translateKey(t, "specialist.treatmentPlans.status.active", "Active");
}

export function getTreatmentPlanStatusMeta(status, t = null) {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "completed") {
    return {
      label: getTreatmentPlanStatusLabel("completed", t),
      tone: "gray",
      iconTone: "completed",
    };
  }
  if (normalized === "archived") {
    return {
      label: getTreatmentPlanStatusLabel("archived", t),
      tone: "gray",
      iconTone: "archived",
    };
  }
  return {
    label: getTreatmentPlanStatusLabel("active", t),
    tone: "success",
    iconTone: "active",
  };
}

export function buildTreatmentPlanFilters(t = null) {
  return TREATMENT_PLAN_FILTER_IDS.map((id) => ({
    id,
    label: translateKey(t, FILTER_LABEL_KEY_BY_ID[id], EN_FILTER_LABEL[id]),
  }));
}

export function buildTreatmentPlanStatusOptions(t = null) {
  return TREATMENT_PLAN_STATUS_VALUES.map((id) => ({
    id,
    label: getTreatmentPlanStatusLabel(id, t),
  }));
}

export function getTreatmentPlanValidationMessage(key, t = null) {
  const messageKey = VALIDATION_KEY_MAP[key];
  if (messageKey) {
    return translateKey(t, messageKey, EN_VALIDATION_MESSAGE[key]);
  }
  return key || "";
}

export function resolveTreatmentPlanFieldErrors(validationKey, t = null) {
  if (!validationKey) {
    return {};
  }

  switch (validationKey) {
    case TREATMENT_PLAN_VALIDATION_KEYS.PATIENT_REQUIRED:
      return { patient: getTreatmentPlanValidationMessage(validationKey, t) };
    case TREATMENT_PLAN_VALIDATION_KEYS.TITLE_REQUIRED:
      return { title: getTreatmentPlanValidationMessage(validationKey, t) };
    case TREATMENT_PLAN_VALIDATION_KEYS.START_DATE_REQUIRED:
      return { startDate: getTreatmentPlanValidationMessage(validationKey, t) };
    case TREATMENT_PLAN_VALIDATION_KEYS.END_DATE_BEFORE_START:
      return { endDate: getTreatmentPlanValidationMessage(validationKey, t) };
    default:
      return { form: getTreatmentPlanValidationMessage(validationKey, t) || validationKey };
  }
}

export function formatTreatmentPlanDisplayDate(value, locale = "en", t = null) {
  const dateOnly = parseDateOnlyValue(value);
  if (!dateOnly) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const [year, month, day] = dateOnly.split("-").map(Number);
  const formatted = formatAppDate(new Date(year, month - 1, day), locale);
  return formatted || translateKey(t, "parent.common.emptyDisplay", "—");
}

export function formatTreatmentPlanDateRange(startDate, endDate, locale = "en", t = null) {
  const startLabel = formatTreatmentPlanDisplayDate(startDate, locale, t);
  const endLabel = formatTreatmentPlanDisplayDate(endDate, locale, t);
  const separator = translateKey(t, "specialist.treatmentPlans.dateRangeSeparator", " → ");

  if (!endDate) {
    return startLabel;
  }

  return `${startLabel}${separator}${endLabel}`;
}

export function applyTreatmentPlanListItemLocalization(plan, { t = null, locale = "en" } = {}) {
  if (!plan) {
    return plan;
  }

  const statusMeta = getTreatmentPlanStatusMeta(plan.status, t);

  return {
    ...plan,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    iconTone: statusMeta.iconTone,
    startDateLabel: formatTreatmentPlanDisplayDate(plan.startDate, locale, t),
    endDateLabel: formatTreatmentPlanDisplayDate(plan.endDate, locale, t),
    dateRangeLabel: formatTreatmentPlanDateRange(plan.startDate, plan.endDate, locale, t),
  };
}

export function applyTreatmentPlanGoalsLocalization(goals, { t = null } = {}) {
  if (!Array.isArray(goals)) {
    return [];
  }

  return goals.map((goal) => ({
    ...goal,
    termLabel: getPatientGoalTermLabel(goal.term, t),
  }));
}

export function validateTreatmentPlanForm({
  patientId,
  title,
  startDate,
  endDate,
}) {
  if (!patientId?.trim()) {
    return TREATMENT_PLAN_VALIDATION_KEYS.PATIENT_REQUIRED;
  }
  if (!title?.trim()) {
    return TREATMENT_PLAN_VALIDATION_KEYS.TITLE_REQUIRED;
  }
  if (!startDate) {
    return TREATMENT_PLAN_VALIDATION_KEYS.START_DATE_REQUIRED;
  }
  if (endDate && endDate < startDate) {
    return TREATMENT_PLAN_VALIDATION_KEYS.END_DATE_BEFORE_START;
  }
  return null;
}

export function validateTreatmentPlanEditForm({ title, startDate, endDate }) {
  if (!title?.trim()) {
    return TREATMENT_PLAN_VALIDATION_KEYS.TITLE_REQUIRED;
  }
  if (!startDate) {
    return TREATMENT_PLAN_VALIDATION_KEYS.START_DATE_REQUIRED;
  }
  if (endDate && endDate < startDate) {
    return TREATMENT_PLAN_VALIDATION_KEYS.END_DATE_BEFORE_START;
  }
  return null;
}
