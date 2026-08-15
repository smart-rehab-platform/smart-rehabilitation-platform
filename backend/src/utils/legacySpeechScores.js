/**
 * Prompt/context-only omission of legacy heuristic speech scores.
 * Does not mutate callers' objects or database rows.
 */

const LEGACY_SPEECH_SCORE_KEYS = new Set([
  "pronunciation_score",
  "fluency_score",
  "overall_score",
  "pronunciationScore",
  "fluencyScore",
  "overallScore",
  "pronunciation_change",
  "fluency_change",
  "overall_score_change",
  "pronunciationChange",
  "fluencyChange",
  "overallScoreChange",
]);

const omitLegacySpeechScoreFields = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => omitLegacySpeechScoreFields(item));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const next = {};
  for (const [key, nested] of Object.entries(value)) {
    if (LEGACY_SPEECH_SCORE_KEYS.has(key)) {
      continue;
    }
    next[key] = omitLegacySpeechScoreFields(nested);
  }
  return next;
};

const cloneWithoutLegacySpeechScores = (value) => {
  if (value === null || value === undefined) {
    return value;
  }
  return omitLegacySpeechScoreFields(JSON.parse(JSON.stringify(value)));
};

const promptContainsLegacySpeechScores = (text) => {
  const haystack = String(text || "");
  return (
    haystack.includes("pronunciation_score") ||
    haystack.includes("fluency_score") ||
    /"overall_score"/.test(haystack) ||
    haystack.includes("pronunciationScore") ||
    haystack.includes("fluencyScore") ||
    haystack.includes("overallScore")
  );
};

module.exports = {
  LEGACY_SPEECH_SCORE_KEYS,
  omitLegacySpeechScoreFields,
  cloneWithoutLegacySpeechScores,
  promptContainsLegacySpeechScores,
};
