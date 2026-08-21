import { formatAppDate } from "../../../i18n/formatters.js";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig.js";
import { buildAiReportDetailSections } from "./specialistAiReportStructuredSummary.js";

export const SPECIALIST_REPORT_FILTERS = [
  { id: "all" },
  { id: "weekly" },
  { id: "monthly" },
  { id: "assessment" },
  { id: "aiReports" },
  { id: "recent" },
];

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

function parseDateValue(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatReportType(value) {
  const text = (value || "").trim();
  if (!text) {
    return "Report";
  }
  return text
    .replace(/_/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function cleanEmbeddedPatientTitle(rawTitle) {
  const trimmed = (rawTitle || "").trim();
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

export function standardizedReportTitle({ isAiReport, reportType, rawTitle }) {
  const type = (reportType || "").trim().toLowerCase().replace(/\s+/g, "_");

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
    return `AI ${formatReportType(type)} Summary`;
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
  if (!type) {
    return cleanEmbeddedPatientTitle(rawTitle) || "Progress Report";
  }
  return cleanEmbeddedPatientTitle(rawTitle) || `${formatReportType(type)} Report`;
}

function formatJsonSummary(value) {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value.map(formatJsonSummary).filter(Boolean).join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, entryValue]) => {
        const formatted = formatJsonSummary(entryValue);
        return formatted ? `${key}: ${formatted}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(value).trim();
}

export function normalizeReportSummary(raw) {
  if (raw == null) {
    return "";
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return "";
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return formatJsonSummary(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof raw === "object") {
    return formatJsonSummary(raw);
  }
  const text = String(raw).trim();
  return text;
}

function resolveTypeLabel({ isAiReport, reportType }) {
  if (isAiReport) {
    const type = (reportType || "").trim();
    if (!type) {
      return "AI Report";
    }
    return `AI ${formatReportType(type)}`;
  }
  return formatReportType(reportType);
}

function isRecentReport(date) {
  if (!date) {
    return false;
  }
  const diffMs = Date.now() - date.getTime();
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

export function matchesReportFilter(report, filterId) {
  const normalizedType = (report.reportType || "").trim().toLowerCase();
  switch (filterId) {
    case "all":
      return true;
    case "weekly":
      return normalizedType === "weekly";
    case "monthly":
      return normalizedType === "monthly";
    case "assessment":
      return normalizedType === "assessment";
    case "aiReports":
      return report.isAi;
    case "recent":
      return isRecentReport(report.date);
    default:
      return true;
  }
}

export function formatReportDateLabel(dateValue, locale = "en") {
  const date = parseDateValue(dateValue);
  if (!date) {
    return "—";
  }
  return formatAppDate(date, locale) ?? "—";
}

export function mapRegularReportRow(row, patientNameMap = null) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const patientId = readString(row, ["patient_id", "patientId"]);
  const reportType = readString(row, ["report_type", "reportType"]);
  const rawTitle = readString(row, ["title"]) || "Report";
  const patientName = readString(row, ["patient_name", "patientName"])
    || patientNameMap?.get(patientId)
    || null;
  const createdAt = parseDateValue(row.created_at ?? row.createdAt);
  const pdfUrlRaw = readString(row, ["pdf_url", "pdfUrl"]);

  return {
    id,
    sourceType: "standard",
    patientId,
    patientName: patientName || "Patient",
    title: standardizedReportTitle({
      isAiReport: false,
      reportType,
      rawTitle,
    }),
    reportType,
    categoryLabel: formatReportType(reportType),
    typeBadgeLabel: formatReportType(reportType),
    summary: normalizeReportSummary(row.summary),
    date: createdAt,
    dateLabel: formatReportDateLabel(createdAt),
    pdfUrl: pdfUrlRaw ? resolveUploadedAssetUrl(pdfUrlRaw) : null,
    isAi: false,
    isPdfReady: Boolean(pdfUrlRaw?.trim()),
    specialistName: readString(row, ["generated_by_name", "generatedByName", "specialist_name"]),
  };
}

export function mapAiReportRow(row, patientNameMap = null) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }
  const patientId = readString(row, ["patient_id", "patientId"]);
  const reportType = readString(row, ["type", "report_type", "reportType"]);
  const rawTitle = readString(row, ["title"]);
  const patientName = readString(row, ["patient_name", "patientName"])
    || patientNameMap?.get(patientId)
    || null;
  const createdAt = parseDateValue(row.generated_at ?? row.created_at ?? row.createdAt);
  const pdfUrlRaw = readString(row, ["pdf_url", "pdfUrl"]);

  return {
    id,
    sourceType: "ai",
    patientId,
    patientName: patientName || "Patient",
    title: standardizedReportTitle({
      isAiReport: true,
      reportType,
      rawTitle,
    }),
    reportType,
    categoryLabel: resolveTypeLabel({ isAiReport: true, reportType }),
    typeBadgeLabel: resolveTypeLabel({ isAiReport: true, reportType }),
    summary: normalizeReportSummary(row.summary),
    date: createdAt,
    dateLabel: formatReportDateLabel(createdAt),
    pdfUrl: pdfUrlRaw ? resolveUploadedAssetUrl(pdfUrlRaw) : null,
    isAi: true,
    isPdfReady: Boolean(pdfUrlRaw?.trim()),
    specialistName: readString(row, ["generated_by_name", "generatedByName", "specialist_name"]),
    language: (() => {
      const direct = readString(row, ["language", "locale"]);
      if (direct) {
        const primary = direct.toLowerCase().replace(/_/g, "-").split("-")[0];
        return primary === "ar" ? "ar" : "en";
      }
      try {
        const raw = row.summary;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const fromSummary = parsed?.language;
        if (typeof fromSummary === "string") {
          const primary = fromSummary.toLowerCase().replace(/_/g, "-").split("-")[0];
          return primary === "ar" ? "ar" : "en";
        }
      } catch {
        // ignore
      }
      return "en";
    })(),
    periodStart: parseDateValue(row.period_start ?? row.periodStart),
    periodEnd: parseDateValue(row.period_end ?? row.periodEnd),
  };
}

export function mapRegularReportDetail(row) {
  const listItem = mapRegularReportRow(row);
  if (!listItem) {
    return null;
  }
  return {
    ...listItem,
    sections: listItem.summary
      ? [{ title: "Summary", content: listItem.summary }]
      : [],
  };
}

export function mapAiReportDetail(row) {
  const listItem = mapAiReportRow(row);
  if (!listItem) {
    return null;
  }

  const { aiStructuredSummary, sections } = buildAiReportDetailSections(
    row.summary,
    listItem.summary,
  );

  return {
    ...listItem,
    aiStructuredSummary,
    sections,
  };
}

export function buildPatientNameMap(patientRows) {
  const map = new Map();
  (patientRows || []).forEach((row) => {
    const id = readString(row, ["id", "_id", "patient_id", "patientId"]);
    const name = readString(row, ["full_name", "fullName", "name", "patient_name", "patientName"]);
    if (id && name) {
      map.set(id, name);
    }
  });
  return map;
}

export function sortReportsNewestFirst(reports) {
  return [...reports].sort((a, b) => {
    const aTime = a.date?.getTime() ?? 0;
    const bTime = b.date?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export function filterVisibleReports(reports, { filterId, searchQuery }) {
  const query = (searchQuery || "").trim().toLowerCase();
  return reports.filter((report) => {
    if (!matchesReportFilter(report, filterId)) {
      return false;
    }
    if (!query) {
      return true;
    }
    const searchableTitle = (report.titleLabel || report.title || "").toLowerCase();
    return searchableTitle.includes(query)
      || (report.patientName || "").toLowerCase().includes(query);
  });
}
