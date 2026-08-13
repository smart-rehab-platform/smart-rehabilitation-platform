import { resolveUploadedAssetUrl } from "../../../services/apiConfig";

/** Flutter SpecialistReportFilter order. */
export const ADMIN_REPORT_FILTERS = Object.freeze([
  { id: "all", label: "All" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "assessment", label: "Assessment" },
  { id: "aiReports", label: "AI Reports" },
  { id: "recent", label: "Recent" },
]);

export const ADMIN_REPORT_FILTER_IDS = Object.freeze(
  ADMIN_REPORT_FILTERS.map((item) => item.id),
);

function readString(source, keys) {
  if (!source || typeof source !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function readOptionalString(source, keys) {
  const value = readString(source, keys);
  return value || null;
}

function parseDateValue(value) {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string" && value.trim()) {
    const date = new Date(value.trim());
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatReportTypeLabel(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    return "Report";
  }

  return text
    .replaceAll("_", " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function cleanEmbeddedPatientTitle(rawTitle) {
  const trimmed = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    const left = parts[0].trim();
    if (left) {
      const normalized = left.toLowerCase();
      if (normalized.includes("weekly")) {
        return "Weekly Progress Report";
      }
      if (normalized.includes("monthly")) {
        return "Monthly Progress Report";
      }
      if (normalized.includes("assessment")) {
        return "Assessment Report";
      }
      if (normalized.startsWith("ai ")) {
        return left;
      }
      return left;
    }
  }

  return trimmed;
}

/**
 * Flutter `standardizedReportTitle` parity.
 */
export function getAdminReportTitle({ isAiReport, reportType, rawTitle } = {}) {
  const type = String(reportType ?? "")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_");

  if (isAiReport) {
    if (type === "weekly") {
      return "AI Weekly Summary";
    }
    if (type === "monthly") {
      return "AI Monthly Summary";
    }
    if (type === "clinical" || type === "clinical_summary" || type === "summary" || type === "") {
      return "AI Clinical Summary";
    }
    if (type === "assessment") {
      return "AI Assessment Summary";
    }
    return `AI ${formatReportTypeLabel(type)} Summary`;
  }

  if (type === "weekly") {
    return "Weekly Progress Report";
  }
  if (type === "monthly") {
    return "Monthly Progress Report";
  }
  if (type === "assessment") {
    return "Assessment Report";
  }
  if (type === "") {
    return cleanEmbeddedPatientTitle(rawTitle) ?? "Progress Report";
  }

  return cleanEmbeddedPatientTitle(rawTitle) ?? `${formatReportTypeLabel(type)} Report`;
}

/**
 * Flutter SpecialistReportSummary.normalize parity.
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizeAdminReportSummary(raw) {
  if (raw == null) {
    return null;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const formatted = formatSummaryJson(JSON.parse(trimmed));
        return formatted || null;
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (typeof raw === "object") {
    const formatted = formatSummaryJson(raw);
    return formatted || null;
  }

  const text = String(raw).trim();
  return text || null;
}

function formatSummaryJson(value) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map(formatSummaryJson)
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    const lines = [];
    for (const [key, entryValue] of Object.entries(value)) {
      const formatted = formatSummaryJson(entryValue);
      if (!formatted) {
        continue;
      }
      lines.push(`${key}: ${formatted}`);
    }
    return lines.join("\n");
  }

  return String(value).trim();
}

export function getAdminReportTypeLabel(reportType, isAiReport = false) {
  const type = typeof reportType === "string" ? reportType.trim() : "";

  if (isAiReport) {
    if (!type) {
      return "AI Report";
    }
    return `AI ${formatReportTypeLabel(type)}`;
  }

  return formatReportTypeLabel(type || null);
}

export function getAdminReportPdfStatusLabel(hasPdf) {
  return hasPdf ? "PDF Ready" : null;
}

export function formatAdminReportDate(value) {
  const date = parseDateValue(value);
  if (!date) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

function buildPdfFields(rawPdfUrl) {
  const pdfUrl = typeof rawPdfUrl === "string" && rawPdfUrl.trim()
    ? rawPdfUrl.trim()
    : null;
  const pdfResolvedUrl = pdfUrl ? resolveUploadedAssetUrl(pdfUrl) : null;
  const hasPdf = Boolean(pdfUrl);

  return { pdfUrl, pdfResolvedUrl, hasPdf };
}

function normalizeCreatedAtIso(date) {
  if (!date) {
    return null;
  }
  return date.toISOString();
}

/**
 * @param {object} row
 * @returns {object|null}
 */
export function mapAdminRegularReport(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const reportType = readOptionalString(row, ["report_type", "reportType"]);
  const rawTitle = readOptionalString(row, ["title"]);
  const createdAtDate = parseDateValue(row.created_at ?? row.createdAt);
  const pdf = buildPdfFields(readOptionalString(row, ["pdf_url", "pdfUrl"]));

  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]) || null,
    patientName: readOptionalString(row, ["patient_name", "patientName"]),
    specialistId: readOptionalString(row, ["generated_by", "generatedBy", "specialist_id", "specialistId"]),
    specialistName: readOptionalString(row, [
      "generated_by_name",
      "generatedByName",
      "specialist_name",
      "specialistName",
    ]),
    reportType,
    reportTypeLabel: getAdminReportTypeLabel(reportType, false),
    title: getAdminReportTitle({
      isAiReport: false,
      reportType,
      rawTitle: rawTitle ?? "Report",
    }),
    summary: normalizeAdminReportSummary(row.summary),
    ...pdf,
    createdAt: normalizeCreatedAtIso(createdAtDate),
    periodStart: null,
    periodEnd: null,
    isAiReport: false,
  };
}

