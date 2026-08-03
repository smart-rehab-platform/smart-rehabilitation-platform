import {
  readString,
  resolveReportFileUrl,
} from "./parentDashboardMappers";

const REPORT_TIMESTAMP_KEYS = [
  "created_at",
  "createdAt",
  "generated_at",
  "generatedAt",
];

function formatDisplayDate(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function readTimestampValue(entity, keys) {
  if (!entity || typeof entity !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = entity[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

/** Confirmed backend report_type values and friendly labels. */
export const REPORT_TYPE_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  assessment: "Assessment",
  progress: "Progress",
};

export const REPORT_SORT_OPTIONS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "childName", label: "Child name" },
  { id: "reportType", label: "Report type" },
];

export const REPORT_EMPTY_MESSAGES = {
  none: "No reports available yet.",
  filtered: "No reports match your filters.",
};

const SUMMARY_SECTION_DEFS = [
  { key: "executive_summary", label: "Executive summary" },
  { key: "patient_progress_summary", label: "Patient progress" },
  { key: "speech_analysis_summary", label: "Speech analysis" },
  { key: "exercise_adherence_summary", label: "Exercise adherence" },
  { key: "goal_progress_summary", label: "Goal progress" },
];

const SUMMARY_LIST_DEFS = [
  { key: "clinical_insights", label: "Clinical insights" },
  { key: "risks_or_regressions", label: "Risks or regressions" },
  { key: "recommendations", label: "Recommendations" },
  { key: "next_steps", label: "Next steps" },
];

/**
 * @param {string|null|undefined} reportType
 */
export function getReportTypeLabel(reportType) {
  if (!reportType) {
    return null;
  }

  const normalized = reportType.trim().toLowerCase();
  if (REPORT_TYPE_LABELS[normalized]) {
    return REPORT_TYPE_LABELS[normalized];
  }

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * @param {string} summary
 */
function truncateSummary(summary, maxLength = 160) {
  const trimmed = summary.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

/**
 * @param {Record<string, string>|null|undefined} childNameByPatientId
 * @param {Record<string, unknown>} reportRow
 */
export function mapReportRowToHubItem(reportRow, childNameByPatientId = null) {
  const id = readString(reportRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const patientId = readString(reportRow, ["patient_id", "patientId"]);
  const timestampValue = readTimestampValue(reportRow, REPORT_TIMESTAMP_KEYS);
  const parsedMs = timestampValue ? Date.parse(timestampValue) : Number.NaN;
  const reportType = readString(reportRow, ["report_type", "reportType", "type"]);
  const summaryRaw = readString(reportRow, ["summary", "description", "content"]);
  const pdfUrl = resolveReportFileUrl(
    readString(reportRow, ["pdf_url", "pdfUrl", "file_url", "fileUrl"]),
  );

  const childName = readString(reportRow, ["patient_name", "patientName"])
    || (patientId && childNameByPatientId?.[patientId])
    || null;

  return {
    id,
    patientId,
    childName,
    title: readString(reportRow, ["title", "report_title", "name"]),
    reportType,
    reportTypeLabel: getReportTypeLabel(reportType),
    generatedDate: formatDisplayDate(timestampValue),
    generatedAtMs: Number.isFinite(parsedMs) ? parsedMs : null,
    authorName: readString(reportRow, [
      "generated_by_name",
      "generatedByName",
      "author_name",
      "authorName",
    ]),
    summaryPreview: summaryRaw ? truncateSummary(summaryRaw) : null,
    summaryRaw,
    pdfUrl,
    hasFile: Boolean(pdfUrl),
  };
}

/**
 * @param {Array<Record<string, unknown>>} reportRows
 * @param {Record<string, string>|null|undefined} childNameByPatientId
 */
export function mapReportRowsToHubItems(reportRows, childNameByPatientId = null) {
  if (!Array.isArray(reportRows)) {
    return [];
  }

  return reportRows
    .map((row) => mapReportRowToHubItem(row, childNameByPatientId))
    .filter(Boolean);
}

/**
 * @param {Array<{ reportType?: string|null }>} reports
 */
export function buildReportTypeFilterOptions(reports) {
  const typeSet = new Set();

  reports.forEach((report) => {
    if (report.reportType) {
      typeSet.add(report.reportType);
    }
  });

  const options = [{ id: "all", label: "All types" }];
  [...typeSet]
    .sort((left, right) => getReportTypeLabel(left).localeCompare(getReportTypeLabel(right)))
    .forEach((type) => {
      options.push({ id: type, label: getReportTypeLabel(type) });
    });

  return options;
}

/**
 * @param {Array<Record<string, unknown>>} reports
 * @param {{ search?: string, childId?: string, reportType?: string }} filters
 */
export function filterReports(reports, filters) {
  const search = filters.search?.trim().toLowerCase() || "";
  const childId = filters.childId || "all";
  const reportType = filters.reportType || "all";

  return reports.filter((report) => {
    if (childId !== "all" && report.patientId !== childId) {
      return false;
    }

    if (reportType !== "all" && report.reportType !== reportType) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      report.title,
      report.childName,
      report.authorName,
      report.reportTypeLabel,
      report.summaryPreview,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

/**
 * @param {Array<Record<string, unknown>>} reports
 * @param {string} sortKey
 */
export function sortReports(reports, sortKey) {
  const copy = [...reports];

  if (sortKey === "oldest") {
    return copy.sort((left, right) => compareByDate(left, right, "asc"));
  }

  if (sortKey === "childName") {
    return copy.sort((left, right) => {
      const nameCompare = String(left.childName || "").localeCompare(String(right.childName || ""));
      if (nameCompare !== 0) {
        return nameCompare;
      }

      return compareByDate(left, right, "desc");
    });
  }

  if (sortKey === "reportType") {
    return copy.sort((left, right) => {
      const typeCompare = String(left.reportTypeLabel || "").localeCompare(String(right.reportTypeLabel || ""));
      if (typeCompare !== 0) {
        return typeCompare;
      }

      return compareByDate(left, right, "desc");
    });
  }

  return copy.sort((left, right) => compareByDate(left, right, "desc"));
}

function compareByDate(left, right, direction) {
  const leftMs = left.generatedAtMs ?? (direction === "desc" ? -1 : Number.MAX_SAFE_INTEGER);
  const rightMs = right.generatedAtMs ?? (direction === "desc" ? -1 : Number.MAX_SAFE_INTEGER);

  if (leftMs !== rightMs) {
    return direction === "desc" ? rightMs - leftMs : leftMs - rightMs;
  }

  return String(left.title || "").localeCompare(String(right.title || ""));
}

/**
 * @param {string|null|undefined} summaryRaw
 */
export function normalizeReportSummary(summaryRaw) {
  if (!summaryRaw || typeof summaryRaw !== "string") {
    return { plainText: null, sections: [], listSections: [] };
  }

  const trimmed = summaryRaw.trim();
  if (!trimmed) {
    return { plainText: null, sections: [], listSections: [] };
  }

  if (!trimmed.startsWith("{")) {
    return { plainText: trimmed, sections: [], listSections: [] };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { plainText: trimmed, sections: [], listSections: [] };
    }

    const sections = SUMMARY_SECTION_DEFS
      .map(({ key, label }) => {
        const value = readString(parsed, [key]);
        return value ? { label, value } : null;
      })
      .filter(Boolean);

    const listSections = SUMMARY_LIST_DEFS
      .map(({ key, label }) => {
        const items = parsed[key];
        if (!Array.isArray(items) || items.length === 0) {
          return null;
        }

        const normalizedItems = items
          .map((item) => (typeof item === "string" ? item.trim() : null))
          .filter(Boolean);

        return normalizedItems.length > 0 ? { label, items: normalizedItems } : null;
      })
      .filter(Boolean);

    if (sections.length === 0 && listSections.length === 0) {
      return { plainText: trimmed, sections: [], listSections: [] };
    }

    return { plainText: null, sections, listSections };
  } catch {
    return { plainText: trimmed, sections: [], listSections: [] };
  }
}

/**
 * @param {string} url
 */
export function openReportFileUrl(url) {
  if (!url) {
    throw new Error("Report file is unavailable.");
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
