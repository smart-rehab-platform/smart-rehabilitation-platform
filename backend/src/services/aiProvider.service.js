const geminiService = require("./gemini.service");

const DEFAULT_PROVIDER = "gemini";

const sanitizeStringArray = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];

const sanitizeExerciseSuggestions = (items, fallbackItems = []) => {
  if (!Array.isArray(items)) {
    return Array.isArray(fallbackItems) ? fallbackItems : [];
  }

  const sanitized = items
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const title =
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : "";

      if (!title) {
        return null;
      }

      const reason =
        typeof item.reason === "string" && item.reason.trim()
          ? item.reason.trim()
          : "Suggested from the available rehabilitation context.";

      return {
        exercise_id:
          typeof item.exercise_id === "string" && item.exercise_id.trim()
            ? item.exercise_id.trim()
            : null,
        title,
        reason
      };
    })
    .filter(Boolean);

  return sanitized.length > 0
    ? sanitized
    : Array.isArray(fallbackItems)
      ? fallbackItems
      : [];
};

const normalizePriorityLevel = (value, fallbackValue = "medium") => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return ["low", "medium", "high"].includes(normalized)
    ? normalized
    : fallbackValue;
};

const buildFallbackResponse = (fallbackData = {}) => ({
  clinical_note:
    fallbackData.clinical_note ||
    "Rule-based fallback clinical note generated because the configured AI provider was unavailable.",
  improvement_summary:
    fallbackData.improvement_summary ||
    "No AI-generated summary was available, so a rule-based fallback summary was returned.",
  detected_changes: {
    improvements: Array.isArray(fallbackData.detected_changes?.improvements)
      ? fallbackData.detected_changes.improvements
      : [],
    regressions: Array.isArray(fallbackData.detected_changes?.regressions)
      ? fallbackData.detected_changes.regressions
      : [],
    stable_areas: Array.isArray(fallbackData.detected_changes?.stable_areas)
      ? fallbackData.detected_changes.stable_areas
      : []
  },
  treatment_analysis:
    fallbackData.treatment_analysis ||
    "Fallback treatment analysis was used because no structured AI response was available.",
  recommendations: Array.isArray(fallbackData.recommendations)
    ? fallbackData.recommendations
    : [],
  decision_support: {
    suggested_action:
      fallbackData.decision_support?.suggested_action || "monitor_closely",
    reason:
      fallbackData.decision_support?.reason ||
      "Fallback recommendation was returned because the configured AI provider was unavailable."
  },
  confidence_score:
    typeof fallbackData.confidence_score === "number"
      ? fallbackData.confidence_score
      : 0.5,
  provider: "rule_based",
  used_fallback: true
});

const normalizeStructuredResponse = (payload, fallbackData = {}, provider = "gemini") => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("AI provider returned an invalid structured response.");
  }

  const fallback = buildFallbackResponse(fallbackData);

  return {
    clinical_note:
      typeof payload.clinical_note === "string" && payload.clinical_note.trim()
        ? payload.clinical_note.trim()
        : fallback.clinical_note,
    improvement_summary:
      typeof payload.improvement_summary === "string" && payload.improvement_summary.trim()
        ? payload.improvement_summary.trim()
        : fallback.improvement_summary,
    detected_changes: {
      improvements: Array.isArray(payload.detected_changes?.improvements)
        ? payload.detected_changes.improvements
        : fallback.detected_changes.improvements,
      regressions: Array.isArray(payload.detected_changes?.regressions)
        ? payload.detected_changes.regressions
        : fallback.detected_changes.regressions,
      stable_areas: Array.isArray(payload.detected_changes?.stable_areas)
        ? payload.detected_changes.stable_areas
        : fallback.detected_changes.stable_areas
    },
    treatment_analysis:
      typeof payload.treatment_analysis === "string" && payload.treatment_analysis.trim()
        ? payload.treatment_analysis.trim()
        : fallback.treatment_analysis,
    recommendations: Array.isArray(payload.recommendations)
      ? payload.recommendations
      : fallback.recommendations,
    decision_support: {
      suggested_action:
        typeof payload.decision_support?.suggested_action === "string" &&
        payload.decision_support.suggested_action.trim()
          ? payload.decision_support.suggested_action.trim()
          : fallback.decision_support.suggested_action,
      reason:
        typeof payload.decision_support?.reason === "string" &&
        payload.decision_support.reason.trim()
          ? payload.decision_support.reason.trim()
          : fallback.decision_support.reason
    },
    confidence_score:
      typeof payload.confidence_score === "number"
        ? payload.confidence_score
        : fallback.confidence_score,
    provider,
    used_fallback: provider !== "gemini"
  };
};

const buildRecommendationFallbackResponse = (fallbackData = {}) => ({
  clinical_analysis:
    fallbackData.clinical_analysis ||
    "Rule-based fallback clinical analysis was generated because the configured AI provider was unavailable.",
  suggested_exercises: sanitizeExerciseSuggestions(
    fallbackData.suggested_exercises
  ),
  treatment_plan_adjustments: sanitizeStringArray(
    fallbackData.treatment_plan_adjustments
  ),
  clinical_reasoning:
    fallbackData.clinical_reasoning ||
    "Fallback clinical reasoning was used because no structured AI recommendation was available.",
  priority_level: normalizePriorityLevel(
    fallbackData.priority_level,
    "medium"
  ),
  estimated_confidence:
    typeof fallbackData.estimated_confidence === "number"
      ? fallbackData.estimated_confidence
      : 0.5,
  provider: "rule_based",
  used_fallback: true
});

