import { formatAppDate } from "../../../i18n/formatters.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

export const AI_RECOMMENDATION_TYPE = {
  exerciseSuggestion: "exercise_suggestion",
  planAdjustment: "plan_adjustment",
};

const RECOMMENDATION_TYPE_KEY = {
  [AI_RECOMMENDATION_TYPE.exerciseSuggestion]: "specialist.aiRecommendations.type.exerciseSuggestion",
  [AI_RECOMMENDATION_TYPE.planAdjustment]: "specialist.aiRecommendations.type.planAdjustment",
};

const RECOMMENDATION_TYPE_FALLBACK = {
  [AI_RECOMMENDATION_TYPE.exerciseSuggestion]: "Exercise Suggestion",
  [AI_RECOMMENDATION_TYPE.planAdjustment]: "Plan Adjustment",
};

const RECOMMENDATION_STATUS_KEY = {
  pending: "specialist.aiRecommendations.status.pending",
  accepted: "specialist.aiRecommendations.status.accepted",
  rejected: "specialist.aiRecommendations.status.rejected",
  unknown: "specialist.aiRecommendations.status.unknown",
};

const RECOMMENDATION_STATUS_FALLBACK = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  unknown: "Unknown",
};

const RECOMMENDATION_STATUS_TONE = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  unknown: "gray",
};

const PRIORITY_KEY = {
  high: "specialist.aiRecommendations.priority.high",
  medium: "specialist.aiRecommendations.priority.medium",
  low: "specialist.aiRecommendations.priority.low",
};

const PRIORITY_FALLBACK = {
  high: "High",
  medium: "Medium",
  low: "Low",
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

function normalizeRecommendationStatus(status) {
  return String(status || "unknown").trim().toLowerCase();
}

function normalizePriority(value) {
  return String(value || "").trim().toLowerCase();
}

export function getRecommendationTypeLabel(typeId, t = null) {
  const key = RECOMMENDATION_TYPE_KEY[typeId];
  if (key) {
    return translateKey(t, key, RECOMMENDATION_TYPE_FALLBACK[typeId]);
  }
  return translateKey(t, "specialist.aiRecommendations.type.recommendation", "Recommendation");
}

export function getRecommendationStatusMeta(statusId, t = null) {
  const normalized = normalizeRecommendationStatus(statusId);
  const resolvedId = RECOMMENDATION_STATUS_KEY[normalized] ? normalized : "unknown";
  const key = RECOMMENDATION_STATUS_KEY[resolvedId];

  return {
    id: statusId || resolvedId,
    label: translateKey(t, key, RECOMMENDATION_STATUS_FALLBACK[resolvedId]),
    tone: RECOMMENDATION_STATUS_TONE[resolvedId] ?? "gray",
    isPending: resolvedId === "pending",
  };
}

export function getPriorityLabel(priorityValue, t = null) {
  const normalized = normalizePriority(priorityValue);
  const key = PRIORITY_KEY[normalized];
  if (key) {
    return translateKey(t, key, PRIORITY_FALLBACK[normalized]);
  }
  if (!priorityValue) {
    return translateKey(t, "specialist.aiRecommendations.priority.label", "Priority");
  }
  return priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1);
}

export function formatRecommendationDateLabel(value, locale = "en", t = null) {
  if (!value) {
    return translateKey(t, "auth.shared.emptyDisplay", "—");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "auth.shared.emptyDisplay", "—");
  }

  return formatAppDate(date, locale) ?? translateKey(t, "auth.shared.emptyDisplay", "—");
}

export function getAiRecommendationSectionLabels(t = null) {
  return {
    summary: translateKey(t, "specialist.aiRecommendations.sections.summary", "Summary"),
    reason: translateKey(t, "specialist.aiRecommendations.sections.reason", "Reason"),
    clinicalAnalysis: translateKey(
      t,
      "specialist.aiRecommendations.sections.clinicalAnalysis",
      "Clinical Analysis",
    ),
    suggestedExercises: translateKey(
      t,
      "specialist.aiRecommendations.sections.suggestedExercises",
      "Suggested Exercises",
    ),
    planAdjustment: translateKey(
      t,
      "specialist.aiRecommendations.sections.planAdjustment",
      "Plan Adjustment",
    ),
    confidence: translateKey(t, "specialist.aiRecommendations.sections.confidence", "Confidence"),
  };
}

export function getSuggestedExerciseFallbackLabel(t = null) {
  return translateKey(
    t,
    "specialist.aiRecommendations.suggestedExerciseFallback",
    "Suggested exercise",
  );
}

export function applyAiRecommendationLocalization(recommendation, context = {}) {
  if (!recommendation) {
    return recommendation;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);
  const statusMeta = getRecommendationStatusMeta(recommendation.status?.id, t);
  const typeId = recommendation.type?.id;

  return {
    ...recommendation,
    type: {
      ...recommendation.type,
      id: typeId,
      label: getRecommendationTypeLabel(typeId, t),
    },
    status: {
      ...recommendation.status,
      id: recommendation.status?.id,
      label: statusMeta.label,
      tone: statusMeta.tone,
      isPending: statusMeta.isPending,
    },
    generatedAtLabel: formatRecommendationDateLabel(recommendation.generatedAt, locale, t),
    priorityLabel: recommendation.details?.priorityLevel
      ? getPriorityLabel(recommendation.details.priorityLevel, t)
      : null,
    sectionLabels: getAiRecommendationSectionLabels(t),
  };
}

export function applyAiRecommendationsBundleLocalization(bundle, context = {}) {
  if (!bundle) {
    return bundle;
  }

  return {
    ...bundle,
    recommendations: (bundle.recommendations || []).map((item) => (
      applyAiRecommendationLocalization(item, context)
    )),
  };
}
