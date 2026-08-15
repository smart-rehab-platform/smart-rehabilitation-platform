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

const buildReportFallbackResponse = (fallbackData = {}) => ({
  executive_summary:
    fallbackData.executive_summary ||
    "Rule-based fallback executive summary was generated because the configured AI provider was unavailable.",
  patient_progress_summary:
    fallbackData.patient_progress_summary ||
    "Fallback patient progress summary was generated from the available structured rehabilitation data.",
  speech_analysis_summary:
    fallbackData.speech_analysis_summary ||
    "Speech analysis context was limited, so a fallback summary was used.",
  exercise_adherence_summary:
    fallbackData.exercise_adherence_summary ||
    "Exercise adherence context was limited, so a fallback summary was used.",
  goal_progress_summary:
    fallbackData.goal_progress_summary ||
    "Goal progress context was limited, so a fallback summary was used.",
  clinical_insights: sanitizeStringArray(fallbackData.clinical_insights),
  risks_or_regressions: sanitizeStringArray(fallbackData.risks_or_regressions),
  recommendations: sanitizeStringArray(fallbackData.recommendations),
  next_steps: sanitizeStringArray(fallbackData.next_steps),
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

const normalizeReportResponse = (
  payload,
  fallbackData = {},
  provider = "gemini"
) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("AI provider returned an invalid report response.");
  }

  const fallback = buildReportFallbackResponse(fallbackData);

  return {
    executive_summary:
      typeof payload.executive_summary === "string" &&
      payload.executive_summary.trim()
        ? payload.executive_summary.trim()
        : fallback.executive_summary,
    patient_progress_summary:
      typeof payload.patient_progress_summary === "string" &&
      payload.patient_progress_summary.trim()
        ? payload.patient_progress_summary.trim()
        : fallback.patient_progress_summary,
    speech_analysis_summary:
      typeof payload.speech_analysis_summary === "string" &&
      payload.speech_analysis_summary.trim()
        ? payload.speech_analysis_summary.trim()
        : fallback.speech_analysis_summary,
    exercise_adherence_summary:
      typeof payload.exercise_adherence_summary === "string" &&
      payload.exercise_adherence_summary.trim()
        ? payload.exercise_adherence_summary.trim()
        : fallback.exercise_adherence_summary,
    goal_progress_summary:
      typeof payload.goal_progress_summary === "string" &&
      payload.goal_progress_summary.trim()
        ? payload.goal_progress_summary.trim()
        : fallback.goal_progress_summary,
    clinical_insights:
      sanitizeStringArray(payload.clinical_insights).length > 0
        ? sanitizeStringArray(payload.clinical_insights)
        : fallback.clinical_insights,
    risks_or_regressions:
      sanitizeStringArray(payload.risks_or_regressions).length > 0
        ? sanitizeStringArray(payload.risks_or_regressions)
        : fallback.risks_or_regressions,
    recommendations:
      sanitizeStringArray(payload.recommendations).length > 0
        ? sanitizeStringArray(payload.recommendations)
        : fallback.recommendations,
    next_steps:
      sanitizeStringArray(payload.next_steps).length > 0
        ? sanitizeStringArray(payload.next_steps)
        : fallback.next_steps,
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

const buildChatbotFallbackResponse = (fallbackText) => ({
  reply:
    typeof fallbackText === "string" && fallbackText.trim()
      ? fallbackText.trim()
      : "I can help explain exercises, progress, and general rehabilitation support. For diagnosis, medication, emergencies, or treatment decisions, please contact your specialist.",
  provider: "rule_based",
  used_fallback: true
});

const normalizeChatbotReply = (
  replyText,
  fallbackText,
  provider = "gemini"
) => {
  const normalizedReply =
    typeof replyText === "string" && replyText.trim()
      ? replyText.trim()
      : buildChatbotFallbackResponse(fallbackText).reply;

  return {
    reply: normalizedReply,
    provider,
    used_fallback: provider !== "gemini"
  };
};

const createJsonInstructionPrompt = (prompt) => {
  const lines = [
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
  ];

  const promptText = typeof prompt === "string" ? prompt : "";
  if (
    promptText.includes("expected_vs_asr_mismatch") ||
    promptText.includes("asr_mismatches") ||
    promptText.includes("repeated_asr_word_mismatches")
  ) {
    lines.push(
      "Speech ASR safety: when expected-vs-ASR mismatch fields are present, never describe them as patient substitution, substituted, persistent substitution, consistent substitution, or articulation substitution.",
      "Prefer: The ASR transcript differed from the expected word. Low ASR confidence means uncertain ASR evidence only, not confirmed mispronunciation."
    );
  }

  lines.push(promptText);
  return lines.join("\n");
};

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

const createReportInstructionPrompt = (prompt) => [
  "Return a JSON object with exactly these fields:",
  "{",
  '  "executive_summary": "string",',
  '  "patient_progress_summary": "string",',
  '  "speech_analysis_summary": "string",',
  '  "exercise_adherence_summary": "string",',
  '  "goal_progress_summary": "string",',
  '  "clinical_insights": ["string"],',
  '  "risks_or_regressions": ["string"],',
  '  "recommendations": ["string"],',
  '  "next_steps": ["string"],',
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

const generateReportJson = async (prompt, fallbackData = {}) => {
  const provider = getConfiguredProvider();

  if (provider === "gemini" && geminiService.isConfigured()) {
    try {
      const geminiPayload = await geminiService.generateJson(
        createReportInstructionPrompt(prompt)
      );

      return normalizeReportResponse(geminiPayload, fallbackData, "gemini");
    } catch (error) {
      return buildReportFallbackResponse({
        ...fallbackData,
        executive_summary:
          fallbackData.executive_summary ||
          `Gemini fallback used after provider failure: ${error.message}`
      });
    }
  }

  return buildReportFallbackResponse(fallbackData);
};

const generateChatbotReply = async (prompt, fallbackText = "") => {
  const provider = getConfiguredProvider();

  if (provider === "gemini" && geminiService.isConfigured()) {
    try {
      const replyText = await geminiService.generateText(prompt);
      return normalizeChatbotReply(replyText, fallbackText, "gemini");
    } catch (error) {
      return buildChatbotFallbackResponse(
        fallbackText ||
          `I am using a safe fallback reply right now because the AI assistant is temporarily unavailable. ${error.message}`
      );
    }
  }

  return buildChatbotFallbackResponse(fallbackText);
};

module.exports = {
  isAiConfigured,
  generateClinicalProgressJson,
  generateClinicalSummaryJson,
  generateRecommendationJson,
  generateReportJson,
  generateChatbotReply
};
