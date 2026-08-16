import { formatAppDate } from "../../../i18n/formatters.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

export const REPORT_FILTER_IDS = ["all", "weekly", "monthly", "assessment", "aiReports", "recent"];

const REPORT_FILTER_KEY = {
  all: "specialist.reports.filters.all",
  weekly: "specialist.reports.filters.weekly",
  monthly: "specialist.reports.filters.monthly",
  assessment: "specialist.reports.filters.assessment",
  aiReports: "specialist.reports.filters.aiReports",
  recent: "specialist.reports.filters.recent",
};

const REPORT_FILTER_FALLBACK = {
  all: "All",
  weekly: "Weekly",
  monthly: "Monthly",
  assessment: "Assessment",
  aiReports: "AI Reports",
  recent: "Recent",
};

const REPORT_TYPE_KEY = {
  weekly: "specialist.reports.type.weekly",
  monthly: "specialist.reports.type.monthly",
  assessment: "specialist.reports.type.assessment",
  daily: "specialist.reports.type.daily",
  progress: "specialist.reports.type.progress",
  clinical: "specialist.reports.type.clinical",
  clinical_summary: "specialist.reports.type.clinical",
  summary: "specialist.reports.type.summary",
};

const REPORT_TYPE_FALLBACK = {
  weekly: "Weekly",
  monthly: "Monthly",
  assessment: "Assessment",
  daily: "Daily",
  progress: "Progress",
  clinical: "Clinical",
  clinical_summary: "Clinical",
  summary: "Summary",
};

const SECTION_TITLE_KEY = {
  Summary: "specialist.reports.sections.summary",
  "AI Summary": "specialist.reports.sections.aiSummary",
};

