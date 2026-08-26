/**
 * Pure helpers for Specialist AI recommendation draft editing (Web).
 * Field ids match backend details JSON.
 */

export const AI_RECOMMENDATION_EDITABLE_STRING_FIELDS = Object.freeze([
  "clinical_analysis",
  "clinical_reasoning",
]);

export const AI_RECOMMENDATION_EDITABLE_LIST_FIELDS = Object.freeze([
  "treatment_plan_adjustments",
]);

export const AI_RECOMMENDATION_EDITABLE_EXERCISE_FIELD = "suggested_exercises";

function uniqueNonEmptyStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values || []) {
    const text = String(value ?? "").trim();
    if (!text || seen.has(text)) {
      continue;
    }
    seen.add(text);
    result.push(text);
  }
  return result;
}

function formatExerciseLine(exercise) {
  const title = String(exercise?.title ?? "").trim();
  const reason = String(exercise?.reason ?? "").trim();
  if (title && reason) {
    return `${title} — ${reason}`;
  }
  return title || reason || "";
}

function parseExerciseLine(line) {
  const text = String(line ?? "").trim();
  if (!text) {
    return null;
  }

  const match = text.match(/\s+[—–-]\s+/);
  if (match) {
    const index = text.search(/\s+[—–-]\s+/);
    const title = text.slice(0, index).trim();
    const reason = text.slice(index + match[0].length).trim();
    return {
      exercise_id: null,
      title: title || text,
      reason: reason || null,
    };
  }

  return {
    exercise_id: null,
    title: text,
    reason: null,
  };
}

/**
 * Builds local edit form state from a mapped AI recommendation item.
 * List/exercise fields use one item per line in the textarea.
 */
export function buildAiRecommendationDraftFormState(recommendation) {
  const details = recommendation?.details || {};
  const clinicalReasoning = details.clinicalReasoning || details.summary || "";
  const clinicalAnalysis = details.clinicalAnalysis || "";
  const planAdjustments = uniqueNonEmptyStrings(details.planAdjustments);
  const exerciseLines = (details.suggestedExercises || [])
    .map((exercise) => formatExerciseLine(exercise))
    .filter(Boolean);

  return {
    clinical_analysis: String(clinicalAnalysis),
    clinical_reasoning: String(clinicalReasoning),
    treatment_plan_adjustments: planAdjustments.join("\n"),
    suggested_exercises: exerciseLines.join("\n"),
  };
}

export function listFieldTextToArray(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Builds PATCH body for /ai/recommendations/:id from form state.
 * Preserves exercise_id from the original list by matching index/title when possible.
 */
export function buildAiRecommendationDraftUpdatePayload(formState, originalExercises = []) {
  const exerciseLines = listFieldTextToArray(formState?.suggested_exercises);
  return {
    clinical_analysis: String(formState?.clinical_analysis ?? "").trim(),
    clinical_reasoning: String(formState?.clinical_reasoning ?? "").trim(),
    treatment_plan_adjustments: listFieldTextToArray(
      formState?.treatment_plan_adjustments
    ),
    suggested_exercises: exerciseLines.map((line, index) => {
      const parsed = parseExerciseLine(line);
      if (!parsed) {
        return null;
      }
      const original = originalExercises[index];
      const originalId = original?.exerciseId || original?.exercise_id || null;
      const originalTitle = String(original?.title ?? "").trim();
      if (originalId && (!originalTitle || originalTitle === parsed.title)) {
        parsed.exercise_id = originalId;
      }
      return parsed;
    }).filter(Boolean),
  };
}

export function hasAiRecommendationDraftClinicalContent(formState) {
  const payload = buildAiRecommendationDraftUpdatePayload(formState);
  return Boolean(payload.clinical_analysis)
    || Boolean(payload.clinical_reasoning)
    || payload.treatment_plan_adjustments.length > 0
    || payload.suggested_exercises.length > 0;
}

export function canStartAiRecommendationDraftEdit(recommendation) {
  return Boolean(recommendation?.status?.isPending);
}
