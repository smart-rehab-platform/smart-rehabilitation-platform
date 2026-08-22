/** Regular (manual) report creation — mirrors Flutter SpecialistCreateReportSheet / POST /reports. */

export const REGULAR_REPORT_TYPES = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  ASSESSMENT: "assessment",
  PROGRESS: "progress",
};

export const REGULAR_REPORT_TYPE_VALUES = Object.values(REGULAR_REPORT_TYPES);

export const REGULAR_REPORT_CREATION_VALIDATION_KEYS = {
  PATIENT_REQUIRED: "specialist.reports.create.errors.patientRequired",
  REPORT_TYPE_REQUIRED: "specialist.reports.create.errors.reportTypeRequired",
  TITLE_MAX_LENGTH: "specialist.reports.create.errors.titleMaxLength",
};

const VALIDATION_FALLBACKS = {
  [REGULAR_REPORT_CREATION_VALIDATION_KEYS.PATIENT_REQUIRED]: "Patient is required.",
  [REGULAR_REPORT_CREATION_VALIDATION_KEYS.REPORT_TYPE_REQUIRED]:
    "report_type must be weekly, monthly, assessment, or progress",
  [REGULAR_REPORT_CREATION_VALIDATION_KEYS.TITLE_MAX_LENGTH]:
    "title must be 200 characters or fewer",
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

export function normalizeRegularReportType(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return REGULAR_REPORT_TYPE_VALUES.includes(normalized) ? normalized : null;
}

/** Regular/manual report summary — preserve specialist text exactly (trim only). */
export function normalizeRegularReportSummary(raw) {
  if (raw == null) {
    return "";
  }
  if (typeof raw === "string") {
    return raw.trim();
  }
  return String(raw).trim();
}

/**
 * Backend create body. Omits empty optional fields and never sends
 * generated_by, specialist_id, pdf_url, period, or status.
 */
export function buildRegularReportCreatePayload({
  patientId,
  reportType,
  title,
  summary,
}) {
  const body = {
    patient_id: String(patientId || "").trim(),
    report_type: normalizeRegularReportType(reportType),
  };

  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (trimmedTitle) {
    body.title = trimmedTitle;
  }

  const trimmedSummary = typeof summary === "string" ? summary.trim() : "";
  if (trimmedSummary) {
    body.summary = trimmedSummary;
  }

  return body;
}

/** Client-side validation mirroring backend POST /reports rules. Returns null when valid. */
export function validateSpecialistRegularReportCreation({
  patientId,
  reportType,
  title,
  summary,
  t = null,
} = {}) {
  const messageFor = (key) => translateKey(t, key, VALIDATION_FALLBACKS[key]);

  if (!patientId || !String(patientId).trim()) {
    return messageFor(REGULAR_REPORT_CREATION_VALIDATION_KEYS.PATIENT_REQUIRED);
  }

  if (!normalizeRegularReportType(reportType)) {
    return messageFor(REGULAR_REPORT_CREATION_VALIDATION_KEYS.REPORT_TYPE_REQUIRED);
  }

  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (trimmedTitle.length > 200) {
    return messageFor(REGULAR_REPORT_CREATION_VALIDATION_KEYS.TITLE_MAX_LENGTH);
  }

  // Summary is optional with no max length. Empty after trim is omitted at serialization.
  void summary;

  return null;
}
