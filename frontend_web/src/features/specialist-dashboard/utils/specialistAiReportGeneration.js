export const AI_REPORT_TYPES = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

export const AI_REPORT_GENERATION_VALIDATION_KEYS = {
  PATIENT_REQUIRED: "specialist.reports.generate.errors.patientRequired",
  REPORT_TYPE_REQUIRED: "specialist.reports.generate.errors.reportTypeRequired",
  PERIOD_START_REQUIRED: "specialist.reports.generate.errors.periodStartRequired",
  PERIOD_END_REQUIRED: "specialist.reports.generate.errors.periodEndRequired",
  PERIOD_START_AFTER_END: "specialist.reports.generate.errors.periodStartAfterEnd",
  PERIOD_NOT_ENDED: "specialist.reports.generate.errors.periodNotEnded",
};

const VALIDATION_FALLBACKS = {
  [AI_REPORT_GENERATION_VALIDATION_KEYS.PATIENT_REQUIRED]: "Patient is required.",
  [AI_REPORT_GENERATION_VALIDATION_KEYS.REPORT_TYPE_REQUIRED]: "Report type must be weekly or monthly.",
  [AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_START_REQUIRED]: "Start date is required.",
  [AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_END_REQUIRED]: "End date is required.",
  [AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_START_AFTER_END]: "period_start cannot be after period_end",
  [AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_NOT_ENDED]: "Cannot generate report for a period that has not ended yet",
};

function translateKey(t, key, fallback) {
  if (typeof t === "function") {
    const translated = t(key);
    if (translated && translated !== key) {
      return translated;
    }
  }
  return fallback;
}

function readDateParts(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      };
    }
  }

  return null;
}

/** Calendar date only from local parts (no UTC conversion). */
export function specialistAiReportDateOnly(value) {
  const parts = readDateParts(value);
  if (!parts) {
    return null;
  }
  return new Date(parts.year, parts.month - 1, parts.day);
}

/** YYYY-MM-DD from local date parts. */
export function formatSpecialistAiReportDate(value) {
  const parts = readDateParts(value);
  if (!parts) {
    return "";
  }
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

export function defaultWeeklyAiReportPeriod(now = new Date()) {
  const end = specialistAiReportDateOnly(now);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
  return {
    start: formatSpecialistAiReportDate(start),
    end: formatSpecialistAiReportDate(end),
  };
}

export function defaultMonthlyAiReportPeriod(now = new Date()) {
  const end = specialistAiReportDateOnly(now);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
  return {
    start: formatSpecialistAiReportDate(start),
    end: formatSpecialistAiReportDate(end),
  };
}

export function defaultPeriodForSpecialistAiReportType(reportType, now = new Date()) {
  if (reportType === AI_REPORT_TYPES.MONTHLY) {
    return defaultMonthlyAiReportPeriod(now);
  }
  return defaultWeeklyAiReportPeriod(now);
}

export function resolveAiReportGeneratePath(reportType) {
  if (reportType === AI_REPORT_TYPES.MONTHLY) {
    return "/ai/reports/generate-monthly";
  }
  if (reportType === AI_REPORT_TYPES.WEEKLY) {
    return "/ai/reports/generate-weekly";
  }
  return null;
}

export function normalizeAiReportLanguage(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase().replace(/_/g, "-") : "";
  const primary = normalized.split("-")[0];
  if (primary === "ar") {
    return "ar";
  }
  return "en";
}

export function buildAiReportGeneratePayload({
  patientId,
  reportType,
  periodStart,
  periodEnd,
  language,
}) {
  return {
    patient_id: String(patientId || "").trim(),
    period_start: formatSpecialistAiReportDate(periodStart),
    period_end: formatSpecialistAiReportDate(periodEnd),
    language: normalizeAiReportLanguage(language),
    reportType,
  };
}

export function validateSpecialistAiReportGeneration({
  patientId,
  reportType,
  periodStart,
  periodEnd,
  now = new Date(),
  t = null,
} = {}) {
  const messageFor = (key) => translateKey(t, key, VALIDATION_FALLBACKS[key]);

  if (!patientId || !String(patientId).trim()) {
    return messageFor(AI_REPORT_GENERATION_VALIDATION_KEYS.PATIENT_REQUIRED);
  }

  if (reportType !== AI_REPORT_TYPES.WEEKLY && reportType !== AI_REPORT_TYPES.MONTHLY) {
    return messageFor(AI_REPORT_GENERATION_VALIDATION_KEYS.REPORT_TYPE_REQUIRED);
  }

  if (!periodStart) {
    return messageFor(AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_START_REQUIRED);
  }

  if (!periodEnd) {
    return messageFor(AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_END_REQUIRED);
  }

  const start = specialistAiReportDateOnly(periodStart);
  const end = specialistAiReportDateOnly(periodEnd);
  const today = specialistAiReportDateOnly(now);

  if (!start || !end || !today) {
    return messageFor(AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_START_REQUIRED);
  }

  if (start.getTime() > end.getTime()) {
    return messageFor(AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_START_AFTER_END);
  }

  if (end.getTime() > today.getTime()) {
    return messageFor(AI_REPORT_GENERATION_VALIDATION_KEYS.PERIOD_NOT_ENDED);
  }

  return null;
}