/**
 * @param {object} row
 * @returns {object|null}
 */
export function mapAdminAiReport(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const reportType = readOptionalString(row, ["type", "report_type", "reportType"]);
  const rawTitle = readOptionalString(row, ["title"]);
  const createdAtDate = parseDateValue(
    row.generated_at ?? row.generatedAt ?? row.created_at ?? row.createdAt,
  );
  const pdf = buildPdfFields(readOptionalString(row, ["pdf_url", "pdfUrl"]));

  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]) || null,
    patientName: readOptionalString(row, ["patient_name", "patientName"]),
    specialistId: null,
    specialistName: null,
    reportType,
    reportTypeLabel: getAdminReportTypeLabel(reportType, true),
    title: getAdminReportTitle({
      isAiReport: true,
      reportType,
      rawTitle,
    }),
    summary: normalizeAdminReportSummary(row.summary),
    ...pdf,
    createdAt: normalizeCreatedAtIso(createdAtDate),
    periodStart: normalizeCreatedAtIso(parseDateValue(row.period_start ?? row.periodStart)),
    periodEnd: normalizeCreatedAtIso(parseDateValue(row.period_end ?? row.periodEnd)),
    isAiReport: true,
  };
}

/**
 * Maps a list/detail row using an explicit source flag.
 * @param {object} row
 * @param {boolean} isAiReport
 */
export function mapAdminReport(row, isAiReport) {
  if (typeof isAiReport !== "boolean") {
    return null;
  }

  return isAiReport ? mapAdminAiReport(row) : mapAdminRegularReport(row);
}

/**
 * Maps POST export-pdf response `{ report, pdf_url }`.
 * @param {object|null} exportData
 * @param {boolean} isAiReport
 */
export function mapAdminReportExportResult(exportData, isAiReport) {
  if (!exportData || typeof exportData !== "object") {
    return null;
  }

  const reportRow = exportData.report && typeof exportData.report === "object"
    ? exportData.report
    : null;

  if (!reportRow) {
    return null;
  }

  const mapped = mapAdminReport(reportRow, isAiReport);
  if (!mapped) {
    return null;
  }

  const exportPdfUrl = readOptionalString(exportData, ["pdf_url", "pdfUrl"]);
  if (exportPdfUrl && !mapped.pdfUrl) {
    const pdf = buildPdfFields(exportPdfUrl);
    return { ...mapped, ...pdf };
  }

  return mapped;
}

export function mergeAndSortAdminReports(regularReports = [], aiReports = []) {
  const merged = [
    ...(Array.isArray(regularReports) ? regularReports : []),
    ...(Array.isArray(aiReports) ? aiReports : []),
  ].filter(Boolean);

  return merged.slice().sort((left, right) => {
    const leftTime = parseDateValue(left.createdAt)?.getTime() ?? 0;
    const rightTime = parseDateValue(right.createdAt)?.getTime() ?? 0;
    return rightTime - leftTime;
  });
}

export function filterAdminReportsBySearch(reports, query) {
  const list = Array.isArray(reports) ? reports : [];
  const normalized = typeof query === "string" ? query.trim().toLowerCase() : "";

  if (!normalized) {
    return list;
  }

  return list.filter((report) => {
    const title = String(report?.title ?? "").toLowerCase();
    const patientName = String(report?.patientName ?? "").toLowerCase();
    return title.includes(normalized) || patientName.includes(normalized);
  });
}

function isRecentReport(report) {
  const date = parseDateValue(report?.createdAt);
  if (!date) {
    return false;
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return true;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return diffDays <= 7;
}

export function filterAdminReportsByType(reports, filter) {
  const list = Array.isArray(reports) ? reports : [];
  const selected = typeof filter === "string" ? filter.trim() : "all";

  if (!selected || selected === "all") {
    return list;
  }

  return list.filter((report) => {
    const type = String(report?.reportType ?? "").trim().toLowerCase();

    if (selected === "weekly") {
      return type === "weekly";
    }
    if (selected === "monthly") {
      return type === "monthly";
    }
    if (selected === "assessment") {
      return type === "assessment";
    }
    if (selected === "aiReports") {
      return report?.isAiReport === true;
    }
    if (selected === "recent") {
      return isRecentReport(report);
    }

    return true;
  });
}

export function filterAdminReports(reports, { query = "", filter = "all" } = {}) {
  const searched = filterAdminReportsBySearch(reports, query);
  return filterAdminReportsByType(searched, filter);
}

export function serializeAdminReportSource(isAiReport) {
  return isAiReport === true ? "1" : "0";
}

/**
 * @param {unknown} value
 * @returns {{ valid: boolean, isAiReport: boolean|null }}
 */
export function parseAdminReportSource(value) {
  if (value === true || value === 1 || value === "1") {
    return { valid: true, isAiReport: true };
  }

  if (value === false || value === 0 || value === "0") {
    return { valid: true, isAiReport: false };
  }

  return { valid: false, isAiReport: null };
}
