const geminiService = require("./gemini.service");

const DEFAULT_PROVIDER = "gemini";

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

module.exports = {
  isAiConfigured,
  generateClinicalProgressJson,
  generateClinicalSummaryJson
};
