const pool = require("../../database/db");
const aiProviderService = require("../../services/aiProvider.service");
const {
  cloneWithoutLegacySpeechScores,
} = require("../../utils/legacySpeechScores");

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

const getPatientById = async (patientId) => {
  const result = await pool.query(
    `SELECT id, full_name, date_of_birth, gender, created_at
     FROM patients
     WHERE id = $1`,
    [patientId]
  );

  return result.rows[0] || null;
};

const getRelatedPlan = async (patientId, relatedPlanId) => {
  if (!relatedPlanId) {
    return null;
  }

  const result = await pool.query(
    `SELECT id, patient_id, title, status, start_date, end_date, created_at, updated_at
     FROM treatment_plans
     WHERE id = $1 AND patient_id = $2`,
    [relatedPlanId, patientId]
  );

  return result.rows[0] || null;
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

const getPatientTreatmentPlans = async (patientId) => {
  const result = await pool.query(
    `SELECT
       id,
       title,
       status,
       start_date,
       end_date,
       created_at,
       updated_at
     FROM treatment_plans
     WHERE patient_id = $1
     ORDER BY updated_at DESC, created_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientExerciseSubmissions = async (patientId) => {
  const result = await pool.query(
    `SELECT
       es.id,
       es.assigned_exercise_id,
       es.parent_notes,
       es.status,
       es.submitted_at,
       e.title AS exercise_title
     FROM exercise_submissions es
     INNER JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     INNER JOIN exercises e ON e.id = ae.exercise_id
     WHERE ae.patient_id = $1
     ORDER BY es.submitted_at DESC
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

const getPatientSpeechAnalyses = async (patientId) => {
  const result = await pool.query(
    `SELECT
       sa.id,
       sa.submission_id,
       sa.transcript,
       sa.pronunciation_score,
       sa.fluency_score,
       sa.overall_score,
       sa.analyzed_at
     FROM speech_analyses sa
     INNER JOIN exercise_submissions es ON es.id = sa.submission_id
     INNER JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     WHERE ae.patient_id = $1
     ORDER BY sa.analyzed_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientAiProgressNotes = async (patientId) => {
  const result = await pool.query(
    `SELECT
       id,
       note_type,
       transcript_summary,
       improvement_summary,
       clinical_note,
       recommended_action,
       decision_support,
       confidence_score,
       created_at
     FROM ai_progress_notes
     WHERE patient_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getAvailableExercises = async () => {
  const result = await pool.query(
    `SELECT
       id,
       title,
       description,
       instructions,
       created_at
     FROM exercises
     ORDER BY created_at DESC
     LIMIT 10`
  );

  return result.rows;
};

const collectRecommendationContext = async (patientId) => {
  const [
    progressSnapshots,
    goals,
    goalProgress,
    treatmentPlans,
    exerciseSubmissions,
    exerciseReviews,
    speechAnalyses,
    aiProgressNotes,
    availableExercises
  ] = await Promise.all([
    getPatientProgressSnapshots(patientId),
    getPatientGoals(patientId),
    getPatientGoalProgress(patientId),
    getPatientTreatmentPlans(patientId),
    getPatientExerciseSubmissions(patientId),
    getPatientExerciseReviews(patientId),
    getPatientSpeechAnalyses(patientId),
    getPatientAiProgressNotes(patientId),
    getAvailableExercises()
  ]);

  return {
    progressSnapshots,
    goals,
    goalProgress,
    treatmentPlans,
    exerciseSubmissions,
    exerciseReviews,
    speechAnalyses,
    aiProgressNotes,
    availableExercises
  };
};

const buildRecommendationPrompt = ({ patient, relatedPlan, type, context }) => {
  const promptContext = {
    recommendation_request: {
      type,
      related_plan_id: relatedPlan?.id || null
    },
    patient_profile: patient,
    related_plan: relatedPlan,
    progress_snapshots: context.progressSnapshots,
    goals: context.goals,
    goal_progress: context.goalProgress,
    treatment_plans: context.treatmentPlans,
    exercise_submissions: context.exerciseSubmissions,
    exercise_reviews: context.exerciseReviews,
    speech_analyses: cloneWithoutLegacySpeechScores(context.speechAnalyses),
    previous_ai_progress_notes: context.aiProgressNotes,
    available_exercises: context.availableExercises
  };

  return [
    "Create a structured rehabilitation recommendation for a specialist.",
    "Use only the provided context.",
    "Do not invent missing data.",
    "If the available data is limited, explicitly say the context is limited.",
    "Do not make a medical diagnosis.",
    "Provide specialist decision support, not final medical decisions.",
    "Do not invent pronunciation, fluency, or overall speech scores.",
    "Do not describe overall speech score improvement, decline, pronunciation score, or fluency score.",
    "Include clinical analysis, suggested exercises, treatment plan adjustments, clinical reasoning, priority level, and estimated confidence.",
    "Use only exercises from available_exercises when possible. If an exact exercise match is not available, set exercise_id to null and use a descriptive title.",
    type === "exercise_suggestion"
      ? "Prioritize exercise recommendations while still including any useful plan adjustments."
      : "Prioritize treatment plan adjustments while still including useful exercise recommendations.",
    "",
    "Patient context:",
    JSON.stringify(promptContext, null, 2)
  ].join("\n");
};

const buildRuleBasedRecommendationFallback = ({ patient, type, context }) => {
  const latestProgress = context.progressSnapshots[0] || null;
  const latestSpeech = context.speechAnalyses[0] || null;
  const retryCount = context.exerciseReviews.filter(
    (review) => review.requires_retry
  ).length;
  const weakReviewCount = context.exerciseReviews.filter((review) => {
    const rating = toNumber(review.performance_rating);
    return rating !== null && rating < 5;
  }).length;
  const lowProgressGoals = context.goals.filter((goal) => {
    const completion = toNumber(goal.completion_percentage);
    return completion !== null && completion < 40;
  }).length;

  let priorityLevel = "medium";
  if (
    retryCount > 0 ||
    weakReviewCount > 0 ||
    (latestProgress &&
      toNumber(latestProgress.improvement_percentage) !== null &&
      toNumber(latestProgress.improvement_percentage) < 0)
  ) {
    priorityLevel = "high";
  } else if (
    latestProgress &&
    toNumber(latestProgress.improvement_percentage) !== null &&
    toNumber(latestProgress.improvement_percentage) >= 10
  ) {
    priorityLevel = "low";
  }

  const suggestedExercises = context.availableExercises.slice(0, 3).map((exercise) => ({
    exercise_id: exercise.id,
    title: exercise.title,
    reason:
      type === "exercise_suggestion"
        ? "Selected as a rule-based fallback from the available exercise library for continued guided practice."
        : "Included as a supportive exercise option alongside treatment plan adjustments."
  }));

  const treatmentPlanAdjustments = [];

  if (priorityLevel === "high") {
    treatmentPlanAdjustments.push(
      "Increase specialist follow-up frequency and review the current treatment plan for barriers to progress."
    );
  } else if (priorityLevel === "low") {
    treatmentPlanAdjustments.push(
      "Continue the current treatment direction with routine monitoring and gradual progression where tolerated."
    );
  } else {
    treatmentPlanAdjustments.push(
      "Maintain the current plan but monitor upcoming sessions closely to confirm whether progress remains stable."
    );
  }

  if (lowProgressGoals > 0) {
    treatmentPlanAdjustments.push(
      `Review ${lowProgressGoals} goal${lowProgressGoals === 1 ? "" : "s"} below 40% completion and consider smaller interim targets.`
    );
  }

  const clinicalSignals = [];

  if (latestProgress) {
    clinicalSignals.push(
      `Latest ${latestProgress.period} snapshot shows average performance ${latestProgress.average_performance} and improvement percentage ${latestProgress.improvement_percentage}.`
    );
  } else {
    clinicalSignals.push("Progress snapshot data is limited.");
  }

  if (latestSpeech) {
    clinicalSignals.push(
      latestSpeech.transcript
        ? "A recent speech analysis transcript is available for specialist review."
        : "A recent speech analysis is available for specialist review."
    );
  }

  if (retryCount > 0 || weakReviewCount > 0) {
    clinicalSignals.push(
      `${retryCount} review retry flag${retryCount === 1 ? "" : "s"} and ${weakReviewCount} low-rated review${weakReviewCount === 1 ? "" : "s"} indicate areas needing closer attention.`
    );
  }

  const clinicalAnalysis = `${patient.full_name} recommendation generated from available rehabilitation context. ${clinicalSignals.join(" ")}`;
  const clinicalReasoning =
    priorityLevel === "high"
      ? "Fallback reasoning prioritizes closer review because recent structured data includes retry indicators, weak review scores, or declining progress."
      : priorityLevel === "low"
        ? "Fallback reasoning supports continuation because the available structured data suggests stable or improving progress."
        : "Fallback reasoning recommends conservative monitoring because the available structured data is mixed or limited.";

  return {
    clinical_analysis: clinicalAnalysis,
    suggested_exercises: suggestedExercises,
    treatment_plan_adjustments: treatmentPlanAdjustments,
    clinical_reasoning: clinicalReasoning,
    priority_level: priorityLevel,
    estimated_confidence: 0.5
  };
};

const buildRecommendationDetails = ({ type, aiResult, context }) => {
  const treatmentPlanAdjustments = Array.isArray(aiResult.treatment_plan_adjustments)
    ? aiResult.treatment_plan_adjustments
    : [];
  const suggestedExercises = Array.isArray(aiResult.suggested_exercises)
    ? aiResult.suggested_exercises
    : [];

  return {
    reason: aiResult.clinical_reasoning,
    suggested_exercises: suggestedExercises,
    suggestion:
      treatmentPlanAdjustments[0] ||
      aiResult.clinical_analysis ||
      "No specific treatment plan adjustment was generated.",
    clinical_analysis: aiResult.clinical_analysis,
    treatment_plan_adjustments: treatmentPlanAdjustments,
    clinical_reasoning: aiResult.clinical_reasoning,
    priority_level: aiResult.priority_level,
    estimated_confidence: aiResult.estimated_confidence,
    provider: aiResult.provider,
    used_fallback: aiResult.used_fallback,
    recommendation_type: type,
    source_context: {
      counts: {
        progress_snapshots: context.progressSnapshots.length,
        goals: context.goals.length,
        goal_progress: context.goalProgress.length,
        treatment_plans: context.treatmentPlans.length,
        exercise_submissions: context.exerciseSubmissions.length,
        exercise_reviews: context.exerciseReviews.length,
        speech_analyses: context.speechAnalyses.length,
        ai_progress_notes: context.aiProgressNotes.length,
        available_exercises: context.availableExercises.length
      }
    }
  };
};

const generateRecommendation = async ({ patient_id, related_plan_id, type }) => {
  if (!patient_id) {
    throw createError("patient_id is required", 400);
  }

  if (!["exercise_suggestion", "plan_adjustment"].includes(type)) {
    throw createError(
      "type must be either exercise_suggestion or plan_adjustment",
      400
    );
  }

  const patient = await getPatientById(patient_id);

  if (!patient) {
    throw createError("Patient not found", 404);
  }

  const relatedPlan = await getRelatedPlan(patient_id, related_plan_id);
  if (related_plan_id && !relatedPlan) {
    throw createError("Related treatment plan not found for this patient", 404);
  }

  const context = await collectRecommendationContext(patient_id);
  const prompt = buildRecommendationPrompt({
    patient,
    relatedPlan,
    type,
    context
  });
  const fallbackData = buildRuleBasedRecommendationFallback({
    patient,
    type,
    context
  });
  const aiResult = await aiProviderService.generateRecommendationJson(
    prompt,
    fallbackData
  );
  const details = buildRecommendationDetails({
    type,
    aiResult,
    context
  });

  const result = await pool.query(
    `
    INSERT INTO ai_recommendations
    (patient_id, related_plan_id, type, details)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [patient_id, relatedPlan?.id || null, type, details]
  );

  return result.rows[0];
};

const getAllRecommendations = async () => {
  const result = await pool.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_recommendations ar
    JOIN patients p ON ar.patient_id = p.id
    ORDER BY ar.generated_at DESC
    `
  );

  return result.rows;
};

const getRecommendationById = async (id) => {
  const result = await pool.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_recommendations ar
    JOIN patients p ON ar.patient_id = p.id
    WHERE ar.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getRecommendationsByPatient = async (patientId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM ai_recommendations
    WHERE patient_id = $1
    ORDER BY generated_at DESC
    `,
    [patientId]
  );

  return result.rows;
};

const updateRecommendationStatus = async (id, status, reviewedBy) => {
  const result = await pool.query(
    `
    UPDATE ai_recommendations
    SET status = $1,
        reviewed_by = $2,
        reviewed_at = now()
    WHERE id = $3
    RETURNING *
    `,
    [status, reviewedBy || null, id]
  );

  if (!result.rows[0]) {
    throw createError("Recommendation not found", 404);
  }

  return result.rows[0];
};

module.exports = {
  generateRecommendation,
  getAllRecommendations,
  getRecommendationById,
  getRecommendationsByPatient,
  updateRecommendationStatus,
  buildRecommendationPrompt,
  buildRuleBasedRecommendationFallback,
};