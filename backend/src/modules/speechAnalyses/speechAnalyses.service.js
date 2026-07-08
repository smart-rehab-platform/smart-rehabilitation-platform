const path = require("path");

const pool = require("../../database/db");
const aiProviderService = require("../../services/aiProvider.service");
const fasterWhisperService = require("../../services/fasterWhisper.service");

const backendRoot = path.resolve(__dirname, "..", "..", "..");
const uploadsRoot = path.resolve(backendRoot, "uploads");

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

const buildSpeechAnalysisPrompt = ({
  patientProfile,
  currentAnalysis,
  previousAnalysis,
  comparison,
  context
}) => {
  const promptContext = {
    current_speech_analysis: currentAnalysis,
    previous_speech_analysis: previousAnalysis,
    comparison,
    patient_profile: patientProfile,
    latest_speech_analyses: context.speechAnalyses,
    specialist_notes: context.specialistNotes,
    exercise_reviews: context.exerciseReviews,
    treatment_plan_revisions: context.treatmentPlanRevisions,
    progress_snapshots: context.progressSnapshots,
    goals: context.goals,
    goal_progress: context.goalProgress
  };

  return [
    "Create an AI progress note for a rehabilitation specialist after a speech analysis session.",
    "Return ONLY valid JSON.",
    "Use only the provided context.",
    "Do not invent missing data.",
    "If the data is limited, explicitly say that the data is limited.",
    "Do not make a medical diagnosis.",
    "Provide decision support for the specialist, not final medical decisions.",
    "Keep the note concise, practical, and grounded in the transcript, scores, and prior context.",
    "",
    "Context:",
    JSON.stringify(promptContext, null, 2)
  ].join("\n");
};

