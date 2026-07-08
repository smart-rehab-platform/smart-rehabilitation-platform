const db = require("../../database/db");
const aiProviderService = require("../../services/aiProvider.service");
const { generateAiReportPdfFile } = require("./aiReportPdf.generator");

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
  const result = await db.query(
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

const getPatientDiagnoses = async (patientId) => {
  const result = await db.query(
    `SELECT
       d.id,
       d.diagnosis_title,
       d.description,
       d.diagnosed_at,
       d.created_at,
       u.full_name AS diagnosed_by_name
     FROM diagnoses d
     LEFT JOIN users u ON u.id = d.diagnosed_by
     WHERE d.patient_id = $1
     ORDER BY d.diagnosed_at DESC, d.created_at DESC
     LIMIT 10`,
    [patientId]
  );

  return result.rows;
};

const getPatientAssessments = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
    `SELECT
       a.id,
       a.type,
       a.assessment_date,
       a.notes,
       a.created_at,
       u.full_name AS specialist_name,
       COALESCE(
         json_agg(
           json_build_object(
             'id', ar.id,
             'criterion', ar.criterion,
             'score', ar.score,
             'result_details', ar.result_details,
             'created_at', ar.created_at
           )
           ORDER BY ar.created_at ASC
         ) FILTER (WHERE ar.id IS NOT NULL),
         '[]'::json
       ) AS results
     FROM assessments a
     LEFT JOIN users u ON u.id = a.specialist_id
     LEFT JOIN assessment_results ar ON ar.assessment_id = a.id
     WHERE a.patient_id = $1
       AND a.assessment_date BETWEEN $2 AND $3
     GROUP BY a.id, u.full_name
     ORDER BY a.assessment_date DESC, a.created_at DESC
     LIMIT 10`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientTreatmentPlans = async (patientId) => {
  const result = await db.query(
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

const getPatientGoals = async (patientId) => {
  const result = await db.query(
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

const getPatientGoalProgress = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
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
       AND gp.recorded_at BETWEEN $2 AND $3
     ORDER BY gp.recorded_at DESC, gp.created_at DESC
     LIMIT 20`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientAssignedExercises = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
    `SELECT
       ae.id,
       ae.plan_id,
       ae.frequency,
       ae.start_date,
       ae.due_date,
       ae.is_active,
       ae.created_at,
       e.id AS exercise_id,
       e.title AS exercise_title,
       e.description,
       e.instructions
     FROM assigned_exercises ae
     INNER JOIN exercises e ON e.id = ae.exercise_id
     WHERE ae.patient_id = $1
       AND ae.start_date <= $3
       AND (ae.due_date IS NULL OR ae.due_date >= $2)
     ORDER BY ae.created_at DESC
     LIMIT 15`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientExerciseSubmissions = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
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
       AND es.submitted_at::date BETWEEN $2 AND $3
     ORDER BY es.submitted_at DESC
     LIMIT 20`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientExerciseReviews = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
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
       AND er.reviewed_at::date BETWEEN $2 AND $3
     ORDER BY er.reviewed_at DESC
     LIMIT 20`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientProgressSnapshots = async (patientId, type, periodStart, periodEnd) => {
  const result = await db.query(
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
       AND period = $2
       AND period_start >= $3
       AND period_end <= $4
     ORDER BY period_end DESC, created_at DESC
     LIMIT 5`,
    [patientId, type, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientSpeechAnalyses = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
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
       AND sa.analyzed_at::date BETWEEN $2 AND $3
     ORDER BY sa.analyzed_at DESC
     LIMIT 10`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientAiRecommendations = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
    `SELECT
       id,
       related_plan_id,
       type,
       details,
       status,
       generated_at,
       reviewed_at
     FROM ai_recommendations
     WHERE patient_id = $1
       AND generated_at::date BETWEEN $2 AND $3
     ORDER BY generated_at DESC
     LIMIT 10`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const getPatientAiProgressNotes = async (patientId, periodStart, periodEnd) => {
  const result = await db.query(
    `SELECT
       id,
       speech_analysis_id,
       note_type,
       transcript_summary,
       improvement_summary,
       detected_changes,
       clinical_note,
       recommended_action,
       treatment_analysis,
       decision_support,
       confidence_score,
       created_at
     FROM ai_progress_notes
     WHERE patient_id = $1
       AND created_at::date BETWEEN $2 AND $3
     ORDER BY created_at DESC
     LIMIT 10`,
    [patientId, periodStart, periodEnd]
  );

  return result.rows;
};

const collectReportContext = async (patientId, type, periodStart, periodEnd) => {
  const [
    patient,
    diagnoses,
    assessments,
    treatmentPlans,
    goals,
    goalProgress,
    assignedExercises,
    exerciseSubmissions,
    exerciseReviews,
    progressSnapshots,
    speechAnalyses,
    aiRecommendations,
    aiProgressNotes
  ] = await Promise.all([
    getPatientById(patientId),
    getPatientDiagnoses(patientId),
    getPatientAssessments(patientId, periodStart, periodEnd),
    getPatientTreatmentPlans(patientId),
    getPatientGoals(patientId),
    getPatientGoalProgress(patientId, periodStart, periodEnd),
    getPatientAssignedExercises(patientId, periodStart, periodEnd),
    getPatientExerciseSubmissions(patientId, periodStart, periodEnd),
    getPatientExerciseReviews(patientId, periodStart, periodEnd),
    getPatientProgressSnapshots(patientId, type, periodStart, periodEnd),
    getPatientSpeechAnalyses(patientId, periodStart, periodEnd),
    getPatientAiRecommendations(patientId, periodStart, periodEnd),
    getPatientAiProgressNotes(patientId, periodStart, periodEnd)
  ]);

  return {
    patient,
    diagnoses,
    assessments,
    treatmentPlans,
    goals,
    goalProgress,
    assignedExercises,
    exerciseSubmissions,
    exerciseReviews,
    progressSnapshots,
    speechAnalyses,
    aiRecommendations,
    aiProgressNotes
  };
};

const buildReportPrompt = ({ patient, context, type, periodStart, periodEnd }) => {
  const promptContext = {
    report_request: {
      type,
      period_start: periodStart,
      period_end: periodEnd
    },
    patient_profile: patient,
    medical_and_diagnosis: {
      diagnoses: context.diagnoses
    },
    assessments: context.assessments,
    treatment_plans: context.treatmentPlans,
    goals: context.goals,
    goal_progress: context.goalProgress,
    assigned_exercises: context.assignedExercises,
    exercise_submissions: context.exerciseSubmissions,
    exercise_reviews: context.exerciseReviews,
    progress_snapshots: context.progressSnapshots,
    speech_analyses: context.speechAnalyses,
    ai_recommendations: context.aiRecommendations,
    ai_progress_notes: context.aiProgressNotes
  };

  return [
    `Create a structured ${type} rehabilitation report for a specialist.`,
    "Use only the provided patient context.",
    "Do not invent missing data.",
    "If data is limited, explicitly say that data is limited.",
    "Do not provide a medical diagnosis.",
    "Provide clinically useful decision support, not final medical decisions.",
    "Focus on recent progress, speech status if available, adherence, goals, risks, and practical next steps.",
    "",
    "Patient context:",
    JSON.stringify(promptContext, null, 2)
  ].join("\n");
};

const buildRuleBasedReportFallback = ({ patient, context, type }) => {
  const latestProgress = context.progressSnapshots[0] || null;
  const latestSpeech = context.speechAnalyses[0] || null;
  const achievedGoals = context.goals.filter((goal) => goal.is_achieved).length;
  const lowProgressGoals = context.goals.filter((goal) => {
    const completion = toNumber(goal.completion_percentage);
    return completion !== null && completion < 40;
  }).length;
  const retryCount = context.exerciseReviews.filter(
    (review) => review.requires_retry
  ).length;
  const weakReviewCount = context.exerciseReviews.filter((review) => {
    const rating = toNumber(review.performance_rating);
    return rating !== null && rating < 5;
  }).length;
  const totalSubmissions = context.exerciseSubmissions.length;

  const clinicalInsights = [];
  const risksOrRegressions = [];
  const recommendations = [];
  const nextSteps = [];

  let priorityLevel = "medium";

  if (latestProgress) {
    const improvement = toNumber(latestProgress.improvement_percentage);
    const averagePerformance = toNumber(latestProgress.average_performance);

    clinicalInsights.push(
      `Latest ${type} progress snapshot recorded ${latestProgress.exercises_completed} completed exercises with average performance ${averagePerformance !== null ? averagePerformance.toFixed(2) : "not available"}.`
    );

    if (improvement !== null) {
      if (improvement >= 10) {
        clinicalInsights.push(
          `Structured progress data suggests improvement of ${improvement.toFixed(2)}% during the reporting period.`
        );
        priorityLevel = "low";
      } else if (improvement < 0) {
        risksOrRegressions.push(
          `Structured progress data suggests a decline of ${Math.abs(improvement).toFixed(2)}% during the reporting period.`
        );
        priorityLevel = "high";
      } else {
        clinicalInsights.push(
          `Progress change during the reporting period appears modest at ${improvement.toFixed(2)}%.`
        );
      }
    }
  } else {
    clinicalInsights.push(
      `No ${type} progress snapshot was available for the requested reporting period.`
    );
  }

  if (latestSpeech) {
    clinicalInsights.push(
      `Latest speech analysis overall score was ${latestSpeech.overall_score} with transcript data available for specialist review.`
    );
  } else {
    clinicalInsights.push("No speech analysis was available in the requested reporting period.");
  }

  if (totalSubmissions > 0) {
    clinicalInsights.push(
      `${totalSubmissions} exercise submission${totalSubmissions === 1 ? "" : "s"} were recorded during the reporting period.`
    );
  } else {
    risksOrRegressions.push("Exercise adherence data is limited because no submissions were recorded in the reporting period.");
  }

  if (retryCount > 0 || weakReviewCount > 0) {
    risksOrRegressions.push(
      `${retryCount} retry flag${retryCount === 1 ? "" : "s"} and ${weakReviewCount} low-rated review${weakReviewCount === 1 ? "" : "s"} suggest areas that may need closer follow-up.`
    );
    priorityLevel = "high";
  }

  if (achievedGoals > 0) {
    clinicalInsights.push(
      `${achievedGoals} goal${achievedGoals === 1 ? " has" : "s have"} been achieved based on the latest treatment-plan data.`
    );
  }

  if (lowProgressGoals > 0) {
    risksOrRegressions.push(
      `${lowProgressGoals} goal${lowProgressGoals === 1 ? "" : "s"} remain below 40% completion and may need revised short-term planning.`
    );
  }

  if (priorityLevel === "high") {
    recommendations.push(
      "Review the current treatment plan, exercise difficulty, and adherence barriers with the specialist."
    );
    nextSteps.push(
      "Schedule a closer specialist follow-up and verify whether recent exercises remain developmentally appropriate."
    );
  } else if (priorityLevel === "low") {
    recommendations.push(
      "Continue the current treatment direction while reinforcing the areas already showing improvement."
    );
    nextSteps.push(
      "Maintain routine monitoring and progress snapshots during the next reporting cycle."
    );
  } else {
    recommendations.push(
      "Maintain the current treatment direction but monitor the next cycle closely before making major changes."
    );
    nextSteps.push(
      "Collect additional progress, speech, and review data to clarify whether the current pattern is stable or improving."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Use the available structured context to continue conservative specialist monitoring."
    );
  }

  if (nextSteps.length === 0) {
    nextSteps.push("Continue collecting structured rehabilitation data for the next report.");
  }

  return {
    executive_summary: `${patient.full_name}'s ${type} AI report was generated from structured rehabilitation data with${latestProgress ? "" : " limited"} recent progress context available.`,
    patient_progress_summary: latestProgress
      ? `The latest ${type} progress snapshot recorded ${latestProgress.exercises_completed} completed exercises and an improvement percentage of ${latestProgress.improvement_percentage}%.`
      : `No ${type} progress snapshot was available in the requested reporting period, so progress interpretation is limited.`,
    speech_analysis_summary: latestSpeech
      ? `Speech analysis data is available for the reporting period, with the latest overall score recorded at ${latestSpeech.overall_score}.`
      : "No speech analysis data was available in the requested reporting period.",
    exercise_adherence_summary:
      totalSubmissions > 0
        ? `${totalSubmissions} exercise submission${totalSubmissions === 1 ? "" : "s"} were recorded during the reporting period.`
        : "Exercise adherence data is limited because no exercise submissions were recorded in the reporting period.",
    goal_progress_summary:
      context.goals.length > 0
        ? `${achievedGoals} of ${context.goals.length} tracked goal${context.goals.length === 1 ? "" : "s"} are currently marked as achieved.`
        : "No goal data was available for the requested reporting period.",
    clinical_insights: clinicalInsights,
    risks_or_regressions: risksOrRegressions,
    recommendations,
    next_steps: nextSteps,
    priority_level: priorityLevel,
    estimated_confidence: 0.5
  };
};

const generateReport = async ({ patient_id, period_start, period_end, type }) => {
  if (!patient_id || !period_start || !period_end || !type) {
    throw createError(
      "patient_id, period_start, period_end, and type are required",
      400
    );
  }

  const context = await collectReportContext(
    patient_id,
    type,
    period_start,
    period_end
  );
  const patient = context.patient;

  if (!patient) {
    throw createError("Patient not found", 404);
  }

  const prompt = buildReportPrompt({
    patient,
    context,
    type,
    periodStart: period_start,
    periodEnd: period_end
  });
  const fallbackReport = buildRuleBasedReportFallback({
    patient,
    context,
    type
  });
  const aiReport = await aiProviderService.generateReportJson(
    prompt,
    fallbackReport
  );
  const summary = JSON.stringify(
    {
      ...aiReport,
      report_type: type,
      period_start,
      period_end,
      patient_id,
      context_metadata: {
        counts: {
          diagnoses: context.diagnoses.length,
          assessments: context.assessments.length,
          treatment_plans: context.treatmentPlans.length,
          goals: context.goals.length,
          goal_progress: context.goalProgress.length,
          assigned_exercises: context.assignedExercises.length,
          exercise_submissions: context.exerciseSubmissions.length,
          exercise_reviews: context.exerciseReviews.length,
          progress_snapshots: context.progressSnapshots.length,
          speech_analyses: context.speechAnalyses.length,
          ai_recommendations: context.aiRecommendations.length,
          ai_progress_notes: context.aiProgressNotes.length
        }
      }
    },
    null,
    2
  );

  const insertResult = await db.query(
    `
    INSERT INTO ai_reports
      (patient_id, type, period_start, period_end, summary)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [patient_id, type, period_start, period_end, summary]
  );

  return insertResult.rows[0];
};

const getAllReports = async () => {
  const result = await db.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_reports ar
    JOIN patients p ON p.id = ar.patient_id
    ORDER BY ar.generated_at DESC
    `
  );

  return result.rows;
};

const getReportById = async (id) => {
  const result = await db.query(
    `
    SELECT ar.*, p.full_name AS patient_name
    FROM ai_reports ar
    JOIN patients p ON p.id = ar.patient_id
    WHERE ar.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getReportsByPatient = async (patientId) => {
  const result = await db.query(
    `
    SELECT *
    FROM ai_reports
    WHERE patient_id = $1
    ORDER BY generated_at DESC
    `,
    [patientId]
  );

  return result.rows;
};

const fetchAiReportPdfContext = async (report) => {
  const periodStart = report.period_start;
  const periodEnd = report.period_end;
  const reportType = report.type;

  const context = await collectReportContext(
    report.patient_id,
    reportType,
    periodStart,
    periodEnd
  );

  const treatmentPlan = context.treatmentPlans[0] ?? null;
  const goals = context.goals.map((goal) => {
    const latestProgress = context.goalProgress.find(
      (entry) => entry.goal_id === goal.id
    );

    return {
      title: goal.title,
      term: goal.term,
      is_achieved: goal.is_achieved,
      completion_percentage: latestProgress?.completion_percentage ?? null,
    };
  });

  return {
    report,
    diagnoses: context.diagnoses,
    treatmentPlan,
    goals,
    progressSnapshots: context.progressSnapshots,
  };
};

const exportReportPdf = async (id) => {
  const report = await getReportById(id);

  if (!report) {
    return null;
  }

  const context = await fetchAiReportPdfContext(report);
  const { publicUrl } = await generateAiReportPdfFile(context);

  await db.query(
    `
    UPDATE ai_reports
    SET pdf_url = $1
    WHERE id = $2
    `,
    [publicUrl, id]
  );

  const updatedReport = await getReportById(id);

  return {
    report: updatedReport,
    pdf_url: publicUrl,
  };
};

module.exports = {
  generateReport,
  getAllReports,
  getReportById,
  getReportsByPatient,
  exportReportPdf,
};