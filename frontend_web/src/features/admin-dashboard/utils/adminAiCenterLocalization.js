import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";
import {
  getRecommendationStatusMeta,
  getRecommendationTypeLabel,
} from "../../specialist-dashboard/utils/specialistAiRecommendationsLocalization.js";
import { getReportTypeDisplayLabel } from "../../specialist-dashboard/utils/specialistReportsLocalization.js";

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

function getRecommendationStatusTone(value) {
  const normalized = (value || "").trim().toLowerCase();

  switch (normalized) {
    case "accepted":
    case "approved":
    case "completed":
      return "success";
    case "rejected":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
}

export function getAdminAiCenterLabels(t = null) {
  return {
    title: translateKey(t, "admin.ai.title", "AI Insights"),
    subtitle: translateKey(
      t,
      "admin.ai.subtitle",
      "Speech analysis, recommendations, and clinical reports",
    ),
    toolbarAriaLabel: translateKey(t, "admin.ai.toolbarAriaLabel", "AI Center header"),
    loading: translateKey(t, "admin.ai.loading", "Loading AI Center..."),
    retry: translateKey(t, "common.retry", "Retry"),
    loadFailed: translateKey(t, "admin.ai.loadFailed", "Failed to load AI Center."),
    summaryAriaLabel: translateKey(t, "admin.ai.summary.ariaLabel", "AI summary"),
    summaryLoadingAriaLabel: translateKey(t, "admin.ai.summary.loadingAriaLabel", "AI summary loading"),
    kpi: {
      speech: translateKey(t, "admin.ai.summary.speechAnalyses", "Speech Analyses"),
      recommendations: translateKey(t, "admin.ai.summary.recommendations", "AI Recommendations"),
      reports: translateKey(t, "admin.ai.summary.reports", "AI Reports"),
      attention: translateKey(t, "admin.ai.summary.needsAttention", "Needs Attention"),
      loading: translateKey(t, "admin.ai.summary.loading", "Loading..."),
      pendingReviews: (count) => translateKey(
        t,
        "admin.ai.summary.pendingReviews",
        "{count} pending reviews",
        { count },
      ),
    },
    attention: {
      title: translateKey(t, "admin.ai.attention.title", "Patients Needing Attention"),
      ariaLabel: translateKey(t, "admin.ai.attention.ariaLabel", "Patients needing attention"),
      loadingAriaLabel: translateKey(
        t,
        "admin.ai.attention.loadingAriaLabel",
        "Patients needing attention loading",
      ),
      loadingPatient: translateKey(t, "admin.ai.attention.loadingPatient", "Loading patient..."),
      empty: translateKey(
        t,
        "admin.ai.attention.empty",
        "No patients currently need attention.",
      ),
      viewPatientAria: (name) => translateKey(
        t,
        "admin.ai.attention.viewPatientAria",
        "View patient {name}",
        { name },
      ),
    },
    speech: {
      title: translateKey(t, "admin.ai.speech.title", "Latest Speech Analyses"),
      empty: translateKey(t, "admin.ai.speech.empty", "No speech analyses yet."),
      recently: translateKey(t, "admin.ai.recently", "Recently"),
    },
    recommendations: {
      title: translateKey(t, "admin.ai.recommendations.title", "Latest AI Recommendations"),
      empty: translateKey(t, "admin.ai.recommendations.empty", "No AI recommendations yet."),
    },
    reports: {
      title: translateKey(t, "admin.ai.reports.title", "Latest AI Reports"),
      empty: translateKey(t, "admin.ai.reports.empty", "No AI reports yet."),
      detail: (type, date) => translateKey(
        t,
        "admin.ai.reports.detail",
        "{type} • {date}",
        { type, date },
      ),
    },
    records: {
      loading: translateKey(t, "admin.ai.records.loading", "Loading record..."),
      loadingAriaLabel: translateKey(t, "admin.ai.records.loadingAriaLabel", "Loading records"),
      patientFallback: translateKey(t, "admin.ai.records.patientFallback", "Patient"),
    },
    status: {
      approved: translateKey(t, "admin.ai.recommendations.status.approved", "Approved"),
      completed: translateKey(t, "admin.ai.recommendations.status.completed", "Completed"),
    },
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
  };
}

export function formatAdminAiCenterDateLabel(value, context = {}) {
  const { locale, t } = resolveAdminMapperContext(context);

  if (!value) {
    return translateKey(t, "admin.ai.recently", "Recently");
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "admin.ai.recently", "Recently");
  }

  return formatAppDate(date, locale)
    ?? formatAppDateTime(date, locale)
    ?? translateKey(t, "admin.ai.recently", "Recently");
}

export function formatAdminAiRecommendationStatusLabel(status, t = null) {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "approved") {
    return translateKey(t, "admin.ai.recommendations.status.approved", "Approved");
  }

  if (normalized === "completed") {
    return translateKey(t, "admin.ai.recommendations.status.completed", "Completed");
  }

  return getRecommendationStatusMeta(status, t).label;
}

export function applyAdminAiCenterLocalization(data, context = {}) {
  if (!data) {
    return data;
  }

  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminAiCenterLabels(t);

  return {
    ...data,
    patientsNeedingAttention: (data.patientsNeedingAttention ?? []).map((patient) => ({
      ...patient,
      fullName: patient.fullName,
    })),
    latestSpeechAnalyses: (data.latestSpeechAnalyses ?? []).map((record) => {
      const analyzedAtLabel = record.analyzedAtRaw
        ? formatAdminAiCenterDateLabel(record.analyzedAtRaw, context)
        : (record.analyzedAtLabel ?? labels.speech.recently);

      return {
        ...record,
        patientName: record.patientName,
        analyzedAtLabel,
        detailLabel: analyzedAtLabel,
      };
    }),
    latestRecommendations: (data.latestRecommendations ?? []).map((record) => {
      const typeLabel = getRecommendationTypeLabel(record.type, t);
      const statusLabel = formatAdminAiRecommendationStatusLabel(record.status, t);

      return {
        ...record,
        patientName: record.patientName,
        typeLabel,
        status: record.status,
        statusLabel,
        statusTone: getRecommendationStatusTone(record.status),
        detailLabel: typeLabel,
      };
    }),
    latestReports: (data.latestReports ?? []).map((record) => {
      const typeLabel = getReportTypeDisplayLabel(record.type ?? record.reportType, t);
      const generatedAtLabel = record.generatedAtRaw
        ? formatAdminAiCenterDateLabel(record.generatedAtRaw, context)
        : (record.generatedAtLabel ?? labels.speech.recently);

      return {
        ...record,
        patientName: record.patientName,
        typeLabel,
        generatedAtLabel,
        detailLabel: labels.reports.detail(typeLabel, generatedAtLabel),
      };
    }),
  };
}
