const db = require("../../database/db");
const aiProviderService = require("../../services/aiProvider.service");
const { isSpecialistAssignedToPatient } = require("../../utils/patientAccess");
const { generateAiReportPdfFile } = require("./aiReportPdf.generator");
const {
  cloneWithoutLegacySpeechScores,
} = require("../../utils/legacySpeechScores");
const {
  DEFAULT_AI_REPORT_LANGUAGE,
  normalizeAiReportLanguage,
} = require("./aiReportLanguage");

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

const buildReportPrompt = ({ patient, context, type, periodStart, periodEnd, language = DEFAULT_AI_REPORT_LANGUAGE }) => {
  const promptContext = {
    report_request: {
      type,
      period_start: periodStart,
      period_end: periodEnd,
      language,
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
    speech_analyses: cloneWithoutLegacySpeechScores(context.speechAnalyses),
    ai_recommendations: context.aiRecommendations,
    ai_progress_notes: context.aiProgressNotes
  };

  const languageInstructions = language === "ar"
    ? [
        "LANGUAGE REQUIREMENT (CRITICAL):",
        "Write ALL human-readable clinical narrative VALUES in professional Modern Standard Arabic.",
        "This includes executive_summary, patient_progress_summary, speech_analysis_summary, exercise_adherence_summary, goal_progress_summary, clinical_insights, risks_or_regressions, recommendations, and next_steps.",
        "Use clear clinical Arabic appropriate for a rehabilitation specialist report.",
        "Do NOT translate JSON property/field names. Keep every JSON key exactly in English as specified.",
        "Do NOT invent Arabic translations for patient names; keep proper names as provided.",
        "Keep IDs, numeric measurements, percentages, and dates factually accurate.",
      ]
    : [
        "LANGUAGE REQUIREMENT:",
        "Write ALL human-readable clinical narrative VALUES in professional clinical English.",
        "Do NOT translate JSON property/field names. Keep every JSON key exactly in English as specified.",
      ];

  return [
    `Create a structured ${type} rehabilitation report for a specialist.`,
    "Use only the provided patient context.",
    "Do not invent missing data.",
    "If data is limited, explicitly say that data is limited.",
    "Do not provide a medical diagnosis.",
    "Provide clinically useful decision support, not final medical decisions.",
    "Do not invent pronunciation, fluency, or overall speech scores.",
    "Do not describe overall speech score improvement, decline, pronunciation score, or fluency score.",
    "Focus on recent progress, speech status if available, adherence, goals, risks, and practical next steps.",
    "",
    ...languageInstructions,
    "",
    "Patient context:",
    JSON.stringify(promptContext, null, 2)
  ].join("\n");
};

const buildRuleBasedReportFallback = ({ patient, context, type, language = DEFAULT_AI_REPORT_LANGUAGE }) => {
  const isAr = language === "ar";
  const typeLabel = isAr
    ? (type === "monthly" ? "الشهري" : "الأسبوعي")
    : type;

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
      isAr
        ? `سجّل أحدث ملخص تقدم ${typeLabel} إكمال ${latestProgress.exercises_completed} تمرينًا بمتوسط أداء ${averagePerformance !== null ? averagePerformance.toFixed(2) : "غير متاح"}.`
        : `Latest ${type} progress snapshot recorded ${latestProgress.exercises_completed} completed exercises with average performance ${averagePerformance !== null ? averagePerformance.toFixed(2) : "not available"}.`
    );

    if (improvement !== null) {
      if (improvement >= 10) {
        clinicalInsights.push(
          isAr
            ? `تشير بيانات التقدم المنظّمة إلى تحسّن بنسبة ${improvement.toFixed(2)}% خلال فترة التقرير.`
            : `Structured progress data suggests improvement of ${improvement.toFixed(2)}% during the reporting period.`
        );
        priorityLevel = "low";
      } else if (improvement < 0) {
        risksOrRegressions.push(
          isAr
            ? `تشير بيانات التقدم المنظّمة إلى تراجع بنسبة ${Math.abs(improvement).toFixed(2)}% خلال فترة التقرير.`
            : `Structured progress data suggests a decline of ${Math.abs(improvement).toFixed(2)}% during the reporting period.`
        );
        priorityLevel = "high";
      } else {
        clinicalInsights.push(
          isAr
            ? `يبدو أن التغيّر في التقدم خلال فترة التقرير محدود بنسبة ${improvement.toFixed(2)}%.`
            : `Progress change during the reporting period appears modest at ${improvement.toFixed(2)}%.`
        );
      }
    }
  } else {
    clinicalInsights.push(
      isAr
        ? `لم يتوفر ملخص تقدم ${typeLabel} لفترة التقرير المطلوبة.`
        : `No ${type} progress snapshot was available for the requested reporting period.`
    );
  }

  if (latestSpeech) {
    clinicalInsights.push(
      isAr
        ? (latestSpeech.transcript
          ? "تتوفر بيانات نص تحليل النطق الأخيرة لمراجعة الأخصائي."
          : "تتوفر بيانات تحليل النطق لفترة التقرير لمراجعة الأخصائي.")
        : (latestSpeech.transcript
          ? "Latest speech analysis transcript data is available for specialist review."
          : "Speech analysis data is available for the reporting period for specialist review.")
    );
  } else {
    clinicalInsights.push(
      isAr
        ? "لم يتوفر تحليل نطق خلال فترة التقرير المطلوبة."
        : "No speech analysis was available in the requested reporting period."
    );
  }

  if (totalSubmissions > 0) {
    clinicalInsights.push(
      isAr
        ? `تم تسجيل ${totalSubmissions} تسليم تمرين خلال فترة التقرير.`
        : `${totalSubmissions} exercise submission${totalSubmissions === 1 ? "" : "s"} were recorded during the reporting period.`
    );
  } else {
    risksOrRegressions.push(
      isAr
        ? "بيانات الالتزام بالتمارين محدودة لعدم تسجيل أي تسليمات خلال فترة التقرير."
        : "Exercise adherence data is limited because no submissions were recorded in the reporting period."
    );
  }

  if (retryCount > 0 || weakReviewCount > 0) {
    risksOrRegressions.push(
      isAr
        ? `تشير ${retryCount} علامة إعادة محاولة و${weakReviewCount} مراجعة منخفضة التقييم إلى مجالات قد تحتاج متابعة أدق.`
        : `${retryCount} retry flag${retryCount === 1 ? "" : "s"} and ${weakReviewCount} low-rated review${weakReviewCount === 1 ? "" : "s"} suggest areas that may need closer follow-up.`
    );
    priorityLevel = "high";
  }

  if (achievedGoals > 0) {
    clinicalInsights.push(
      isAr
        ? `تم تحقيق ${achievedGoals} هدف وفق أحدث بيانات خطة العلاج.`
        : `${achievedGoals} goal${achievedGoals === 1 ? " has" : "s have"} been achieved based on the latest treatment-plan data.`
    );
  }

  if (lowProgressGoals > 0) {
    risksOrRegressions.push(
      isAr
        ? `ما زال ${lowProgressGoals} هدفًا دون 40% إنجازًا وقد يحتاج تخطيطًا قصير الأمد منقّحًا.`
        : `${lowProgressGoals} goal${lowProgressGoals === 1 ? "" : "s"} remain below 40% completion and may need revised short-term planning.`
    );
  }

  if (priorityLevel === "high") {
    recommendations.push(
      isAr
        ? "مراجعة خطة العلاج الحالية وصعوبة التمارين وعوائق الالتزام مع الأخصائي."
        : "Review the current treatment plan, exercise difficulty, and adherence barriers with the specialist."
    );
    nextSteps.push(
      isAr
        ? "جدولة متابعة أقرب مع الأخصائي والتحقق من ملاءمة التمارين الحديثة للنمو."
        : "Schedule a closer specialist follow-up and verify whether recent exercises remain developmentally appropriate."
    );
  } else if (priorityLevel === "low") {
    recommendations.push(
      isAr
        ? "الاستمرار في الاتجاه العلاجي الحالي مع تعزيز المجالات التي تُظهر تحسنًا."
        : "Continue the current treatment direction while reinforcing the areas already showing improvement."
    );
    nextSteps.push(
      isAr
        ? "الحفاظ على المراقبة الروتينية وملخصات التقدم خلال دورة التقرير التالية."
        : "Maintain routine monitoring and progress snapshots during the next reporting cycle."
    );
  } else {
    recommendations.push(
      isAr
        ? "الحفاظ على الاتجاه العلاجي الحالي مع مراقبة الدورة التالية عن كثب قبل إجراء تغييرات كبيرة."
        : "Maintain the current treatment direction but monitor the next cycle closely before making major changes."
    );
    nextSteps.push(
      isAr
        ? "جمع مزيد من بيانات التقدم والنطق والمراجعات لتوضيح ما إذا كان النمط الحالي مستقرًا أو في تحسّن."
        : "Collect additional progress, speech, and review data to clarify whether the current pattern is stable or improving."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      isAr
        ? "استخدام السياق المنظّم المتاح لمواصلة المراقبة السريرية المحافظة."
        : "Use the available structured context to continue conservative specialist monitoring."
    );
  }

  if (nextSteps.length === 0) {
    nextSteps.push(
      isAr
        ? "الاستمرار في جمع بيانات التأهيل المنظّمة للتقرير التالي."
        : "Continue collecting structured rehabilitation data for the next report."
    );
  }

  return {
    executive_summary: isAr
      ? `تم إنشاء التقرير الذكي ${typeLabel} لـ ${patient.full_name} من بيانات التأهيل المنظّمة${latestProgress ? "" : " مع سياق تقدم حديث محدود"}.`
      : `${patient.full_name}'s ${type} AI report was generated from structured rehabilitation data with${latestProgress ? "" : " limited"} recent progress context available.`,
    patient_progress_summary: latestProgress
      ? (isAr
        ? `سجّل أحدث ملخص تقدم ${typeLabel} إكمال ${latestProgress.exercises_completed} تمرينًا ونسبة تحسّن قدرها ${latestProgress.improvement_percentage}%.`
        : `The latest ${type} progress snapshot recorded ${latestProgress.exercises_completed} completed exercises and an improvement percentage of ${latestProgress.improvement_percentage}%.`)
      : (isAr
        ? `لم يتوفر ملخص تقدم ${typeLabel} في فترة التقرير المطلوبة، لذا فإن تفسير التقدم محدود.`
        : `No ${type} progress snapshot was available in the requested reporting period, so progress interpretation is limited.`),
    speech_analysis_summary: latestSpeech
      ? (isAr
        ? "تتوفر بيانات تحليل النطق لفترة التقرير لمراجعة الأخصائي."
        : "Speech analysis data is available for the reporting period for specialist review.")
      : (isAr
        ? "لم تتوفر بيانات تحليل نطق في فترة التقرير المطلوبة."
        : "No speech analysis data was available in the requested reporting period."),
    exercise_adherence_summary:
      totalSubmissions > 0
        ? (isAr
          ? `تم تسجيل ${totalSubmissions} تسليم تمرين خلال فترة التقرير.`
          : `${totalSubmissions} exercise submission${totalSubmissions === 1 ? "" : "s"} were recorded during the reporting period.`)
        : (isAr
          ? "بيانات الالتزام بالتمارين محدودة لعدم تسجيل أي تسليمات تمارين خلال فترة التقرير."
          : "Exercise adherence data is limited because no exercise submissions were recorded in the reporting period."),
    goal_progress_summary:
      context.goals.length > 0
        ? (isAr
          ? `تم تحقيق ${achievedGoals} من أصل ${context.goals.length} هدفًا متابعًا حاليًا.`
          : `${achievedGoals} of ${context.goals.length} tracked goal${context.goals.length === 1 ? "" : "s"} are currently marked as achieved.`)
        : (isAr
          ? "لم تتوفر بيانات أهداف لفترة التقرير المطلوبة."
          : "No goal data was available for the requested reporting period."),
    clinical_insights: clinicalInsights,
    risks_or_regressions: risksOrRegressions,
    recommendations,
    next_steps: nextSteps,
    priority_level: priorityLevel,
    estimated_confidence: 0.5
  };
};