const SECTION_TITLE_FALLBACK = {
  Summary: "Summary",
  "AI Summary": "AI Summary",
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

function normalizeReportType(value) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function formatUnknownReportType(value) {
  const text = (value || "").trim();
  if (!text) {
    return "";
  }
  return text
    .replace(/_/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getReportFilterLabel(filterId, t = null) {
  const key = REPORT_FILTER_KEY[filterId];
  if (!key) {
    return filterId;
  }
  return translateKey(t, key, REPORT_FILTER_FALLBACK[filterId] ?? filterId);
}

export function buildReportFilterOptions(t = null) {
  return REPORT_FILTER_IDS.map((id) => ({
    id,
    label: getReportFilterLabel(id, t),
  }));
}

export function getReportTypeDisplayLabel(reportType, t = null) {
  const normalized = normalizeReportType(reportType);
  const key = REPORT_TYPE_KEY[normalized];
  if (key) {
    return translateKey(t, key, REPORT_TYPE_FALLBACK[normalized]);
  }
  if (!normalized) {
    return translateKey(t, "specialist.reports.type.report", "Report");
  }
  return formatUnknownReportType(reportType);
}

export function getReportDisplayTitle(report, t = null) {
  if (!report) {
    return "";
  }

  const type = normalizeReportType(report.reportType);

  if (report.isAi) {
    if (type === "weekly") {
      return translateKey(t, "specialist.reports.titleLabels.aiWeeklySummary", "AI Weekly Summary");
    }
    if (type === "monthly") {
      return translateKey(t, "specialist.reports.titleLabels.aiMonthlySummary", "AI Monthly Summary");
    }
    if (type === "clinical" || type === "clinical_summary" || type === "summary" || type === "") {
      return translateKey(t, "specialist.reports.titleLabels.aiClinicalSummary", "AI Clinical Summary");
    }
    if (type === "assessment") {
      return translateKey(t, "specialist.reports.titleLabels.aiAssessmentSummary", "AI Assessment Summary");
    }
    if (REPORT_TYPE_KEY[type]) {
      const typeLabel = getReportTypeDisplayLabel(report.reportType, t);
      return translateKey(
        t,
        "specialist.reports.titleLabels.aiTypeSummary",
        `AI ${formatUnknownReportType(type)} Summary`,
        { type: typeLabel },
      );
    }
    return report.title;
  }

  if (type === "weekly") {
    return translateKey(t, "specialist.reports.titleLabels.weeklyProgress", "Weekly Progress Report");
  }
  if (type === "monthly") {
    return translateKey(t, "specialist.reports.titleLabels.monthlyProgress", "Monthly Progress Report");
  }
  if (type === "assessment") {
    return translateKey(t, "specialist.reports.titleLabels.assessment", "Assessment Report");
  }
  if (!type) {
    return translateKey(t, "specialist.reports.titleLabels.progress", "Progress Report");
  }
  if (REPORT_TYPE_KEY[type]) {
    const typeLabel = getReportTypeDisplayLabel(report.reportType, t);
    return translateKey(
      t,
      "specialist.reports.titleLabels.typeReport",
      `${formatUnknownReportType(type)} Report`,
      { type: typeLabel },
    );
  }

  return report.title;
}

export function getReportTypeBadgeLabel(report, t = null) {
  if (!report) {
    return "";
  }

  const aiLabel = translateKey(t, "specialist.reports.type.ai", "AI");
  const type = normalizeReportType(report.reportType);

  if (report.isAi) {
    if (!type) {
      return translateKey(t, "specialist.reports.type.aiReport", "AI Report");
    }
    if (REPORT_TYPE_KEY[type]) {
      return `${aiLabel} ${getReportTypeDisplayLabel(report.reportType, t)}`;
    }
    return `${aiLabel} ${formatUnknownReportType(report.reportType)}`;
  }

  return getReportTypeDisplayLabel(report.reportType, t);
}

export function getReportPdfReadyLabel(t = null) {
  return translateKey(t, "specialist.reports.status.pdfReady", "PDF Ready");
}

export function getReportSectionTitleLabel(title, t = null) {
  const key = SECTION_TITLE_KEY[title];
  if (key) {
    return translateKey(t, key, SECTION_TITLE_FALLBACK[title] ?? title);
  }
  return title;
}

export function formatReportDateLabel(dateValue, locale = "en", t = null) {
  if (!dateValue) {
    return translateKey(t, "auth.shared.emptyDisplay", "—");
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "auth.shared.emptyDisplay", "—");
  }

  return formatAppDate(date, locale) ?? translateKey(t, "auth.shared.emptyDisplay", "—");
}

export function getReportsEmptyMessage({ isPatientScoped, hasFilter }, t = null) {
  if (hasFilter) {
    return translateKey(
      t,
      "specialist.reports.empty.filtered",
      "No reports match your current search or filter.",
    );
  }
  if (isPatientScoped) {
    return translateKey(
      t,
      "specialist.reports.empty.nonePatient",
      "No reports available for this patient yet.",
    );
  }
  return translateKey(t, "specialist.reports.empty.none", "No reports available yet.");
}

export function applyReportListItemLocalization(report, context = {}) {
  if (!report) {
    return report;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);

  return {
    ...report,
    titleLabel: getReportDisplayTitle(report, t),
    typeBadgeLabel: getReportTypeBadgeLabel(report, t),
    categoryLabel: getReportTypeDisplayLabel(report.reportType, t),
    dateLabel: formatReportDateLabel(report.date, locale, t),
    pdfReadyLabel: report.isPdfReady ? getReportPdfReadyLabel(t) : null,
    aiBadgeLabel: report.isAi ? translateKey(t, "specialist.reports.type.ai", "AI") : null,
  };
}

export function applyReportDetailLocalization(detail, context = {}) {
  if (!detail) {
    return detail;
  }

  const localized = applyReportListItemLocalization(detail, context);
  const { t } = resolveSpecialistMapperContext(context);

  return {
    ...localized,
    sections: (detail.sections || []).map((section) => ({
      ...section,
      titleLabel: getReportSectionTitleLabel(section.title, t),
    })),
    periodStartLabel: detail.periodStart
      ? formatReportDateLabel(detail.periodStart, resolveSpecialistMapperContext(context).locale, t)
      : null,
    periodEndLabel: detail.periodEnd
      ? formatReportDateLabel(detail.periodEnd, resolveSpecialistMapperContext(context).locale, t)
      : null,
  };
}
