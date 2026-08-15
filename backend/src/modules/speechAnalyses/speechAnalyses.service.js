const path = require("path");

const pool = require("../../database/db");
const aiProviderService = require("../../services/aiProvider.service");
const fasterWhisperService = require("../../services/fasterWhisper.service");
const speechWordAlignmentService = require("../../services/speechWordAlignment.service");
const speechTimingMetricsService = require("../../services/speechTimingMetrics.service");
const speechProgressInsightsService = require("../../services/speechProgressInsights.service");
const speechAnalysisQualityService = require("../../services/speechAnalysisQuality.service");
const mfaPhonemeAlignmentService = require("../../services/mfaPhonemeAlignment.service");
const speechAcousticProgressService = require("../../services/speechAcousticProgress.service");

const backendRoot = path.resolve(__dirname, "..", "..", "..");
const uploadsRoot = path.resolve(backendRoot, "uploads");

const ALLOWED_EXERCISE_LANGUAGES = new Set(["en", "ar"]);
const DEFAULT_EXERCISE_LANGUAGE = "en";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const resolveExerciseLanguage = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return ALLOWED_EXERCISE_LANGUAGES.has(normalized)
    ? normalized
    : DEFAULT_EXERCISE_LANGUAGE;
};

const readStoredAnalysisLanguage = (row) => {
  if (!row || typeof row !== "object") {
    return DEFAULT_EXERCISE_LANGUAGE;
  }

  const rawOutput =
    row.raw_ai_output && typeof row.raw_ai_output === "object"
      ? row.raw_ai_output
      : null;

  return resolveExerciseLanguage(row.language ?? rawOutput?.language);
};

const readStoredAnalysisDuration = (row) => {
  if (!row || typeof row !== "object") {
    return null;
  }

  const rawOutput =
    row.raw_ai_output && typeof row.raw_ai_output === "object"
      ? row.raw_ai_output
      : null;

  return toNumber(row.duration ?? rawOutput?.duration);
};

const hydrateSpeechAnalysisRow = (row, exerciseContext = null) => {
  if (!row) {
    return row;
  }

  const hydrated = {
    ...row,
    language: readStoredAnalysisLanguage(row),
    duration: readStoredAnalysisDuration(row),
  };

  return attachSpeechAnalysisExtensions(hydrated, exerciseContext);
};

const parseWordErrorDetails = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value;
};

const buildExpectedSpeechPayload = (row, exerciseContext = null) => {
  const expectedText =
    row?.expected_text ??
    exerciseContext?.expected_text ??
    null;
  const targetWord =
    exerciseContext?.target_word ??
    row?.target_word ??
    null;
  const targetPhoneme =
    exerciseContext?.target_phoneme ??
    row?.target_phoneme ??
    null;

  if (
    !expectedText &&
    !targetWord &&
    !targetPhoneme
  ) {
    return null;
  }

  return {
    expected_text: expectedText,
    target_word: targetWord,
    target_phoneme: targetPhoneme,
  };
};

const buildWordAnalysisPayload = (row) => {
  const wordErrorDetails = parseWordErrorDetails(row?.word_error_details);
  const wordAccuracyPercentage = toNumber(row?.word_accuracy_percentage);

  if (wordAccuracyPercentage === null && !wordErrorDetails) {
    return null;
  }

  return {
    word_accuracy_percentage: wordAccuracyPercentage,
    correct_words: wordErrorDetails?.correct_words ?? null,
    substitutions: wordErrorDetails?.substitutions ?? null,
    omissions: wordErrorDetails?.omissions ?? null,
    insertions: wordErrorDetails?.insertions ?? null,
    expected_word_count: wordErrorDetails?.expected_word_count ?? null,
    aligned_words: Array.isArray(wordErrorDetails?.aligned_words)
      ? wordErrorDetails.aligned_words
      : [],
  };
};

const attachSpeechAnalysisExtensions = (row, exerciseContext = null) => {
  if (!row) {
    return row;
  }

  const expectedSpeech = buildExpectedSpeechPayload(row, exerciseContext);
  const wordAnalysis = buildWordAnalysisPayload(row);
  const storedTimingMetrics =
    row?.speech_timing_metrics && typeof row.speech_timing_metrics === "object"
      ? row.speech_timing_metrics
      : null;
  const fluencyMetrics =
    speechTimingMetricsService.buildFluencyMetricsPayload(storedTimingMetrics);
  const asrConfidence = storedTimingMetrics?.asr_confidence ?? null;
  const storedQuality =
    row?.speech_analysis_quality && typeof row.speech_analysis_quality === "object"
      ? row.speech_analysis_quality
      : null;
  const analysisQuality = storedQuality
    ? speechAnalysisQualityService.buildAnalysisQualityPayload(storedQuality)
    : speechAnalysisQualityService.assessSpeechAnalysisQuality({
        transcript: row.transcript,
        expectedText: expectedSpeech?.expected_text ?? row.expected_text,
        wordAnalysis,
        timingMetrics: storedTimingMetrics,
        asrConfidence: storedTimingMetrics?.asr_confidence ?? null,
        segments: row.raw_ai_output?.segments ?? null,
      });
  const storedPhonemeAnalysis =
    row?.speech_phoneme_analysis && typeof row.speech_phoneme_analysis === "object"
      ? row.speech_phoneme_analysis
      : null;
  const phonemeAnalysis = storedPhonemeAnalysis
    ? mfaPhonemeAlignmentService.buildPhonemeAnalysisPayload(storedPhonemeAnalysis)
    : null;

  return {
    ...row,
    exercise_id: exerciseContext?.exercise_id ?? row.exercise_id ?? null,
    expected_speech: expectedSpeech,
    word_analysis: wordAnalysis,
    fluency_metrics: fluencyMetrics,
    asr_confidence: asrConfidence,
    analysis_quality: analysisQuality,
    phoneme_analysis: phonemeAnalysis,
  };
};

const buildWordErrorDetailsPayload = (wordAnalysis) => {
  if (!wordAnalysis) {
    return null;
  }

  return {
    correct_words: wordAnalysis.correct_words,
    substitutions: wordAnalysis.substitutions,
    omissions: wordAnalysis.omissions,
    insertions: wordAnalysis.insertions,
    expected_word_count: wordAnalysis.expected_word_count,
    aligned_words: wordAnalysis.aligned_words,
  };
};

const clampScore = (value) => Math.min(100, Math.max(0, value));

const tokenizeTranscript = (transcript) => {
  if (typeof transcript !== "string" || !transcript.trim()) {
    return [];
  }

  return transcript
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[^\w]+|[^\w]+$/g, "").toLowerCase())
    .filter(Boolean);
};

// Share of tokens that are duplicates (e.g. "AP AP AP AP AP" => 80%).
const getTokenRepetitionRatio = (tokens) => {
  if (tokens.length === 0) {
    return 0;
  }

  const uniqueCount = new Set(tokens).size;
  return (tokens.length - uniqueCount) / tokens.length;
};

const hasMostlyRepeatedTokens = (tokens) =>
  getTokenRepetitionRatio(tokens) > 0.6;

const calculatePronunciationScore = ({ transcript, duration }) => {
  const tokens = tokenizeTranscript(transcript);
  const wordCount = tokens.length;
  let score = 60;

  if (wordCount === 0) {
    score -= 5;
  } else {
    if (wordCount > 5) {
      score += 15;
    }
    if (wordCount > 10) {
      score += 10;
    }
    if (hasMostlyRepeatedTokens(tokens)) {
      score -= 10;
    }
  }

  const safeDuration =
    typeof duration === "number" && !Number.isNaN(duration) ? duration : 0;
  if (safeDuration < 3) {
    score -= 5;
  }

  return clampScore(score);
};