const generateReport = async ({
  patient_id,
  period_start,
  period_end,
  type,
  generated_by,
  language,
}) => {
  if (!patient_id || !period_start || !period_end || !type) {
    throw createError(
      "patient_id, period_start, period_end, and type are required",
      400
    );
  }

  const reportLanguage = normalizeAiReportLanguage(language, {
    fallbackToDefault: true,
  });

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
    periodEnd: period_end,
    language: reportLanguage,
  });
  const fallbackReport = buildRuleBasedReportFallback({
    patient,
    context,
    type,
    language: reportLanguage,
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
      language: reportLanguage,
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
      (patient_id, type, period_start, period_end, summary, generated_by, language)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
    `,
    [
      patient_id,
      type,
      period_start,
      period_end,
      summary,
      generated_by ?? null,
      reportLanguage,
    ]
  );

  return getReportById(insertResult.rows[0].id);
};

const assertActorCanReadPatientAiReports = async (actor, patientId) => {
  if (!actor) {
    throw createError("Unauthorized", 401);
  }

  const role = String(actor.role || "").toLowerCase();
  if (role === "admin") {
    return;
  }

  if (role !== "specialist") {
    throw createError("Access forbidden. You do not have permission", 403);
  }

  const assigned = await isSpecialistAssignedToPatient(actor.id, patientId);
  if (!assigned) {
    throw createError("You do not have access to this patient.", 403);
  }
};

const AI_REPORT_SELECT = `
  SELECT ar.*,
         p.full_name AS patient_name,
         p.profile_image_url AS patient_profile_image_url,
         u.full_name AS generated_by_name
  FROM ai_reports ar
  JOIN patients p ON p.id = ar.patient_id
  LEFT JOIN users u ON u.id = ar.generated_by
`;

const getAllReports = async (actor) => {
  const role = String(actor?.role || "").toLowerCase();

  if (role === "admin") {
    const result = await db.query(
      `
      ${AI_REPORT_SELECT}
      ORDER BY ar.generated_at DESC
      `
    );

    return result.rows;
  }

  if (role === "specialist") {
    const result = await db.query(
      `
      ${AI_REPORT_SELECT}
      JOIN patient_specialists ps
        ON ps.patient_id = ar.patient_id
       AND ps.specialist_id = $1
      ORDER BY ar.generated_at DESC
      `,
      [actor.id]
    );

    return result.rows;
  }

  throw createError("Access forbidden. You do not have permission", 403);
};

const getReportById = async (id) => {
  const result = await db.query(
    `
    ${AI_REPORT_SELECT}
    WHERE ar.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getReportsByPatient = async (patientId) => {
  const result = await db.query(
    `
    ${AI_REPORT_SELECT}
    WHERE ar.patient_id = $1
    ORDER BY ar.generated_at DESC
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

const exportReportPdf = async (id, actor) => {
  const report = await getReportById(id);

  if (!report) {
    return null;
  }

  await assertActorCanReadPatientAiReports(actor, report.patient_id);

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
  assertActorCanReadPatientAiReports,
  buildReportPrompt,
  buildRuleBasedReportFallback,
};