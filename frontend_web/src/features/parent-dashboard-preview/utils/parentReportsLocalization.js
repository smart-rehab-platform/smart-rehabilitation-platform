import { formatParentWeekdayDate, translateKey } from "./parentLocalizationCore.js";

export const REPORT_TYPE_VALUES = ["weekly", "monthly", "assessment", "progress"];
export const REPORT_SORT_VALUES = ["newest", "oldest", "childName", "reportType"];

const REPORT_TYPE_KEY_BY_VALUE = {
  weekly: "parent.reports.type.weekly",
  monthly: "parent.reports.type.monthly",
  assessment: "parent.reports.type.assessment",
  progress: "parent.reports.type.progress",
};

const EN_REPORT_TYPE = {
  weekly: "Weekly",
  monthly: "Monthly",
  assessment: "Assessment",
  progress: "Progress",
};

const SUMMARY_SECTION_DEFS = [
  { key: "executive_summary", labelKey: "parent.reports.summary.executiveSummary", fallback: "Executive summary" },
  { key: "patient_progress_summary", labelKey: "parent.reports.summary.patientProgress", fallback: "Patient progress" },
  { key: "speech_analysis_summary", labelKey: "parent.reports.summary.speechAnalysis", fallback: "Speech analysis" },
  { key: "exercise_adherence_summary", labelKey: "parent.reports.summary.exerciseAdherence", fallback: "Exercise adherence" },
  { key: "goal_progress_summary", labelKey: "parent.reports.summary.goalProgress", fallback: "Goal progress" },
];

const SUMMARY_LIST_DEFS = [
  { key: "clinical_insights", labelKey: "parent.reports.summary.clinicalInsights", fallback: "Clinical insights" },
  { key: "risks_or_regressions", labelKey: "parent.reports.summary.risksOrRegressions", fallback: "Risks or regressions" },
  { key: "recommendations", labelKey: "parent.reports.summary.recommendations", fallback: "Recommendations" },
  { key: "next_steps", labelKey: "parent.reports.summary.nextSteps", fallback: "Next steps" },
];

export function getReportTypeLabel(reportType, t = null) {
  if (!reportType) {
    return null;
  }

  const normalized = reportType.trim().toLowerCase();
  const key = REPORT_TYPE_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_REPORT_TYPE[normalized]);
  }

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildReportSortOptions(t) {
  return [
    { id: "newest", label: translateKey(t, "parent.common.sort.newest", "Newest first") },
    { id: "oldest", label: translateKey(t, "parent.common.sort.oldest", "Oldest first") },
    { id: "childName", label: translateKey(t, "parent.reports.sort.childName", "Child name") },
    { id: "reportType", label: translateKey(t, "parent.reports.sort.reportType", "Report type") },
  ];
}

export function buildReportTypeFilterOptions(reports, t) {
  const typeSet = new Set();

  reports.forEach((report) => {
    if (report.reportType) {
      typeSet.add(report.reportType);
    }
  });

  const options = [{ id: "all", label: translateKey(t, "parent.common.filters.allTypes", "All types") }];
  [...typeSet]
    .sort((left, right) => getReportTypeLabel(left, t).localeCompare(getReportTypeLabel(right, t)))
    .forEach((type) => {
      options.push({ id: type, label: getReportTypeLabel(type, t) });
    });

  return options;
}

export function formatReportGeneratedDate(value, locale = "en", t = null) {
  return formatParentWeekdayDate(value, locale, t);
}

export function getReportEmptyMessages(t) {
  return {
    none: translateKey(t, "parent.reports.empty.none", "No reports available yet."),
    filtered: translateKey(t, "parent.reports.empty.filtered", "No reports match your filters."),
  };
}

export function getReportFileUnavailableError(t) {
  return translateKey(t, "parent.reports.errors.fileUnavailable", "Report file is unavailable.");
}

export function getSummarySectionDefs(t) {
  return SUMMARY_SECTION_DEFS.map(({ key, labelKey, fallback }) => ({
    key,
    label: translateKey(t, labelKey, fallback),
  }));
}

export function getSummaryListDefs(t) {
  return SUMMARY_LIST_DEFS.map(({ key, labelKey, fallback }) => ({
    key,
    label: translateKey(t, labelKey, fallback),
  }));
}

/** @deprecated Use getReportTypeLabel(type, t) */
export const REPORT_TYPE_LABELS = Object.fromEntries(
  REPORT_TYPE_VALUES.map((value) => [value, getReportTypeLabel(value, null)]),
);

/** @deprecated Use buildReportSortOptions(t) */
export const REPORT_SORT_OPTIONS = buildReportSortOptions(null);

/** @deprecated Use getReportEmptyMessages(t) */
export const REPORT_EMPTY_MESSAGES = getReportEmptyMessages(null);