const calculateFluencyScore = ({ transcript, duration }) => {
  const tokens = tokenizeTranscript(transcript);
  const wordCount = tokens.length;
  let score = 65;

  const safeDuration =
    typeof duration === "number" && !Number.isNaN(duration) ? duration : 0;
  if (safeDuration >= 5) {
    score += 10;
  }

  // Sufficient transcript length for fluency assessment.
  if (wordCount > 5) {
    score += 10;
  }

  if (wordCount > 0 && hasMostlyRepeatedTokens(tokens)) {
    score -= 10;
  }

  return clampScore(score);
};

const calculateSpeechScores = ({ transcript, language, duration }) => {
  const scoringInput = { transcript, language, duration };
  const pronunciationScore = calculatePronunciationScore(scoringInput);
  const fluencyScore = calculateFluencyScore(scoringInput);
  const overallScore = Number(
    ((pronunciationScore + fluencyScore) / 2).toFixed(2)
  );

  return { pronunciationScore, fluencyScore, overallScore };
};

const formatAiProgressNote = (row) => ({
  id: row.id,
  patient_id: row.patient_id,
  speech_analysis_id: row.speech_analysis_id,
  note_type: row.note_type,
  generated_by_ai_provider: row.generated_by_ai_provider,
  transcript_summary: row.transcript_summary,
  improvement_summary: row.improvement_summary,
  detected_changes: row.detected_changes,
  clinical_note: row.clinical_note,
  recommended_action: row.recommended_action,
  treatment_analysis: row.treatment_analysis,
  decision_support: row.decision_support,
  confidence_score: row.confidence_score,
  raw_ai_output: row.raw_ai_output,
  created_at: row.created_at
});

const recommendationsToText = (recommendations, fallbackText = "") => {
  if (Array.isArray(recommendations)) {
    const cleaned = recommendations
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    if (cleaned.length > 0) {
      return cleaned.join(" ");
    }
  }

  return fallbackText;
};

const buildTranscriptSummary = (transcript, language, duration) => {
  const normalizedTranscript =
    typeof transcript === "string" ? transcript.trim() : "";
  const excerpt =
    normalizedTranscript.length > 160
      ? `${normalizedTranscript.slice(0, 157)}...`
      : normalizedTranscript;

  const details = [];

  if (typeof language === "string" && language.trim()) {
    details.push(`language: ${language.trim()}`);
  }

  if (typeof duration === "number" && Number.isFinite(duration)) {
    details.push(`duration: ${duration.toFixed(2)}s`);
  }

  const prefix = details.length > 0 ? `Transcript summary (${details.join(", ")}): ` : "Transcript summary: ";

  return `${prefix}${excerpt || "No transcript text was available."}`;
};