const buildFallbackAiNoteData = ({
  patientProfile,
  currentAnalysis,
  previousAnalysis,
  comparison,
  context
}) => {
  const improvements = [];
  const regressions = [];
  const stableAreas = [];

  if (comparison.trend === "baseline") {
    stableAreas.push(
      "This is the first available speech analysis baseline for the patient."
    );
  } else if (comparison.trend === "improvement") {
    improvements.push(
      `Overall speech score improved by ${comparison.overall_score_change.toFixed(2)} points compared with the previous analysis.`
    );
  } else if (comparison.trend === "regression") {
    regressions.push(
      `Overall speech score declined by ${Math.abs(comparison.overall_score_change).toFixed(2)} points compared with the previous analysis.`
    );
  } else {
    stableAreas.push(
      "Overall speech performance is stable compared with the previous analysis."
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

  const patientName = patientProfile?.full_name || "The patient";
  const improvementSummary =
    comparison.trend === "improvement"
      ? `${patientName} shows measurable improvement in the current speech analysis compared with the previous available session.`
      : comparison.trend === "regression"
        ? `${patientName} shows a decline in the current speech analysis compared with the previous available session.`
        : comparison.trend === "baseline"
          ? `${patientName} now has an initial speech analysis baseline. Additional sessions are needed to establish progress trends.`
          : `${patientName} shows relatively stable speech-analysis performance compared with the previous available session.`;

  const recommendedAction =
    comparison.trend === "regression"
      ? "Review the transcript and recent exercise performance, then consider a closer specialist follow-up."
      : comparison.trend === "improvement"
        ? "Continue the current therapy direction and reinforce the areas reflected in the improved scores."
        : "Maintain monitoring and collect additional speech sessions before making major treatment changes.";

  const suggestedAction =
    comparison.trend === "regression"
      ? "review_plan"
      : comparison.trend === "improvement"
        ? "continue_plan"
        : "monitor_closely";

  return {
    clinical_note: `Rule-based speech progress note for ${patientName}. Available context was used to support specialist review after the current speech analysis session.`,
    improvement_summary: improvementSummary,
    detected_changes: {
      improvements,
      regressions,
      stable_areas: stableAreas
    },
    treatment_analysis: `Context reviewed: ${context.speechAnalyses.length} speech analyses, ${context.progressSnapshots.length} progress snapshots, ${context.specialistNotes.length} specialist notes, ${context.exerciseReviews.length} exercise reviews, ${context.treatmentPlanRevisions.length} treatment plan revisions, ${context.goals.length} goals, and ${context.goalProgress.length} goal progress entries.`,
    recommendations: [recommendedAction],
    decision_support: {
      suggested_action: suggestedAction,
      reason:
        comparison.trend === "regression"
          ? "A meaningful drop in overall speech score suggests the current plan should be reviewed more closely."
          : comparison.trend === "improvement"
            ? "The current session shows enough improvement to support continuing the present direction with routine monitoring."
            : "Current data is limited or stable, so conservative monitoring is appropriate."
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

const resolveSubmissionAudioPath = (fileUrl) => {
  if (typeof fileUrl !== "string" || !fileUrl.trim()) {
    throw createError("Submission audio file URL is missing", 404);
  }

  const normalizedFileUrl = fileUrl.trim();

  if (
    normalizedFileUrl.startsWith("http://") ||
    normalizedFileUrl.startsWith("https://")
  ) {
    throw createError(
      "External audio URLs are not supported for speech analysis transcription",
      400
    );
  }

  if (normalizedFileUrl.startsWith("/uploads/")) {
    return path.join(uploadsRoot, path.basename(normalizedFileUrl));
  }

  if (normalizedFileUrl.startsWith("uploads/")) {
    return path.join(uploadsRoot, path.basename(normalizedFileUrl));
  }

  if (path.isAbsolute(normalizedFileUrl)) {
    return normalizedFileUrl;
  }

  return path.resolve(backendRoot, normalizedFileUrl);
};

const analyzeSpeech = async ({ submission_id }) => {
  if (!submission_id) {
    throw createError("submission_id is required", 400);
  }

  const submissionResult = await pool.query(
    `
    SELECT 
      es.id AS submission_id,
      es.assigned_exercise_id,
      ae.patient_id,
      p.full_name AS patient_name
    FROM exercise_submissions es
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    JOIN patients p ON ae.patient_id = p.id
    WHERE es.id = $1
    `,
    [submission_id]
  );

  if (submissionResult.rows.length === 0) {
    throw createError("Exercise submission not found", 404);
  }

  const submission = submissionResult.rows[0];

  const submissionMediaResult = await pool.query(
    `
    SELECT sm.file_url
    FROM submission_media sm
    WHERE sm.submission_id = $1
      AND sm.media_type = 'audio'
    ORDER BY sm.created_at DESC
    LIMIT 1
    `,
    [submission_id]
  );

  if (submissionMediaResult.rows.length === 0) {
    throw createError("No audio file found for this submission", 404);
  }

  const audioFilePath = resolveSubmissionAudioPath(
    submissionMediaResult.rows[0].file_url
  );
  const transcription = await fasterWhisperService.transcribeAudio(audioFilePath);

  const { pronunciationScore, fluencyScore, overallScore } =
    calculateSpeechScores({
      transcript: transcription.transcript,
      language: transcription.language,
      duration: transcription.duration,
    });

  const rawAiOutput = {
    analysis_type: "faster_whisper_transcription",
    patient_name: submission.patient_name,
    transcription_engine: "faster-whisper",
    language: transcription.language,
    duration: transcription.duration
  };

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
      raw_ai_output
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      submission_id,
      transcription.transcript,
      pronunciationScore,
      fluencyScore,
      overallScore,
      null,
      rawAiOutput,
    ]
  );

  const currentAnalysis = {
    ...result.rows[0],
    language: transcription.language,
    duration: transcription.duration
  };

  const previousAnalyses = await getPatientSpeechAnalyses(submission.patient_id, {
    limit: 1,
    excludeAnalysisId: currentAnalysis.id
  });
  const previousAnalysis = previousAnalyses[0] || null;
  const comparison = buildComparison(currentAnalysis, previousAnalysis);

  let aiProgressNote = null;
  let aiProgressNoteError = null;

  try {
    const context = await collectPatientContext(submission.patient_id);
    const patientProfile = context.patientProfile || {
      id: submission.patient_id,
      full_name: submission.patient_name
    };
    const prompt = buildSpeechAnalysisPrompt({
      patientProfile,
      currentAnalysis,
      previousAnalysis,
      comparison,
      context
    });
    const fallbackAiNoteData = buildFallbackAiNoteData({
      patientProfile,
      currentAnalysis,
      previousAnalysis,
      comparison,
      context
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
            goal_progress: context.goalProgress.length
          },
          transcript: {
            language: currentAnalysis.language,
            duration: currentAnalysis.duration,
            text_length: currentAnalysis.transcript?.length || 0
          }
        }
      }
    });
  } catch (error) {
    aiProgressNoteError = error.message;
  }

  return {
    ...currentAnalysis,
    current_analysis: currentAnalysis,
    previous_analysis: previousAnalysis,
    comparison,
    ai_progress_note: aiProgressNote,
    ai_progress_note_error: aiProgressNoteError
  };
};

const getSpeechAnalysisById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM speech_analyses
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getSpeechAnalysesByPatient = async (patientId) => {
  const result = await pool.query(
    `
    SELECT sa.*
    FROM speech_analyses sa
    JOIN exercise_submissions es ON sa.submission_id = es.id
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    WHERE ae.patient_id = $1
    ORDER BY sa.analyzed_at DESC
    `,
    [patientId]
  );

  return result.rows;
};

const getSpeechAnalysisBySubmission = async (submissionId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM speech_analyses
    WHERE submission_id = $1
    ORDER BY analyzed_at DESC
    LIMIT 1
    `,
    [submissionId]
  );

  return result.rows[0];
};

const getSpeechProgressByPatient = async (patientId) => {
  const result = await pool.query(
    `
    SELECT 
      sa.id,
      sa.pronunciation_score,
      sa.fluency_score,
      sa.overall_score,
      sa.analyzed_at
    FROM speech_analyses sa
    JOIN exercise_submissions es ON sa.submission_id = es.id
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    WHERE ae.patient_id = $1
    ORDER BY sa.analyzed_at ASC
    `,
    [patientId]
  );

  return result.rows;
};

module.exports = {
  analyzeSpeech,
  getSpeechAnalysisById,
  getSpeechAnalysesByPatient,
  getSpeechAnalysisBySubmission,
  getSpeechProgressByPatient,
};