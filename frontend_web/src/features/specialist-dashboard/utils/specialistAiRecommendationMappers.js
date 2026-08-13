import { selectActiveTreatmentPlan } from "./specialistPatientMappers";

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

function readDouble(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function readDateValue(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (value == null || value === "") {
      continue;
    }
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return null;
}

function asDetailsMap(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return asDetailsMap(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function readPlainText(raw) {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed || null;
  }
  return null;
}

export const AI_RECOMMENDATION_TYPE = {
  exerciseSuggestion: "exercise_suggestion",
  planAdjustment: "plan_adjustment",
};

export function mapRecommendationType(value) {
  const normalized = (value || "").toLowerCase();
  if (normalized === AI_RECOMMENDATION_TYPE.exerciseSuggestion) {
    return { id: AI_RECOMMENDATION_TYPE.exerciseSuggestion, label: "Exercise Suggestion" };
  }
  if (normalized === AI_RECOMMENDATION_TYPE.planAdjustment) {
    return { id: AI_RECOMMENDATION_TYPE.planAdjustment, label: "Plan Adjustment" };
  }
  return { id: "unknown", label: "Recommendation" };
}

export function mapRecommendationStatus(value) {
  const normalized = (value || "").toLowerCase();
  if (normalized === "pending") {
    return { id: "pending", label: "Pending", tone: "warning", isPending: true };
  }
  if (normalized === "accepted") {
    return { id: "accepted", label: "Accepted", tone: "success", isPending: false };
  }
  if (normalized === "rejected") {
    return { id: "rejected", label: "Rejected", tone: "danger", isPending: false };
  }
  return { id: "unknown", label: "Unknown", tone: "gray", isPending: false };
}

export function formatRecommendationDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatPriorityLabel(value) {
  const text = (value || "").trim();
  if (!text) {
    return "Priority";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatConfidencePercent(confidence) {
  if (confidence == null || !Number.isFinite(confidence)) {
    return null;
  }
  return Math.round(confidence * 100);
}

function mapSuggestedExercise(item) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = readString(item, ["title", "name"]) || null;
    const reason = readString(item, ["reason", "summary"]) || null;
    const exerciseId = readString(item, ["exercise_id", "exerciseId", "id"]) || null;
    let displayLine = "Suggested exercise";
    if (title && reason) {
      displayLine = `${title} — ${reason}`;
    } else if (title) {
      displayLine = title;
    } else if (reason) {
      displayLine = reason;
    }
    return { exerciseId, title, reason, displayLine };
  }
  const text = item == null ? "" : String(item).trim();
  if (!text) {
    return null;
  }
  return {
    exerciseId: null,
    title: text,
    reason: null,
    displayLine: text,
  };
}

export function parseRecommendationDetails(raw) {
  const map = asDetailsMap(raw);
  if (!map) {
    return {
      summary: readPlainText(raw),
      clinicalAnalysis: null,
      clinicalReasoning: null,
      suggestedExercises: [],
      planAdjustments: [],
      confidence: null,
      priorityLevel: null,
    };
  }

  const suggestedExercises = [];
  const rawExercises = map.suggested_exercises ?? map.suggestedExercises;
  if (Array.isArray(rawExercises)) {
    rawExercises.forEach((item) => {
      const mapped = mapSuggestedExercise(item);
      if (mapped) {
        suggestedExercises.push(mapped);
      }
    });
  }

  const planAdjustments = [];
  const rawAdjustments = map.treatment_plan_adjustments ?? map.treatmentPlanAdjustments;
  if (Array.isArray(rawAdjustments)) {
    rawAdjustments.forEach((item) => {
      const text = item == null ? "" : String(item).trim();
      if (text) {
        planAdjustments.push(text);
      }
    });
  }

  const suggestion = readString(map, ["suggestion"]);
  if (suggestion) {
    planAdjustments.push(suggestion);
  }

  const summary = readString(map, ["reason", "clinical_reasoning", "clinicalReasoning"])
    || readString(map, ["clinical_analysis", "clinicalAnalysis"])
    || null;

  return {
    summary,
    clinicalAnalysis: readString(map, ["clinical_analysis", "clinicalAnalysis"]) || null,
    clinicalReasoning: readString(map, ["clinical_reasoning", "clinicalReasoning", "reason"]) || null,
    suggestedExercises,
    planAdjustments,
    confidence: readDouble(map, ["estimated_confidence", "estimatedConfidence", "confidence"]),
    priorityLevel: readString(map, ["priority_level", "priorityLevel"]) || null,
  };
}

export function mapAiRecommendationItem(row) {
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const type = mapRecommendationType(readString(row, ["type", "recommendation_type"]));
  const status = mapRecommendationStatus(readString(row, ["status"]));
  const generatedAt = readDateValue(row, ["generated_at", "generatedAt"]);

  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]),
    relatedPlanId: readString(row, ["related_plan_id", "relatedPlanId"]) || null,
    type,
    status,
    details: parseRecommendationDetails(row.details),
    generatedAt,
    generatedAtLabel: formatRecommendationDate(generatedAt),
  };
}

export function mapAiRecommendationList(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(mapAiRecommendationItem).filter(Boolean);
}

export function mapAiRecommendationsBundle({
  patientId,
  patientRow,
  planRows,
  recommendationRows,
}) {
  const patientName = readString(patientRow, ["full_name", "fullName", "name"]) || "Patient";
  const activePlan = selectActiveTreatmentPlan(planRows);

  return {
    patientId,
    patientName,
    planId: activePlan?.id ?? null,
    recommendations: mapAiRecommendationList(recommendationRows),
  };
}

export function getRecommendationTypeApiValue(typeId) {
  if (typeId === AI_RECOMMENDATION_TYPE.planAdjustment) {
    return AI_RECOMMENDATION_TYPE.planAdjustment;
  }
  return AI_RECOMMENDATION_TYPE.exerciseSuggestion;
}