const getPatientProfile = async (patientId) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.full_name,
       p.date_of_birth,
       p.gender,
       p.created_at,
       pmi.medical_history,
       pmi.allergies,
       pmi.current_medications,
       pmi.family_history
     FROM patients p
     LEFT JOIN patient_medical_info pmi ON pmi.patient_id = p.id
     WHERE p.id = $1`,
    [patientId]
  );

  return result.rows[0] || null;
};

const getPatientSpeechAnalyses = async (patientId, options = {}) => {
  const { limit = 5, excludeAnalysisId = null } = options;

  const result = await pool.query(
    `SELECT
       sa.id,
       sa.submission_id,
       sa.transcript,
       sa.pronunciation_score,
       sa.fluency_score,
       sa.overall_score,
       sa.compared_to_analysis_id,
       sa.raw_ai_output,
       sa.analyzed_at
     FROM speech_analyses sa
     INNER JOIN exercise_submissions es ON es.id = sa.submission_id
     INNER JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     WHERE ae.patient_id = $1
       AND ($2::uuid IS NULL OR sa.id <> $2::uuid)
     ORDER BY sa.analyzed_at DESC
     LIMIT $3`,
    [patientId, excludeAnalysisId, limit]
  );

  return result.rows;
};

const getPatientProgressSnapshots = async (patientId) => {
  const result = await pool.query(
    `SELECT
       id,
       period,
       period_start,
       period_end,
       exercises_completed,
       average_performance,
       improvement_percentage,
       created_at
     FROM progress_snapshots
     WHERE patient_id = $1
     ORDER BY period_end DESC, created_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientSpecialistNotes = async (patientId) => {
  const result = await pool.query(
    `SELECT
       sn.id,
       sn.note,
       sn.created_at,
       u.full_name AS specialist_name
     FROM specialist_notes sn
     LEFT JOIN users u ON u.id = sn.specialist_id
     WHERE sn.patient_id = $1
     ORDER BY sn.created_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientExerciseReviews = async (patientId) => {
  const result = await pool.query(
    `SELECT
       er.id,
       er.submission_id,
       er.performance_rating,
       er.feedback,
       er.requires_retry,
       er.reviewed_at
     FROM exercise_reviews er
     INNER JOIN exercise_submissions es ON es.id = er.submission_id
     INNER JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     WHERE ae.patient_id = $1
     ORDER BY er.reviewed_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientTreatmentPlanRevisions = async (patientId) => {
  const result = await pool.query(
    `SELECT
       tpr.id,
       tpr.plan_id,
       tpr.change_summary,
       tpr.created_at,
       tp.title AS plan_title
     FROM treatment_plan_revisions tpr
     INNER JOIN treatment_plans tp ON tp.id = tpr.plan_id
     WHERE tp.patient_id = $1
     ORDER BY tpr.created_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientGoals = async (patientId) => {
  const result = await pool.query(
    `SELECT
       g.id,
       g.term,
       g.title,
       g.description,
       g.target_date,
       g.target_value,
       g.is_achieved,
       g.created_at,
       latest_progress.completion_percentage,
       latest_progress.recorded_at AS progress_recorded_at
     FROM goals g
     INNER JOIN treatment_plans tp ON tp.id = g.plan_id
     LEFT JOIN LATERAL (
       SELECT completion_percentage, recorded_at
       FROM goal_progress gp
       WHERE gp.goal_id = g.id
       ORDER BY gp.recorded_at DESC, gp.created_at DESC
       LIMIT 1
     ) AS latest_progress ON TRUE
     WHERE tp.patient_id = $1
     ORDER BY g.created_at DESC
     LIMIT 10`,
    [patientId]
  );

  return result.rows;
};

const getPatientGoalProgress = async (patientId) => {
  const result = await pool.query(
    `SELECT
       gp.id,
       gp.goal_id,
       gp.recorded_at,
       gp.completion_percentage,
       gp.notes,
       gp.created_at,
       g.title AS goal_title,
       g.term AS goal_term
     FROM goal_progress gp
     INNER JOIN goals g ON g.id = gp.goal_id
     INNER JOIN treatment_plans tp ON tp.id = g.plan_id
     WHERE tp.patient_id = $1
     ORDER BY gp.recorded_at DESC, gp.created_at DESC
     LIMIT 12`,
    [patientId]
  );

  return result.rows;
};

const collectPatientContext = async (patientId) => {
  const [
    patientProfile,
    speechAnalyses,
    progressSnapshots,
    specialistNotes,
    exerciseReviews,
    treatmentPlanRevisions,
    goals,
    goalProgress
  ] = await Promise.all([
    getPatientProfile(patientId),
    getPatientSpeechAnalyses(patientId),
    getPatientProgressSnapshots(patientId),
    getPatientSpecialistNotes(patientId),
    getPatientExerciseReviews(patientId),
    getPatientTreatmentPlanRevisions(patientId),
    getPatientGoals(patientId),
    getPatientGoalProgress(patientId)
  ]);

  return {
    patientProfile,
    speechAnalyses,
    progressSnapshots,
    specialistNotes,
    exerciseReviews,
    treatmentPlanRevisions,
    goals,
    goalProgress
  };
};

const buildComparison = (currentAnalysis, previousAnalysis) => {
  if (!previousAnalysis) {
    return {
      pronunciation_change: null,
      fluency_change: null,
      overall_score_change: null,
      trend: "baseline"
    };
  }

  const calculateChange = (currentValue, previousValue) => {
    const normalizedCurrent = toNumber(currentValue);
    const normalizedPrevious = toNumber(previousValue);

    if (normalizedCurrent === null || normalizedPrevious === null) {
      return null;
    }

    return Number((normalizedCurrent - normalizedPrevious).toFixed(2));
  };

  const pronunciationChange = calculateChange(
    currentAnalysis.pronunciation_score,
    previousAnalysis.pronunciation_score
  );
  const fluencyChange = calculateChange(
    currentAnalysis.fluency_score,
    previousAnalysis.fluency_score
  );
  const overallScoreChange = calculateChange(
    currentAnalysis.overall_score,
    previousAnalysis.overall_score
  );

  let trend = "stable";
  if (overallScoreChange === null) {
    trend = "stable";
  } else if (overallScoreChange >= 3) {
    trend = "improvement";
  } else if (overallScoreChange <= -3) {
    trend = "regression";
  }

  return {
    pronunciation_change: pronunciationChange,
    fluency_change: fluencyChange,
    overall_score_change: overallScoreChange,
    trend
  };
};

/**
 * Gemini-only vocabulary for expected-vs-ASR Levenshtein labels.
 * Does not mutate stored DB / API payloads.
 */
const ALIGNED_STATUS_FOR_GEMINI = Object.freeze({
  correct: "correct",
  substitution: "expected_vs_asr_mismatch",
  omission: "omission",
  insertion: "insertion",
});

const deepCloneJson = (value) => {
  if (value === null || value === undefined) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
};

const neutralizeAlignedWordsForGemini = (alignedWords) => {
  if (!Array.isArray(alignedWords)) {
    return alignedWords;
  }

  return alignedWords.map((entry) => {
    if (!entry || typeof entry !== "object") {
      return entry;
    }

    const status = String(entry.status || "")
      .trim()
      .toLowerCase();
    const next = { ...entry };
    if (ALIGNED_STATUS_FOR_GEMINI[status]) {
      next.status = ALIGNED_STATUS_FOR_GEMINI[status];
    }
    if (status === "substitution") {
      next.mismatch_type = "expected_vs_asr_transcript";
    }
    return next;
  });
};

const neutralizeWordAnalysisForGemini = (wordAnalysis) => {
  if (!wordAnalysis || typeof wordAnalysis !== "object") {
    return wordAnalysis;
  }

  const next = { ...wordAnalysis };
  if (Object.prototype.hasOwnProperty.call(next, "substitutions")) {
    next.asr_mismatches = next.substitutions;
    delete next.substitutions;
  }
  if (Object.prototype.hasOwnProperty.call(next, "aligned_words")) {
    next.aligned_words = neutralizeAlignedWordsForGemini(next.aligned_words);
  }
  return next;
};

const neutralizeWordErrorDetailsForGemini = (details) => {
  if (!details || typeof details !== "object") {
    return details;
  }

  const next = { ...details };
  if (Object.prototype.hasOwnProperty.call(next, "substitutions")) {
    next.asr_mismatches = next.substitutions;
    delete next.substitutions;
  }
  if (Object.prototype.hasOwnProperty.call(next, "aligned_words")) {
    next.aligned_words = neutralizeAlignedWordsForGemini(next.aligned_words);
  }
  return next;
};

const neutralizeSpeechAnalysisRowForGemini = (row) => {
  if (!row || typeof row !== "object") {
    return row;
  }

  const next = { ...row };
  if (next.word_analysis) {
    next.word_analysis = neutralizeWordAnalysisForGemini(next.word_analysis);
  }
  if (next.word_error_details) {
    next.word_error_details = neutralizeWordErrorDetailsForGemini(
      next.word_error_details
    );
  }
  return next;
};

const neutralizeProgressInsightsForGemini = (insights) => {
  if (!insights || typeof insights !== "object") {
    return insights;
  }

  const next = { ...insights };

  if (Array.isArray(next.repeated_word_difficulties)) {
    next.repeated_word_difficulties = next.repeated_word_difficulties.map(
      (item) => {
        if (!item || typeof item !== "object") {
          return item;
        }
        const difficulty = { ...item };
        if (Object.prototype.hasOwnProperty.call(difficulty, "substitutions")) {
          difficulty.asr_mismatches = difficulty.substitutions;
          delete difficulty.substitutions;
        }
        return difficulty;
      }
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(next, "repeated_word_substitutions")
  ) {
    const pairs = Array.isArray(next.repeated_word_substitutions)
      ? next.repeated_word_substitutions.map((item) => {
          if (!item || typeof item !== "object") {
            return item;
          }
          return {
            expected_word: item.expected_word ?? null,
            asr_detected_word: item.detected_word ?? null,
            mismatch_count: item.count ?? null,
            last_seen_at: item.last_seen_at ?? null,
            note:
              "Specific expected→ASR pair only. Different asr_detected_word values are different mismatches, not one identical repeated detection.",
          };
        })
      : next.repeated_word_substitutions;
    next.repeated_asr_word_mismatches = pairs;
    delete next.repeated_word_substitutions;
  }

  return next;
};

const LEGACY_HEURISTIC_SCORE_KEYS = new Set([
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

const stripLegacyHeuristicScoreFields = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => stripLegacyHeuristicScoreFields(item));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const next = {};
  for (const [key, nested] of Object.entries(value)) {
    if (LEGACY_HEURISTIC_SCORE_KEYS.has(key) || key === "comparison") {
      continue;
    }
    next[key] = stripLegacyHeuristicScoreFields(nested);
  }
  return next;
};

/**
 * Builds a Gemini-only prompt context with neutralized ASR mismatch vocabulary.
 * Leaves the caller's original objects untouched.
 */
const buildGeminiSafeSpeechPromptContext = (rawContext) => {
  const context = deepCloneJson(rawContext) || {};
  delete context.comparison;

  if (context.current_speech_analysis) {
    context.current_speech_analysis = neutralizeSpeechAnalysisRowForGemini(
      context.current_speech_analysis
    );
  }
  if (context.previous_speech_analysis) {
    context.previous_speech_analysis = neutralizeSpeechAnalysisRowForGemini(
      context.previous_speech_analysis
    );
  }
  if (Array.isArray(context.latest_speech_analyses)) {
    context.latest_speech_analyses = context.latest_speech_analyses.map(
      (row) => neutralizeSpeechAnalysisRowForGemini(row)
    );
  }
  if (context.word_analysis) {
    context.word_analysis = neutralizeWordAnalysisForGemini(
      context.word_analysis
    );
  }
  if (context.speech_progress_insights) {
    context.speech_progress_insights = neutralizeProgressInsightsForGemini(
      context.speech_progress_insights
    );
  }

  return stripLegacyHeuristicScoreFields(context);
};

const buildSpeechAnalysisPrompt = ({
  patientProfile,
  currentAnalysis,
  previousAnalysis,
  comparison,
  context,
  expectedSpeech,
  wordAnalysis,
  fluencyMetrics,
  asrConfidence,
  progressInsights,
  analysisQuality,
  phonemeAnalysis,
  acousticProgress,
}) => {
  const promptContext = buildGeminiSafeSpeechPromptContext({
    current_speech_analysis: currentAnalysis,
    previous_speech_analysis: previousAnalysis,
    expected_speech: expectedSpeech,
    word_analysis: wordAnalysis,
    fluency_metrics: fluencyMetrics,
    asr_confidence: asrConfidence,
    speech_progress_insights: progressInsights,
    analysis_quality: analysisQuality,
    phoneme_analysis: phonemeAnalysis,
    acoustic_progress: acousticProgress,
    patient_profile: patientProfile,
    latest_speech_analyses: context.speechAnalyses,
    specialist_notes: context.specialistNotes,
    exercise_reviews: context.exerciseReviews,
    treatment_plan_revisions: context.treatmentPlanRevisions,
    progress_snapshots: context.progressSnapshots,
    goals: context.goals,
    goal_progress: context.goalProgress,
  });

  return [
    "Create an AI progress note for a rehabilitation specialist after a speech analysis session.",
    "Return ONLY valid JSON.",
    "Use only the provided context.",
    "Do not invent missing data.",
    "If the data is limited, explicitly say that the data is limited.",
    "Do not make a medical diagnosis.",
    "Provide decision support for the specialist, not final medical decisions.",
    "Keep the note concise, practical, and grounded in the transcript, deterministic measurements, and prior context.",
    "Legacy heuristic pronunciation_score, fluency_score, and overall_score are omitted from this context. Do not invent speech scores.",
    "Do NOT describe overall speech score improvement, decline, pronunciation score, or fluency score.",
    "Do NOT treat omitted legacy scores as missing evidence of pronunciation or fluency.",
    "If word_analysis is provided, interpret the deterministic measurements only.",
    "Do NOT recalculate word_accuracy_percentage or invent phoneme-level errors.",
    "Do NOT override the provided word_analysis counts or accuracy values.",
    "Terminology: aligned_words status 'expected_vs_asr_mismatch' and counts named asr_mismatches mean the ASR transcript differed from the expected word. They are expected-vs-ASR labels only.",
    "HARD BAN: Do NOT write substitution, substituted, persistent substitution, consistent substitution, or articulation substitution when evidence is only expected-vs-ASR word alignment / asr_mismatches.",
    "Do NOT describe ASR mismatches as confirmed patient speech substitutions, pronunciation substitutions, or articulatory errors.",
    "Preferred wording example: The ASR transcript differed from the expected word 'world', detecting 'word' instead.",
    "For repeated mismatches across attempts, prefer: The expected word 'world' differed from the ASR transcript across multiple attempts.",
    "Do NOT say a patient substituted one word for another based only on ASR transcript mismatch.",
    "Do NOT say the patient repeatedly substituted a word based only on ASR history.",
    "LOW ASR CONFIDENCE RULE: If asr_confidence shows low probability for a mismatched detected word, treat that mismatch as uncertain ASR evidence only.",
    "With low ASR confidence, do NOT infer articulation difficulty, mispronunciation, substitution, or a persistent speech error from the mismatch alone. You may recommend specialist audio review.",
    "HISTORICAL MISMATCH RULE: If prior attempts show DIFFERENT ASR-detected words for the same expected word (for example world→Void then world→word), do NOT claim the same detected word occurred repeatedly.",
    "Allowed historical wording: The expected word 'world' differed from the ASR transcript in both attempts.",
    "Not allowed historical wording: 'world' was consistently detected as 'word'.",
    "Treat repeated_asr_word_mismatches entries as distinct expected→ASR pairs. Different asr_detected_word values are not identical repeated detections.",
    "If fluency_metrics are provided, treat them as measured timing data only.",
    "Do NOT invent missing timing measurements.",
    "Do NOT diagnose stuttering or another disorder solely from timing metrics.",
    "Do NOT reinterpret ASR confidence as pronunciation accuracy.",
    "Do NOT claim phoneme-level findings.",
    "If speech_progress_insights are provided, treat them as measured historical data only.",
    "Do NOT recalculate word accuracy trends, repeated word difficulties, or fluency trends.",
    "Do NOT invent phoneme-level substitution claims from repeated word mismatches.",
    "Do NOT claim clinical significance or validated improvement from trend labels.",
    "Distinguish ASR-detected word mismatch from acoustic mispronunciation.",
    "Describe trends cautiously and recommend specialist review when appropriate.",
    "If analysis_quality is provided, treat it as measured reliability data only.",
    "If analysis_quality.status is low_quality or usable_with_caution, avoid strong conclusions.",
    "When quality warnings exist, recommend specialist review of the recording and transcript.",
    "Do NOT treat low word accuracy automatically as poor articulation when quality warnings indicate mismatch or low ASR confidence.",
    "Do NOT hide or ignore analysis_quality warnings.",
    "If phoneme_analysis is provided, treat it as model-estimated forced-alignment timing only.",
    "Forced alignment does NOT prove pronunciation correctness.",
    "Do NOT infer phoneme substitutions, acoustic correctness, or clinical diagnosis from phoneme_analysis.",
    "Do NOT invent phone results or call phone durations good or bad.",
    "Do NOT claim validated phoneme scores.",
    "If target occurrences include acoustic_measurements, treat them as descriptive signal measurements only.",
    "Null acoustic values mean the measurement was unavailable, not that pronunciation is abnormal.",
    "Do NOT compare F0, intensity, or formants against invented normal ranges.",
    "Do NOT infer pronunciation correctness, phoneme substitution, diagnosis, or an acoustic score.",
    "If acoustic_progress is provided, treat it as deterministic historical measurement data only.",
    "Describe acoustic changes neutrally as increases, decreases, or variability.",
    "Do NOT call longer/shorter duration better or worse.",
    "Do NOT compare F0 or intensity against invented normal ranges.",
    "Do NOT convert acoustic changes into pronunciation correctness or clinical improvement.",
    "Mention measurement-quality limitations when acoustic_progress quality is limited.",
    "",
    "Context:",
    JSON.stringify(promptContext, null, 2)
  ].join("\n");
};

const formatFallbackMetric = (value, digits = 1) => {
  const numeric = toNumber(value);
  if (numeric === null) {
    return null;
  }
  if (Number.isInteger(numeric)) {
    return String(numeric);
  }
  return numeric.toFixed(digits);
};

const describeMetricChange = (label, first, latest, unit = "") => {
  const from = formatFallbackMetric(first);
  const to = formatFallbackMetric(latest);
  if (from === null || to === null) {
    return null;
  }
  if (from === to) {
    return `${label} remained ${from}${unit}.`;
  }
  return `${label} changed from ${from}${unit} to ${to}${unit}.`;
};

const buildFallbackAiNoteData = ({
  patientProfile,
  currentAnalysis,
  previousAnalysis,
  context,
  wordAnalysis = null,
  fluencyMetrics = null,
  progressInsights = null,
}) => {
  const improvements = [];
  const regressions = [];
  const stableAreas = [];
  const wordTrend = progressInsights?.word_accuracy_trend || null;
  const fluencyTrend = progressInsights?.fluency_trend || null;
  const currentAccuracy =
    toNumber(wordAnalysis?.word_accuracy_percentage) ??
    toNumber(currentAnalysis?.word_accuracy_percentage) ??
    toNumber(wordTrend?.latest_accuracy);
  const attemptCount = toNumber(wordTrend?.attempt_count) ?? 0;

  if (attemptCount < 2) {
    stableAreas.push(
      "This is the first comparable speech analysis for this exercise text, or historical word-accuracy data is limited."
    );
  } else {
    const accuracyChange = describeMetricChange(
      "Word accuracy",
      wordTrend.first_accuracy,
      wordTrend.latest_accuracy,
      "%"
    );
    if (accuracyChange) {
      const changePoints = toNumber(wordTrend.change_percentage_points);
      if (changePoints !== null && changePoints > 0) {
        improvements.push(accuracyChange);
      } else if (changePoints !== null && changePoints < 0) {
        regressions.push(accuracyChange);
      } else {
        stableAreas.push(accuracyChange);
      }
    }

    const speakingRateChange = describeMetricChange(
      "Speaking rate",
      fluencyTrend?.words_per_minute?.first,
      fluencyTrend?.words_per_minute?.latest,
      " words/min"
    );
    if (speakingRateChange) {
      stableAreas.push(speakingRateChange);
    }

    const pauseRatioChange = describeMetricChange(
      "Pause ratio",
      fluencyTrend?.pause_ratio_percentage?.first,
      fluencyTrend?.pause_ratio_percentage?.latest,
      "%"
    );
    if (pauseRatioChange) {
      stableAreas.push(pauseRatioChange);
    }
  }

  if (currentAccuracy !== null) {
    stableAreas.push(
      `Current session word accuracy is ${formatFallbackMetric(currentAccuracy, 1)}%. This is expected-vs-ASR alignment, not a confirmed pronunciation score.`
    );
  }

  if (fluencyMetrics?.words_per_minute != null) {
    stableAreas.push(
      `Current speaking rate is ${formatFallbackMetric(fluencyMetrics.words_per_minute, 1)} words/min.`
    );
  }

  if (typeof currentAnalysis.transcript === "string" && currentAnalysis.transcript.trim()) {
    stableAreas.push("A real Faster-Whisper transcript is available for specialist review.");
  } else {
    stableAreas.push("Transcript data is limited for this session.");
  }

  if (!previousAnalysis) {
    stableAreas.push("Trend interpretation is limited because there is no previous speech analysis.");
  }

  if (context.specialistNotes.length === 0) {
    stableAreas.push("Specialist note context is limited.");
  }

  if (improvements.length === 0 && regressions.length === 0) {
    stableAreas.push(
      "Progress requires specialist interpretation of the transcript, word accuracy, timing metrics, and audio."
    );
  }

  const patientName = patientProfile?.full_name || "The patient";
  let improvementSummary =
    `${patientName}: deterministic speech measurements are available for specialist review. Do not treat omitted legacy heuristic scores as pronunciation or fluency evidence.`;
  if (wordTrend && attemptCount >= 2) {
    const accuracyChange = describeMetricChange(
      "Word accuracy",
      wordTrend.first_accuracy,
      wordTrend.latest_accuracy,
      "%"
    );
    if (accuracyChange) {
      improvementSummary = `${patientName}: ${accuracyChange} ASR mismatch is not confirmed mispronunciation. Specialist review of the audio is recommended.`;
    }
  } else if (attemptCount < 2) {
    improvementSummary = `${patientName} now has an initial speech analysis baseline. Additional sessions are needed before interpreting progress.`;
  }

  const recommendedAction =
    "Review the recording, expected-vs-ASR word alignment, timing metrics, and any target-sound measurements. Do not infer pronunciation correctness from ASR mismatch or omitted heuristic scores.";

  return {
    clinical_note: `Rule-based speech progress note for ${patientName}. Available deterministic context was used to support specialist review after the current speech analysis session. ASR mismatch does not prove a patient pronunciation error.`,
    improvement_summary: improvementSummary,
    detected_changes: {
      improvements,
      regressions,
      stable_areas: stableAreas
    },
    treatment_analysis: `Context reviewed: ${context.speechAnalyses.length} speech analyses, ${context.progressSnapshots.length} progress snapshots, ${context.specialistNotes.length} specialist notes, ${context.exerciseReviews.length} exercise reviews, ${context.treatmentPlanRevisions.length} treatment plan revisions, ${context.goals.length} goals, and ${context.goalProgress.length} goal progress entries. Acoustic measurement changes, when present, are descriptive only and do not confirm pronunciation correctness.`,
    recommendations: [recommendedAction],
    decision_support: {
      suggested_action: "monitor_closely",
      reason:
        "Legacy overall/pronunciation/fluency scores are not used. Progress should be interpreted from word accuracy, timing metrics, target-sound measurements, and specialist audio review."
    },
    confidence_score: 0.5
  };
};

const insertAiProgressNote = async ({
  patientId,
  speechAnalysisId,
  generatedByAiProvider,
  transcriptSummary,
  improvementSummary,
  detectedChanges,
  clinicalNote,
  recommendedAction,
  treatmentAnalysis,
  decisionSupport,
  confidenceScore,
  rawAiOutput
}) => {
  const result = await pool.query(
    `INSERT INTO ai_progress_notes (
       patient_id,
       speech_analysis_id,
       note_type,
       generated_by_ai_provider,
       transcript_summary,
       improvement_summary,
       detected_changes,
       clinical_note,
       recommended_action,
       treatment_analysis,
       decision_support,
       confidence_score,
       raw_ai_output
     )
     VALUES (
       $1,
       $2,
       'speech_analysis',
       $3,
       $4,
       $5,
       $6::jsonb,
       $7,
       $8,
       $9,
       $10::jsonb,
       $11,
       $12::jsonb
     )
     RETURNING *`,
    [
      patientId,
      speechAnalysisId,
      generatedByAiProvider,
      transcriptSummary,
      improvementSummary,
      detectedChanges,
      clinicalNote,
      recommendedAction,
      treatmentAnalysis,
      decisionSupport,
      confidenceScore,
      rawAiOutput
    ]
  );

  return formatAiProgressNote(result.rows[0]);
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isSpecialistAssignedToPatient = async (specialistId, patientId) => {
  const result = await pool.query(
    `SELECT 1
     FROM patient_specialists
     WHERE specialist_id = $1
       AND patient_id = $2
     LIMIT 1`,
    [specialistId, patientId]
  );
  return result.rows.length > 0;
};

const assertSpeechAnalysisAccess = async (actor, patientId) => {
  if (!actor || !actor.id) {
    throw createError("Authentication required", 401);
  }

  if (actor.role === "admin") {
    return;
  }

  if (actor.role === "specialist") {
    const linked = await isSpecialistAssignedToPatient(actor.id, patientId);
    if (!linked) {
      throw createError(
        "You do not have permission to access this patient's speech analyses.",
        403
      );
    }
    return;
  }

  throw createError(
    "You do not have permission to access this patient's speech analyses.",
    403
  );
};

const resolvePatientIdForAnalysis = async (analysisId) => {
  const result = await pool.query(
    `
    SELECT ae.patient_id
    FROM speech_analyses sa
    JOIN exercise_submissions es ON es.id = sa.submission_id
    JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
    WHERE sa.id = $1
    LIMIT 1
    `,
    [analysisId]
  );

  return result.rows[0]?.patient_id ?? null;
};

const resolvePatientIdForSubmission = async (submissionId) => {
  const result = await pool.query(
    `
    SELECT ae.patient_id
    FROM exercise_submissions es
    JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
    WHERE es.id = $1
    LIMIT 1
    `,
    [submissionId]
  );

  return result.rows[0]?.patient_id ?? null;
};

const loadPatientSpeechAnalysesForInsights = async (patientId) => {
  const result = await pool.query(
    `
    SELECT
      sa.id,
      sa.submission_id,
      sa.expected_text,
      sa.word_accuracy_percentage,
      sa.word_error_details,
      sa.speech_timing_metrics,
      sa.speech_phoneme_analysis,
      sa.overall_score,
      sa.analyzed_at,
      ae.exercise_id,
      e.target_phoneme AS exercise_target_phoneme
    FROM speech_analyses sa
    JOIN exercise_submissions es ON es.id = sa.submission_id
    JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
    JOIN exercises e ON e.id = ae.exercise_id
    WHERE ae.patient_id = $1
    ORDER BY sa.analyzed_at ASC
    `,
    [patientId]
  );

  return result.rows;
};

const buildSpeechProgressInsightsForPatient = async (
  patientId,
  scope = {}
) => {
  const analyses = await loadPatientSpeechAnalysesForInsights(patientId);
  return speechProgressInsightsService.buildSpeechProgressInsights({
    patientId,
    analyses,
    scope,
  });
};

const buildSpeechAcousticProgressForPatient = async (
  patientId,
  scope = {},
  options = {}
) => {
  const analyses = await loadPatientSpeechAnalysesForInsights(patientId);
  return speechAcousticProgressService.buildSpeechAcousticProgress({
    patientId,
    analyses,
    scope,
    currentAnalysisId: options.currentAnalysisId ?? null,
  });
};

const resolveSubmissionAudioPath = (fileUrl) => {
  if (typeof fileUrl !== "string" || !fileUrl.trim()) {
    throw createError(
      "This submission does not contain a supported audio recording.",
      422
    );
  }

  const normalizedFileUrl = fileUrl.trim();

  if (
    normalizedFileUrl.startsWith("http://") ||
    normalizedFileUrl.startsWith("https://")
  ) {
    throw createError(
      "External audio URLs are not supported for speech analysis transcription.",
      400
    );
  }

  if (normalizedFileUrl.startsWith("/uploads/")) {
    const relative = normalizedFileUrl.slice("/uploads/".length);
    return path.join(uploadsRoot, relative);
  }

  if (normalizedFileUrl.startsWith("uploads/")) {
    const relative = normalizedFileUrl.slice("uploads/".length);
    return path.join(uploadsRoot, relative);
  }

  if (path.isAbsolute(normalizedFileUrl)) {
    return normalizedFileUrl;
  }

  return path.resolve(backendRoot, normalizedFileUrl);
};

const buildAnalyzeResponse = async ({
  submission,
  currentAnalysis,
  created,
  exerciseContext = null,
}) => {
  const previousAnalyses = await getPatientSpeechAnalyses(submission.patient_id, {
    limit: 1,
    excludeAnalysisId: currentAnalysis.id,
  });
  const previousAnalysis = previousAnalyses[0] || null;
  const comparison = buildComparison(currentAnalysis, previousAnalysis);
  const enrichedCurrentAnalysis = attachSpeechAnalysisExtensions(
    currentAnalysis,
    exerciseContext
  );
  const expectedSpeech = enrichedCurrentAnalysis.expected_speech;
  const wordAnalysis = enrichedCurrentAnalysis.word_analysis;
  const fluencyMetrics = enrichedCurrentAnalysis.fluency_metrics;
  const asrConfidence = enrichedCurrentAnalysis.asr_confidence;
  const analysisQuality = enrichedCurrentAnalysis.analysis_quality;
  const phonemeAnalysis = enrichedCurrentAnalysis.phoneme_analysis;
  const progressInsights = await buildSpeechProgressInsightsForPatient(
    submission.patient_id,
    {
      exercise_id: submission.exercise_id ?? null,
      expected_text:
        enrichedCurrentAnalysis.expected_text ??
        exerciseContext?.expected_text ??
        null,
    }
  );
  const acousticProgress = await buildSpeechAcousticProgressForPatient(
    submission.patient_id,
    {
      exercise_id: submission.exercise_id ?? null,
      expected_text:
        enrichedCurrentAnalysis.expected_text ??
        exerciseContext?.expected_text ??
        phonemeAnalysis?.expected_text ??
        null,
      target_phone_requested:
        phonemeAnalysis?.target_phone?.requested ??
        exerciseContext?.target_phoneme ??
        null,
      target_phone_ipa: phonemeAnalysis?.target_phone?.ipa ?? null,
    },
    { currentAnalysisId: currentAnalysis.id }
  );

  let aiProgressNote = null;
  let aiProgressNoteError = null;

  if (created) {
    try {
      const context = await collectPatientContext(submission.patient_id);
      const patientProfile = context.patientProfile || {
        id: submission.patient_id,
        full_name: submission.patient_name,
      };
      const prompt = buildSpeechAnalysisPrompt({
        patientProfile,
        currentAnalysis: enrichedCurrentAnalysis,
        previousAnalysis,
        comparison,
        context,
        expectedSpeech,
        wordAnalysis,
        fluencyMetrics,
        asrConfidence,
        progressInsights,
        analysisQuality,
        phonemeAnalysis,
        acousticProgress,
      });
      const fallbackAiNoteData = buildFallbackAiNoteData({
        patientProfile,
        currentAnalysis,
        previousAnalysis,
        context,
        wordAnalysis,
        fluencyMetrics,
        progressInsights,
      });
      const providerResult = await aiProviderService.generateClinicalSummaryJson(
        prompt,
        fallbackAiNoteData
      );

      aiProgressNote = await insertAiProgressNote({
        patientId: submission.patient_id,
        speechAnalysisId: currentAnalysis.id,
        generatedByAiProvider: providerResult.provider || "rule_based",
        transcriptSummary: buildTranscriptSummary(
          currentAnalysis.transcript,
          currentAnalysis.language,
          currentAnalysis.duration
        ),
        improvementSummary: providerResult.improvement_summary,
        detectedChanges: providerResult.detected_changes,
        clinicalNote: providerResult.clinical_note,
        recommendedAction: recommendationsToText(
          providerResult.recommendations,
          fallbackAiNoteData.recommendations[0] || ""
        ),
        treatmentAnalysis: providerResult.treatment_analysis,
        decisionSupport: providerResult.decision_support,
        confidenceScore:
          typeof providerResult.confidence_score === "number"
            ? providerResult.confidence_score
            : 0.5,
        rawAiOutput: {
          provider_response: providerResult,
          comparison,
          context_metadata: {
            patient_id: submission.patient_id,
            current_speech_analysis_id: currentAnalysis.id,
            previous_speech_analysis_id: previousAnalysis?.id || null,
            context_counts: {
              speech_analyses: context.speechAnalyses.length,
              progress_snapshots: context.progressSnapshots.length,
              specialist_notes: context.specialistNotes.length,
              exercise_reviews: context.exerciseReviews.length,
              treatment_plan_revisions: context.treatmentPlanRevisions.length,
              goals: context.goals.length,
              goal_progress: context.goalProgress.length,
            },
            transcript: {
              language: currentAnalysis.language,
              duration: currentAnalysis.duration,
              text_length: currentAnalysis.transcript?.length || 0,
            },
            expected_speech: expectedSpeech,
            word_analysis: wordAnalysis,
            fluency_metrics: fluencyMetrics,
            asr_confidence: asrConfidence,
            speech_progress_insights: progressInsights,
            analysis_quality: analysisQuality,
            phoneme_analysis: phonemeAnalysis,
            acoustic_progress: acousticProgress,
          },
        },
      });
    } catch (error) {
      aiProgressNoteError = error.message;
    }
  }

  return {
    created,
    analysis: {
      ...enrichedCurrentAnalysis,
      current_analysis: enrichedCurrentAnalysis,
      previous_analysis: previousAnalysis
        ? attachSpeechAnalysisExtensions(previousAnalysis)
        : null,
      comparison,
      progress_insights: progressInsights,
      acoustic_progress: acousticProgress,
      ai_progress_note: aiProgressNote,
      ai_progress_note_error: aiProgressNoteError,
    },
  };
};

const loadSubmissionContext = async (submissionId) => {
  const submissionResult = await pool.query(
    `
    SELECT
      es.id AS submission_id,
      es.assigned_exercise_id,
      ae.patient_id,
      ae.exercise_id,
      p.full_name AS patient_name,
      e.title AS exercise_title,
      e.language AS exercise_language,
      e.expected_text AS exercise_expected_text,
      e.target_word AS exercise_target_word,
      e.target_phoneme AS exercise_target_phoneme
    FROM exercise_submissions es
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    JOIN exercises e ON ae.exercise_id = e.id
    JOIN patients p ON ae.patient_id = p.id
    WHERE es.id = $1
    `,
    [submissionId]
  );

  if (submissionResult.rows.length === 0) {
    return null;
  }

  const row = submissionResult.rows[0];
  return {
    submission: row,
    exerciseContext: {
      title: row.exercise_title,
      language: row.exercise_language,
      expected_text: row.exercise_expected_text,
      target_word: row.exercise_target_word,
      target_phoneme: row.exercise_target_phoneme,
    },
  };
};

const isSpeechAnalysisSubmissionUniqueViolation = (error) => {
  if (!error || error.code !== "23505") {
    return false;
  }

  const haystack = [
    error.constraint,
    error.detail,
    error.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("submission_id") ||
    haystack.includes("idx_speech_analyses_submission_id_unique")
  );
};

const insertSpeechAnalysisForSubmission = async ({
  submissionId,
  transcript,
  pronunciationScore,
  fluencyScore,
  overallScore,
  comparedToAnalysisId,
  rawAiOutput,
  expectedText,
  wordAccuracyPercentage,
  wordErrorDetails,
  timingMetrics,
  analysisQuality,
  phonemeAnalysis,
}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO speech_analyses
      (
        submission_id,
        transcript,
        pronunciation_score,
        fluency_score,
        overall_score,
        compared_to_analysis_id,
        raw_ai_output,
        expected_text,
        word_accuracy_percentage,
        word_error_details,
        speech_timing_metrics,
        speech_analysis_quality,
        speech_phoneme_analysis
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
      `,
      [
        submissionId,
        transcript,
        pronunciationScore,
        fluencyScore,
        overallScore,
        comparedToAnalysisId,
        rawAiOutput,
        expectedText,
        wordAccuracyPercentage,
        wordErrorDetails,
        timingMetrics,
        analysisQuality,
        phonemeAnalysis,
      ]
    );
    return { row: result.rows[0], created: true };
  } catch (error) {
    if (!isSpeechAnalysisSubmissionUniqueViolation(error)) {
      throw error;
    }

    const existing = await getSpeechAnalysisBySubmission(submissionId);
    if (!existing) {
      throw error;
    }

    return { row: existing, created: false };
  }
};

const analyzeSpeech = async ({ submission_id }, options = {}) => {
  if (!submission_id || String(submission_id).trim() === "") {
    throw createError("submission_id is required", 400);
  }

  const normalizedSubmissionId = String(submission_id).trim();
  if (!UUID_RE.test(normalizedSubmissionId)) {
    throw createError("submission_id must be a valid UUID", 400);
  }

  const loadedContext = await loadSubmissionContext(normalizedSubmissionId);
  if (!loadedContext) {
    throw createError("Exercise submission not found.", 404);
  }

  const submission = loadedContext.submission;
  const exerciseContext = loadedContext.exerciseContext;
  await assertSpeechAnalysisAccess(options.actor, submission.patient_id);

  const existingAnalysis = await getSpeechAnalysisBySubmission(
    normalizedSubmissionId
  );
  if (existingAnalysis) {
    return buildAnalyzeResponse({
      submission,
      currentAnalysis: hydrateSpeechAnalysisRow(existingAnalysis, exerciseContext),
      created: false,
      exerciseContext,
    });
  }

  const submissionMediaResult = await pool.query(
    `
    SELECT sm.file_url, sm.media_type::text AS media_type
    FROM submission_media sm
    WHERE sm.submission_id = $1
      AND (
        sm.media_type = 'audio'
        OR sm.file_url ~* $2
      )
    ORDER BY
      CASE WHEN sm.media_type = 'audio' THEN 0 ELSE 1 END,
      sm.created_at DESC
    LIMIT 1
    `,
    [normalizedSubmissionId, '\\.(mp3|wav|m4a|aac|ogg|webm|flac)(\\?|#|$)']
  );

  if (submissionMediaResult.rows.length === 0) {
    throw createError(
      "This submission does not contain a supported audio recording.",
      422
    );
  }

  const audioFilePath = resolveSubmissionAudioPath(
    submissionMediaResult.rows[0].file_url
  );

  const resolvedLanguage = resolveExerciseLanguage(submission.exercise_language);

  let transcription;
  try {
    transcription = await fasterWhisperService.transcribeAudio(audioFilePath, {
      language: resolvedLanguage,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      throw createError(
        "This submission does not contain a supported audio recording.",
        422
      );
    }
    throw error;
  }

  const { pronunciationScore, fluencyScore, overallScore } =
    calculateSpeechScores({
      transcript: transcription.transcript,
      language: transcription.language,
      duration: transcription.duration,
    });

  const wordAnalysis = speechWordAlignmentService.compareExpectedToTranscript(
    exerciseContext.expected_text,
    transcription.transcript
  );
  const storedExpectedText = speechWordAlignmentService.hasMeaningfulExpectedText(
    exerciseContext.expected_text
  )
    ? String(exerciseContext.expected_text).trim()
    : null;

  const timingMetrics = speechTimingMetricsService.calculateSpeechTimingMetrics({
    segments: transcription.segments,
    transcript: transcription.transcript,
    audioDurationSeconds: transcription.duration,
  });

  const rawAiOutput = {
    analysis_type: "faster_whisper_transcription",
    patient_name: submission.patient_name,
    transcription_engine: "faster-whisper",
    language: resolvedLanguage,
    duration: transcription.duration,
    exercise_title: exerciseContext.title,
    segments: Array.isArray(transcription.segments) ? transcription.segments : null,
  };

  const historicalAnalyses = await loadPatientSpeechAnalysesForInsights(
    submission.patient_id
  );
  const comparedToAnalysisId =
    speechProgressInsightsService.findPreviousComparableAnalysisId(
      historicalAnalyses,
      {
        patient_id: submission.patient_id,
        exercise_id: submission.exercise_id ?? null,
        expected_text: storedExpectedText,
        current_analysis_id: null,
      }
    );

  const analysisQuality = speechAnalysisQualityService.assessSpeechAnalysisQuality({
    transcript: transcription.transcript,
    expectedText: exerciseContext.expected_text,
    wordAnalysis,
    timingMetrics,
    asrConfidence: timingMetrics?.asr_confidence ?? null,
    segments: transcription.segments,
  });

  let phonemeAnalysis = null;
  if (
    resolvedLanguage === "en" &&
    speechWordAlignmentService.hasMeaningfulExpectedText(exerciseContext.expected_text)
  ) {
    try {
      const phonemeResult = await mfaPhonemeAlignmentService.runPhonemeAlignment({
        audioFilePath,
        expectedText: exerciseContext.expected_text,
        targetPhoneme: exerciseContext.target_phoneme,
        language: resolvedLanguage,
      });
      phonemeAnalysis =
        phonemeResult?.quality?.status === "unavailable" ? null : phonemeResult;
    } catch (error) {
      console.error("[speech-analyses] V3.1 phoneme alignment failed:", error.message);
      phonemeAnalysis = null;
    }
  }

  const inserted = await insertSpeechAnalysisForSubmission({
    submissionId: normalizedSubmissionId,
    transcript: transcription.transcript,
    pronunciationScore,
    fluencyScore,
    overallScore,
    comparedToAnalysisId,
    rawAiOutput,
    expectedText: storedExpectedText,
    wordAccuracyPercentage: wordAnalysis?.word_accuracy_percentage ?? null,
    wordErrorDetails: buildWordErrorDetailsPayload(wordAnalysis),
    timingMetrics,
    analysisQuality,
    phonemeAnalysis,
  });

  if (!inserted.created) {
    return buildAnalyzeResponse({
      submission,
      currentAnalysis: hydrateSpeechAnalysisRow(inserted.row, exerciseContext),
      created: false,
      exerciseContext,
    });
  }

  const currentAnalysis = hydrateSpeechAnalysisRow(
    {
      ...inserted.row,
      language: resolvedLanguage,
      duration: transcription.duration,
    },
    exerciseContext
  );

  return buildAnalyzeResponse({
    submission,
    currentAnalysis,
    created: true,
    exerciseContext,
  });
};

const getSpeechAnalysisById = async (id, options = {}) => {
  if (options.actor) {
    const patientId = await resolvePatientIdForAnalysis(id);
    if (!patientId) {
      return null;
    }
    await assertSpeechAnalysisAccess(options.actor, patientId);
  }

  const result = await pool.query(
    `
    SELECT
      sa.*,
      ae.exercise_id,
      e.title AS exercise_title,
      e.language AS exercise_language,
      e.expected_text AS exercise_expected_text,
      e.target_word AS exercise_target_word,
      e.target_phoneme AS exercise_target_phoneme
    FROM speech_analyses sa
    JOIN exercise_submissions es ON es.id = sa.submission_id
    JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
    JOIN exercises e ON e.id = ae.exercise_id
    WHERE sa.id = $1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return hydrateSpeechAnalysisRow(row, {
    exercise_id: row.exercise_id,
    title: row.exercise_title,
    language: row.exercise_language,
    expected_text: row.exercise_expected_text,
    target_word: row.exercise_target_word,
    target_phoneme: row.exercise_target_phoneme,
  });
};

const getSpeechAnalysesByPatient = async (patientId, options = {}) => {
  if (options.actor) {
    await assertSpeechAnalysisAccess(options.actor, patientId);
  }

  const result = await pool.query(
    `
    SELECT
      sa.*,
      ae.exercise_id,
      e.title AS exercise_title,
      e.language AS exercise_language,
      e.expected_text AS exercise_expected_text,
      e.target_word AS exercise_target_word,
      e.target_phoneme AS exercise_target_phoneme
    FROM speech_analyses sa
    JOIN exercise_submissions es ON sa.submission_id = es.id
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    JOIN exercises e ON ae.exercise_id = e.id
    WHERE ae.patient_id = $1
    ORDER BY sa.analyzed_at DESC
    `,
    [patientId]
  );

  return result.rows.map((row) =>
    hydrateSpeechAnalysisRow(row, {
      exercise_id: row.exercise_id,
      title: row.exercise_title,
      language: row.exercise_language,
      expected_text: row.exercise_expected_text,
      target_word: row.exercise_target_word,
      target_phoneme: row.exercise_target_phoneme,
    })
  );
};

const getSpeechAnalysisBySubmission = async (submissionId, options = {}) => {
  if (options.actor) {
    const patientId = await resolvePatientIdForSubmission(submissionId);
    if (!patientId) {
      return null;
    }
    await assertSpeechAnalysisAccess(options.actor, patientId);
  }

  const result = await pool.query(
    `
    SELECT
      sa.*,
      ae.exercise_id,
      e.title AS exercise_title,
      e.language AS exercise_language,
      e.expected_text AS exercise_expected_text,
      e.target_word AS exercise_target_word,
      e.target_phoneme AS exercise_target_phoneme
    FROM speech_analyses sa
    JOIN exercise_submissions es ON es.id = sa.submission_id
    JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
    JOIN exercises e ON e.id = ae.exercise_id
    WHERE sa.submission_id = $1
    ORDER BY sa.analyzed_at DESC
    LIMIT 1
    `,
    [submissionId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return hydrateSpeechAnalysisRow(row, {
    exercise_id: row.exercise_id,
    title: row.exercise_title,
    language: row.exercise_language,
    expected_text: row.exercise_expected_text,
    target_word: row.exercise_target_word,
    target_phoneme: row.exercise_target_phoneme,
  });
};

const getSpeechProgressByPatient = async (patientId, options = {}) => {
  if (options.actor) {
    await assertSpeechAnalysisAccess(options.actor, patientId);
  }

  const result = await pool.query(
    `
    SELECT 
      sa.id,
      sa.pronunciation_score,
      sa.fluency_score,
      sa.overall_score,
      sa.word_accuracy_percentage,
      sa.analyzed_at
    FROM speech_analyses sa
    JOIN exercise_submissions es ON sa.submission_id = es.id
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    WHERE ae.patient_id = $1
    ORDER BY sa.analyzed_at ASC
    `,
    [patientId]
  );

  const progressPoints = result.rows;
  const includeInsights =
    options.includeInsights === true ||
    String(options.includeInsights || "").toLowerCase() === "true";

  if (!includeInsights) {
    return {
      progressPoints,
      insights: null,
    };
  }

  const scope = {
    exercise_id: options.exerciseId ?? null,
    expected_text: options.expectedText ?? null,
  };
  const insights = await buildSpeechProgressInsightsForPatient(patientId, scope);
  const acousticProgress = await buildSpeechAcousticProgressForPatient(
    patientId,
    {
      ...scope,
      target_phone_requested: options.targetPhoneme ?? null,
      target_phone_ipa: options.targetPhoneIpa ?? null,
    },
    { currentAnalysisId: options.currentAnalysisId ?? null }
  );

  return {
    progressPoints,
    insights,
    acousticProgress,
  };
};

module.exports = {
  analyzeSpeech,
  getSpeechAnalysisById,
  getSpeechAnalysesByPatient,
  getSpeechAnalysisBySubmission,
  getSpeechProgressByPatient,
  buildSpeechProgressInsightsForPatient,
  buildSpeechAcousticProgressForPatient,
  buildSpeechAnalysisPrompt,
  buildGeminiSafeSpeechPromptContext,
  neutralizeWordAnalysisForGemini,
  neutralizeProgressInsightsForGemini,
  buildFallbackAiNoteData,
  isSpeechAnalysisSubmissionUniqueViolation,
  insertSpeechAnalysisForSubmission,
};