const normalizeRecommendationResponse = (
  payload,
  fallbackData = {},
  provider = "gemini"
) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("AI provider returned an invalid recommendation response.");
  }

  const fallback = buildRecommendationFallbackResponse(fallbackData);

  return {
    clinical_analysis:
      typeof payload.clinical_analysis === "string" &&
      payload.clinical_analysis.trim()
        ? payload.clinical_analysis.trim()
        : fallback.clinical_analysis,
    suggested_exercises: sanitizeExerciseSuggestions(
      payload.suggested_exercises,
      fallback.suggested_exercises
    ),
    treatment_plan_adjustments: sanitizeStringArray(
      payload.treatment_plan_adjustments
    ).length > 0
      ? sanitizeStringArray(payload.treatment_plan_adjustments)
      : fallback.treatment_plan_adjustments,
    clinical_reasoning:
      typeof payload.clinical_reasoning === "string" &&
      payload.clinical_reasoning.trim()
        ? payload.clinical_reasoning.trim()
        : fallback.clinical_reasoning,
    priority_level: normalizePriorityLevel(
      payload.priority_level,
      fallback.priority_level
    ),
    estimated_confidence:
      typeof payload.estimated_confidence === "number"
        ? payload.estimated_confidence
        : fallback.estimated_confidence,
    provider,
    used_fallback: provider !== "gemini"
  };
};

const createJsonInstructionPrompt = (prompt) => [
  "Return a JSON object with exactly these fields:",
  "{",
  '  "clinical_note": "string",',
  '  "improvement_summary": "string",',
  '  "detected_changes": {',
  '    "improvements": ["string"],',
  '    "regressions": ["string"],',
  '    "stable_areas": ["string"]',
  "  },",
  '  "treatment_analysis": "string",',
  '  "recommendations": ["string"],',
  '  "decision_support": {',
  '    "suggested_action": "string",',
  '    "reason": "string"',
  "  },",
  '  "confidence_score": 0.5',
  "}",
  "Do not add any extra fields.",
  prompt
].join("\n");

const createRecommendationInstructionPrompt = (prompt) => [
  "Return a JSON object with exactly these fields:",
  "{",
  '  "clinical_analysis": "string",',
  '  "suggested_exercises": [',
  "    {",
  '      "exercise_id": "string or null",',
  '      "title": "string",',
  '      "reason": "string"',
  "    }",
  "  ],",
  '  "treatment_plan_adjustments": ["string"],',
  '  "clinical_reasoning": "string",',
  '  "priority_level": "low | medium | high",',
  '  "estimated_confidence": 0.5',
  "}",
  "Do not add any extra fields.",
  prompt
].join("\n");

const getConfiguredProvider = () => process.env.AI_PROVIDER || DEFAULT_PROVIDER;

const isAiConfigured = () => {
  const provider = getConfiguredProvider();

  if (provider === "gemini") {
    return geminiService.isConfigured();
  }

  return false;
};

const generateWithFallback = async (prompt, fallbackData = {}) => {
  const provider = getConfiguredProvider();

  if (provider === "gemini" && geminiService.isConfigured()) {
    try {
      const geminiPayload = await geminiService.generateJson(
        createJsonInstructionPrompt(prompt)
      );

      return normalizeStructuredResponse(geminiPayload, fallbackData, "gemini");
    } catch (error) {
      return buildFallbackResponse({
        ...fallbackData,
        decision_support: {
          suggested_action:
            fallbackData.decision_support?.suggested_action || "monitor_closely",
          reason:
            fallbackData.decision_support?.reason ||
            `Gemini fallback used after provider failure: ${error.message}`
        }
      });
    }
  }

  return buildFallbackResponse(fallbackData);
};

const generateClinicalProgressJson = async (prompt, fallbackData = {}) =>
  generateWithFallback(prompt, fallbackData);

const generateClinicalSummaryJson = async (prompt, fallbackData = {}) =>
  generateWithFallback(prompt, fallbackData);

const generateRecommendationJson = async (prompt, fallbackData = {}) => {
  const provider = getConfiguredProvider();

  if (provider === "gemini" && geminiService.isConfigured()) {
    try {
      const geminiPayload = await geminiService.generateJson(
        createRecommendationInstructionPrompt(prompt)
      );

      return normalizeRecommendationResponse(
        geminiPayload,
        fallbackData,
        "gemini"
      );
    } catch (error) {
      return buildRecommendationFallbackResponse({
        ...fallbackData,
        clinical_reasoning:
          fallbackData.clinical_reasoning ||
          `Gemini fallback used after provider failure: ${error.message}`
      });
    }
  }

  return buildRecommendationFallbackResponse(fallbackData);
};

module.exports = {
  isAiConfigured,
  generateClinicalProgressJson,
  generateClinicalSummaryJson,
  generateRecommendationJson
};
