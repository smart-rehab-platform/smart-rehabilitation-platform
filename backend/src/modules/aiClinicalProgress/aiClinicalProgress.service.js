const pool = require("../../database/db");
const aiProviderService = require("../../services/aiProvider.service");

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

const getPatientById = async (patientId) => {
  const result = await pool.query(
    `SELECT id, full_name, date_of_birth, gender, created_at
     FROM patients
     WHERE id = $1`,
    [patientId]
  );

  return result.rows[0] || null;
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

const getPatientProgressSnapshotsByPeriod = async (patientId, period) => {
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
     WHERE patient_id = $1 AND period = $2
     ORDER BY period_end DESC, created_at DESC
     LIMIT 4`,
    [patientId, period]
  );

  return result.rows;
};

const getPatientAiNotes = async (patientId) => {
  const result = await pool.query(
    `SELECT
       id,
       note_type,
       improvement_summary,
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

const collectSummaryContext = async (patientId, options = {}) => {
  const {
    period = null
  } = options;

  const [
    speechAnalyses,
    progressSnapshots,
    specialistNotes,
    exerciseReviews,
    treatmentPlanRevisions,
    goals,
    goalProgress,
    aiNotes,
    periodSnapshots
  ] = await Promise.all([
    getPatientSpeechAnalyses(patientId),
    getPatientProgressSnapshots(patientId),
    getPatientSpecialistNotes(patientId),
    getPatientExerciseReviews(patientId),
    getPatientTreatmentPlanRevisions(patientId),
    getPatientGoals(patientId),
    getPatientGoalProgress(patientId),
    getPatientAiNotes(patientId),
    period ? getPatientProgressSnapshotsByPeriod(patientId, period) : Promise.resolve([])
  ]);

  return {
    speechAnalyses,
    progressSnapshots,
    specialistNotes,
    exerciseReviews,
    treatmentPlanRevisions,
    goals,
    goalProgress,
    aiNotes,
    periodSnapshots
  };
};

const insertAiProgressNote = async ({
  patientId,
  noteType,
  generatedByAiProvider = "rule_based",
  improvementSummary,
  detectedChanges,
  clinicalNote,
  recommendedAction,
  treatmentAnalysis,
  decisionSupport,
  confidenceScore = 0.50,
  rawAiOutput
}) => {
  const insertResult = await pool.query(
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
       $3,
       $4,
       $5,
       $6,
       $7::jsonb,
       $8,
       $9,
       $10,
       $11::jsonb,
       $12,
       $13::jsonb
     )
     RETURNING *`,
    [
      patientId,
      null,
      noteType,
      generatedByAiProvider,
      null,
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

  return formatAiProgressNote(insertResult.rows[0]);
};

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildFallbackAiPayload = (summary) => ({
  clinical_note: summary.clinical_note,
  improvement_summary: summary.improvement_summary,
  detected_changes: summary.detected_changes,
  treatment_analysis: summary.treatment_analysis,
  recommendations: summary.recommended_action
    ? [summary.recommended_action]
    : [],
  decision_support: summary.decision_support,
  confidence_score: 0.5
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

const buildAiSummaryPrompt = ({ patient, noteType, context }) => {
  const summaryLabelMap = {
    clinical_summary: "clinical summary",
    weekly_summary: "weekly clinical summary",
    monthly_summary: "monthly clinical summary"
  };

  const summaryLabel = summaryLabelMap[noteType] || "clinical summary";

  const promptContext = {
    patient_profile: patient,
    speech_analyses: context.speechAnalyses,
    progress_snapshots: context.progressSnapshots,
    specialist_notes: context.specialistNotes,
    exercise_reviews: context.exerciseReviews,
    treatment_plan_revisions: context.treatmentPlanRevisions,
    goals: context.goals,
    goal_progress: context.goalProgress,
    existing_ai_progress_notes: context.aiNotes,
    period_specific_progress_snapshots: context.periodSnapshots
  };

  return [
    `Create a ${summaryLabel} for a rehabilitation specialist.`,
    "Use only the provided patient context.",
    "Do not invent data.",
    "If the data is limited, explicitly say that the data is limited.",
    "Do not provide a medical diagnosis.",
    "Provide decision support for the specialist, not final medical decisions.",
    "Keep recommendations practical and related to therapy progress.",
    "Return concise, clinically useful content.",
    "",
    "Patient context:",
    JSON.stringify(promptContext, null, 2)
  ].join("\n");
};

const buildRuleBasedClinicalSummary = (patient, context) => {
  const improvements = [];
  const regressions = [];
  const stableAreas = [];

  const latestSpeech = context.speechAnalyses[0] || null;
  const previousSpeech = context.speechAnalyses[1] || null;
  const latestSnapshot = context.progressSnapshots[0] || null;
  const reviewRetryCount = context.exerciseReviews.filter(
    (review) => review.requires_retry
  ).length;
  const strongReviewCount = context.exerciseReviews.filter((review) => {
    const rating = toNumber(review.performance_rating);
    return rating !== null && rating >= 7;
  }).length;
  const weakReviewCount = context.exerciseReviews.filter((review) => {
    const rating = toNumber(review.performance_rating);
    return rating !== null && rating < 5;
  }).length;
  const achievedGoals = context.goals.filter((goal) => goal.is_achieved).length;
  const highProgressGoals = context.goals.filter((goal) => {
    const completion = toNumber(goal.completion_percentage);
    return completion !== null && completion >= 75;
  }).length;

  if (latestSpeech && previousSpeech) {
    const latestOverall = toNumber(latestSpeech.overall_score);
    const previousOverall = toNumber(previousSpeech.overall_score);

    if (latestOverall !== null && previousOverall !== null) {
      if (latestOverall > previousOverall) {
        improvements.push(
          `Recent speech analysis improved from ${previousOverall.toFixed(2)} to ${latestOverall.toFixed(2)} overall score.`
        );
      } else if (latestOverall < previousOverall) {
        regressions.push(
          `Recent speech analysis decreased from ${previousOverall.toFixed(2)} to ${latestOverall.toFixed(2)} overall score.`
        );
      } else {
        stableAreas.push("Recent speech analysis scores appear stable across the latest two sessions.");
      }
    }
  } else if (latestSpeech) {
    stableAreas.push("A recent speech analysis is available, but more sessions are needed to confirm a trend.");
  }

  if (latestSnapshot) {
    const improvementPercentage = toNumber(latestSnapshot.improvement_percentage);

    if (improvementPercentage !== null) {
      if (improvementPercentage > 0) {
        improvements.push(
          `Latest ${latestSnapshot.period} progress snapshot indicates ${improvementPercentage.toFixed(2)}% improvement.`
        );
      } else if (improvementPercentage < 0) {
        regressions.push(
          `Latest ${latestSnapshot.period} progress snapshot indicates ${Math.abs(improvementPercentage).toFixed(2)}% decline.`
        );
      } else {
        stableAreas.push(`Latest ${latestSnapshot.period} progress snapshot shows no major change.`);
      }
    }
  }

  if (strongReviewCount > 0) {
    improvements.push(
      `${strongReviewCount} recent exercise review${strongReviewCount > 1 ? "s show" : " shows"} solid specialist ratings.`
    );
  }

  if (weakReviewCount > 0 || reviewRetryCount > 0) {
    regressions.push(
      `${weakReviewCount} low-rated review${weakReviewCount === 1 ? "" : "s"} and ${reviewRetryCount} retry flag${reviewRetryCount === 1 ? "" : "s"} suggest areas needing closer follow-up.`
    );
  }

  if (achievedGoals > 0) {
    improvements.push(
      `${achievedGoals} treatment goal${achievedGoals === 1 ? " has" : "s have"} been achieved.`
    );
  }

  if (highProgressGoals > 0) {
    improvements.push(
      `${highProgressGoals} active goal${highProgressGoals === 1 ? " is" : "s are"} at or above 75% completion.`
    );
  }

  if (context.specialistNotes.length > 0 && regressions.length === 0) {
    stableAreas.push("Recent specialist documentation is available and does not indicate urgent regression.");
  }

  if (improvements.length === 0 && regressions.length === 0) {
    stableAreas.push("Current data suggests a stable clinical picture with limited evidence of major change.");
  }

  const improvementSummary =
    improvements.length > 0
      ? `${patient.full_name} shows positive indicators in recent rehabilitation data. ${improvements.join(" ")}`
      : `${patient.full_name} has limited measurable improvement signals in the currently available rehabilitation data.`;

  const clinicalNote = regressions.length > 0
    ? `Rule-based review for ${patient.full_name} suggests mixed progress with some caution flags. ${regressions.join(" ")}`
    : `Rule-based review for ${patient.full_name} suggests stable-to-improving progress based on the available rehabilitation context.`;

  const recommendedAction = regressions.length > 0
    ? "Review the most recent exercise performance, confirm adherence to the current plan, and schedule a specialist follow-up to address the flagged areas."
    : improvements.length > 0
      ? "Continue the current rehabilitation plan, reinforce the areas showing progress, and maintain routine monitoring with upcoming sessions."
      : "Maintain the current plan and collect additional speech, review, and goal-progress data before making major treatment changes.";

  const treatmentAnalysis = [
    `Context reviewed: ${context.speechAnalyses.length} speech analyses, ${context.progressSnapshots.length} progress snapshots, ${context.specialistNotes.length} specialist notes, ${context.exerciseReviews.length} exercise reviews, ${context.treatmentPlanRevisions.length} treatment plan revisions, and ${context.goals.length} goals.`,
    improvements.length > 0
      ? "Current treatment direction shows encouraging response in at least part of the tracked data."
      : "Current treatment direction does not yet show strong improvement signals across the available tracked data."
  ].join(" ");

  const suggestedAction = regressions.length > 0
    ? "review_plan"
    : improvements.length > 0
      ? "continue_plan"
      : "monitor_closely";

  const decisionSupport = {
    suggested_action: suggestedAction,
    reason:
      regressions.length > 0
        ? "Recent structured data includes regression or retry indicators that warrant specialist review."
        : improvements.length > 0
          ? "Recent structured data includes measurable progress indicators and no major regression flags."
          : "Available data is limited or mixed, so conservative monitoring is recommended."
  };

  return {
    improvement_summary: improvementSummary,
    detected_changes: {
      improvements,
      regressions,
      stable_areas: stableAreas
    },
    clinical_note: clinicalNote,
    recommended_action: recommendedAction,
    treatment_analysis: treatmentAnalysis,
    decision_support: decisionSupport,
    raw_ai_output: {
      provider: "rule_based",
      context_used: true
    }
  };
};

const buildScoreTrends = ({ speechAnalyses, progressSnapshots, goalProgress }) => ({
  speech_overall: speechAnalyses
    .slice(0, 5)
    .map((analysis) => ({
      analyzed_at: analysis.analyzed_at,
      overall_score: toNumber(analysis.overall_score),
      pronunciation_score: toNumber(analysis.pronunciation_score),
      fluency_score: toNumber(analysis.fluency_score)
    })),
  progress_snapshots: progressSnapshots
    .slice(0, 5)
    .map((snapshot) => ({
      period: snapshot.period,
      period_end: snapshot.period_end,
      average_performance: toNumber(snapshot.average_performance),
      improvement_percentage: toNumber(snapshot.improvement_percentage),
      exercises_completed: snapshot.exercises_completed
    })),
  goal_completion: goalProgress
    .slice(0, 8)
    .map((entry) => ({
      goal_id: entry.goal_id,
      goal_title: entry.goal_title,
      recorded_at: entry.recorded_at,
      completion_percentage: toNumber(entry.completion_percentage)
    }))
});

const buildChangeAnalysis = (context) => {
  const detectedImprovements = [];
  const detectedRegressions = [];
  const stableAreas = [];
  const importantChanges = [];

  const latestSpeech = context.speechAnalyses[0] || null;
  const previousSpeech = context.speechAnalyses[1] || null;
  const latestSnapshot = context.progressSnapshots[0] || null;
  const previousSnapshot = context.progressSnapshots[1] || null;

  if (latestSpeech && previousSpeech) {
    const latestOverall = toNumber(latestSpeech.overall_score);
    const previousOverall = toNumber(previousSpeech.overall_score);

    if (latestOverall !== null && previousOverall !== null) {
      const diff = latestOverall - previousOverall;

      if (diff > 0) {
        detectedImprovements.push(
          `Speech overall score increased by ${diff.toFixed(2)} points.`
        );
        importantChanges.push("Speech analysis indicates an upward performance trend.");
      } else if (diff < 0) {
        detectedRegressions.push(
          `Speech overall score decreased by ${Math.abs(diff).toFixed(2)} points.`
        );
        importantChanges.push("Speech analysis indicates a recent decline that may require review.");
      } else {
        stableAreas.push("Speech overall score remained stable across the latest two analyses.");
      }
    }
  }

  if (latestSnapshot && previousSnapshot) {
    const latestAverage = toNumber(latestSnapshot.average_performance);
    const previousAverage = toNumber(previousSnapshot.average_performance);

    if (latestAverage !== null && previousAverage !== null) {
      const diff = latestAverage - previousAverage;

      if (diff > 0) {
        detectedImprovements.push(
          `Average performance increased by ${diff.toFixed(2)} in the latest progress snapshot.`
        );
      } else if (diff < 0) {
        detectedRegressions.push(
          `Average performance dropped by ${Math.abs(diff).toFixed(2)} in the latest progress snapshot.`
        );
      } else {
        stableAreas.push("Average performance is stable across the latest progress snapshots.");
      }
    }
  } else if (latestSnapshot) {
    stableAreas.push("A recent progress snapshot is available, but more history is needed to confirm a trend.");
  }

  const retryReviews = context.exerciseReviews.filter((review) => review.requires_retry);
  if (retryReviews.length > 0) {
    detectedRegressions.push(
      `${retryReviews.length} recent exercise review${retryReviews.length === 1 ? "" : "s"} required retry.`
    );
  }

  const strongReviews = context.exerciseReviews.filter((review) => {
    const rating = toNumber(review.performance_rating);
    return rating !== null && rating >= 7;
  });
  if (strongReviews.length > 0) {
    detectedImprovements.push(
      `${strongReviews.length} recent exercise review${strongReviews.length === 1 ? "" : "s"} showed strong performance ratings.`
    );
  }

  const goalEntries = context.goalProgress.slice(0, 2);
  if (goalEntries.length === 2) {
    const latestCompletion = toNumber(goalEntries[0].completion_percentage);
    const previousCompletion = toNumber(goalEntries[1].completion_percentage);

    if (latestCompletion !== null && previousCompletion !== null) {
      if (latestCompletion > previousCompletion) {
        detectedImprovements.push("Recent goal progress entries show increasing completion percentage.");
      } else if (latestCompletion < previousCompletion) {
        detectedRegressions.push("Recent goal progress entries show decreasing completion percentage.");
      } else {
        stableAreas.push("Recent goal progress entries are stable.");
      }
    }
  }

  if (
    detectedImprovements.length === 0 &&
    detectedRegressions.length === 0 &&
    stableAreas.length === 0
  ) {
    stableAreas.push("Not enough comparative data is available to detect meaningful change yet.");
  }

  return {
    detected_improvements: detectedImprovements,
    detected_regressions: detectedRegressions,
    stable_areas: stableAreas,
    score_trends: buildScoreTrends(context),
    important_changes: importantChanges
  };
};

const buildTreatmentEffectiveness = (patient, context) => {
  const effectiveAdjustments = [];
  const ineffectiveOrUnclearAdjustments = [];
  const evidence = [];

  context.treatmentPlanRevisions.forEach((revision) => {
    evidence.push({
      type: "treatment_plan_revision",
      created_at: revision.created_at,
      detail: revision.change_summary,
      plan_title: revision.plan_title
    });
  });

  const latestSnapshot = context.progressSnapshots[0] || null;
  const latestSpeech = context.speechAnalyses[0] || null;
  const achievedGoals = context.goals.filter((goal) => goal.is_achieved).length;

  if (latestSnapshot) {
    const improvementPercentage = toNumber(latestSnapshot.improvement_percentage);

    if (improvementPercentage !== null && improvementPercentage > 0) {
      effectiveAdjustments.push(
        `Recent ${latestSnapshot.period} snapshot shows ${improvementPercentage.toFixed(2)}% improvement.`
      );
      evidence.push({
        type: "progress_snapshot",
        period: latestSnapshot.period,
        period_end: latestSnapshot.period_end,
        improvement_percentage: improvementPercentage
      });
    } else if (improvementPercentage !== null && improvementPercentage < 0) {
      ineffectiveOrUnclearAdjustments.push(
        `Recent ${latestSnapshot.period} snapshot shows a ${Math.abs(improvementPercentage).toFixed(2)}% decline.`
      );
    }
  }

  if (latestSpeech) {
    const overallScore = toNumber(latestSpeech.overall_score);

    if (overallScore !== null && overallScore >= 70) {
      effectiveAdjustments.push(
        `Latest speech analysis overall score (${overallScore.toFixed(2)}) is in a favorable range.`
      );
    } else if (overallScore !== null) {
      ineffectiveOrUnclearAdjustments.push(
        `Latest speech analysis overall score (${overallScore.toFixed(2)}) suggests progress remains limited.`
      );
    }
  }

  if (achievedGoals > 0) {
    effectiveAdjustments.push(
      `${achievedGoals} treatment goal${achievedGoals === 1 ? " has" : "s have"} been achieved.`
    );
  }

  if (
    effectiveAdjustments.length === 0 &&
    ineffectiveOrUnclearAdjustments.length === 0
  ) {
    ineffectiveOrUnclearAdjustments.push(
      "Available revision and outcome data is too limited to determine treatment effectiveness with confidence."
    );
  }

  const summary =
    effectiveAdjustments.length > ineffectiveOrUnclearAdjustments.length
      ? `Rule-based review suggests the current treatment direction for ${patient.full_name} is showing useful signs of effectiveness.`
      : `Rule-based review suggests treatment effectiveness for ${patient.full_name} is mixed or still unclear from the available data.`;

  return {
    summary,
    effective_adjustments: effectiveAdjustments,
    ineffective_or_unclear_adjustments: ineffectiveOrUnclearAdjustments,
    evidence
  };
};

const buildDecisionSupport = (patient, context) => {
  const recommendations = [];
  const riskFlags = [];

  const latestSpeech = context.speechAnalyses[0] || null;
  const latestSnapshot = context.progressSnapshots[0] || null;
  const retryCount = context.exerciseReviews.filter((review) => review.requires_retry).length;
  const latestAiNote = context.aiNotes[0] || null;
  const lowProgressGoals = context.goals.filter((goal) => {
    const completion = toNumber(goal.completion_percentage);
    return completion !== null && completion < 40 && !goal.is_achieved;
  }).length;

  if (latestSpeech) {
    const overallScore = toNumber(latestSpeech.overall_score);
    if (overallScore !== null && overallScore < 60) {
      riskFlags.push("Latest speech analysis score is below the desired range.");
    } else if (overallScore !== null && overallScore >= 75) {
      recommendations.push("Maintain current speech-focused interventions because recent scores are encouraging.");
    }
  }

  if (latestSnapshot) {
    const improvementPercentage = toNumber(latestSnapshot.improvement_percentage);
    if (improvementPercentage !== null && improvementPercentage < 0) {
      riskFlags.push("Latest progress snapshot indicates negative change.");
    } else if (improvementPercentage !== null && improvementPercentage > 0) {
      recommendations.push("Continue the current plan while monitoring for sustained improvement in the next snapshot.");
    }
  }

  if (retryCount > 0) {
    riskFlags.push("Recent exercise reviews include retry requests.");
    recommendations.push("Review home exercise adherence and specialist feedback before the next treatment adjustment.");
  }

  if (lowProgressGoals > 0) {
    riskFlags.push("Some active goals remain below 40% completion.");
  }

  if (latestAiNote?.recommended_action) {
    recommendations.push(`Recent AI note recommendation: ${latestAiNote.recommended_action}`);
  }

  let suggestedAction = "monitor_closely";
  let reason = "Available data is mixed, so continued monitoring is the safest next step.";

  if (riskFlags.length >= 2) {
    suggestedAction = "review_plan";
    reason = "Multiple structured risk flags indicate the treatment plan may need closer specialist review.";
  } else if (riskFlags.length === 0 && recommendations.length > 0) {
    suggestedAction = "continue_plan";
    reason = "Recent structured data shows stable or improving signals without major risk flags.";
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Collect more structured progress data before making major clinical changes."
    );
  }

  return {
    suggested_action: suggestedAction,
    recommendations,
    reason,
    risk_flags: riskFlags,
    confidence_score: 0.5
  };
};

const buildPeriodicSummary = (patient, context, period) => {
  const periodLabel = period === "weekly" ? "weekly" : "monthly";
  const latestSnapshot = context.periodSnapshots[0] || null;
  const latestSpeech = context.speechAnalyses[0] || null;
  const retryCount = context.exerciseReviews.filter((review) => review.requires_retry).length;
  const achievedGoals = context.goals.filter((goal) => goal.is_achieved).length;

  const improvements = [];
  const regressions = [];
  const stableAreas = [];

  if (latestSnapshot) {
    const improvementPercentage = toNumber(latestSnapshot.improvement_percentage);
    if (improvementPercentage !== null && improvementPercentage > 0) {
      improvements.push(
        `${periodLabel} snapshot shows ${improvementPercentage.toFixed(2)}% improvement.`
      );
    } else if (improvementPercentage !== null && improvementPercentage < 0) {
      regressions.push(
        `${periodLabel} snapshot shows ${Math.abs(improvementPercentage).toFixed(2)}% decline.`
      );
    } else {
      stableAreas.push(`${periodLabel} snapshot suggests stable performance.`);
    }
  } else {
    stableAreas.push(`No dedicated ${periodLabel} progress snapshot is available yet.`);
  }

  if (latestSpeech) {
    const overallScore = toNumber(latestSpeech.overall_score);
    if (overallScore !== null && overallScore >= 70) {
      improvements.push(
        `Recent speech analysis overall score (${overallScore.toFixed(2)}) supports continued progress.`
      );
    } else if (overallScore !== null && overallScore < 60) {
      regressions.push(
        `Recent speech analysis overall score (${overallScore.toFixed(2)}) remains below the desired range.`
      );
    }
  }

  if (retryCount > 0) {
    regressions.push(
      `${retryCount} recent exercise review${retryCount === 1 ? "" : "s"} requested retry.`
    );
  }

  if (achievedGoals > 0) {
    improvements.push(
      `${achievedGoals} treatment goal${achievedGoals === 1 ? " has" : "s have"} been achieved so far.`
    );
  }

  if (improvements.length === 0 && regressions.length === 0) {
    stableAreas.push(`Available ${periodLabel} indicators are limited but broadly stable.`);
  }

  const improvementSummary =
    improvements.length > 0
      ? `${patient.full_name}'s ${periodLabel} summary indicates positive movement in tracked rehabilitation data. ${improvements.join(" ")}`
      : `${patient.full_name}'s ${periodLabel} summary does not yet show strong measurable improvement signals.`;

  const clinicalNote =
    regressions.length > 0
      ? `Rule-based ${periodLabel} summary suggests caution. ${regressions.join(" ")}`
      : `Rule-based ${periodLabel} summary suggests stable-to-improving rehabilitation progress.`;

  const recommendedAction =
    regressions.length > 0
      ? `Review the current ${periodLabel} rehabilitation results, address retry or low-score patterns, and consider a specialist follow-up.`
      : `Continue the current ${periodLabel} rehabilitation plan and keep monitoring the next round of structured outcomes.`;

  const treatmentAnalysis = `This ${periodLabel} summary used progress snapshots, speech analyses, exercise reviews, specialist notes, treatment plan revisions, and goals to build a rule-based overview.`;

  const decisionSupport = {
    suggested_action:
      regressions.length > 0 ? "review_plan" : improvements.length > 0 ? "continue_plan" : "monitor_closely",
    reason:
      regressions.length > 0
        ? `Recent ${periodLabel} indicators include decline or retry flags.`
        : improvements.length > 0
          ? `Recent ${periodLabel} indicators include measurable progress signs.`
          : `Recent ${periodLabel} indicators are limited, so close monitoring is recommended.`
  };

  return {
    improvement_summary: improvementSummary,
    detected_changes: {
      improvements,
      regressions,
      stable_areas: stableAreas
    },
    clinical_note: clinicalNote,
    recommended_action: recommendedAction,
    treatment_analysis: treatmentAnalysis,
    decision_support: decisionSupport,
    raw_ai_output: {
      provider: "rule_based",
      context_used: true,
      summary_type: `${periodLabel}_summary`
    }
  };
};

const generateSummaryNoteWithAiProvider = async ({
  patientId,
  noteType,
  period = null
}) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    return null;
  }

  const context = await collectSummaryContext(patientId, { period });

  const ruleBasedSummary =
    noteType === "clinical_summary"
      ? buildRuleBasedClinicalSummary(patient, context)
      : buildPeriodicSummary(patient, context, period);

  const prompt = buildAiSummaryPrompt({
    patient,
    noteType,
    context
  });

  const aiResult = await aiProviderService.generateClinicalSummaryJson(
    prompt,
    buildFallbackAiPayload(ruleBasedSummary)
  );

  return insertAiProgressNote({
    patientId,
    noteType,
    generatedByAiProvider: aiResult.provider,
    improvementSummary: aiResult.improvement_summary,
    detectedChanges: aiResult.detected_changes,
    clinicalNote: aiResult.clinical_note,
    recommendedAction: recommendationsToText(
      aiResult.recommendations,
      ruleBasedSummary.recommended_action
    ),
    treatmentAnalysis: aiResult.treatment_analysis,
    decisionSupport: aiResult.decision_support,
    confidenceScore:
      typeof aiResult.confidence_score === "number"
        ? aiResult.confidence_score
        : 0.5,
    rawAiOutput: {
      ...aiResult,
      context_used: true,
      note_type: noteType
    }
  });
};

const getPatientAiProgressNotes = async (patientId) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    return null;
  }

  const result = await pool.query(
    `SELECT
       apn.id,
       apn.patient_id,
       apn.speech_analysis_id,
       apn.note_type,
       apn.generated_by_ai_provider,
       apn.transcript_summary,
       apn.improvement_summary,
       apn.detected_changes,
       apn.clinical_note,
       apn.recommended_action,
       apn.treatment_analysis,
       apn.decision_support,
       apn.confidence_score,
       apn.raw_ai_output,
       apn.created_at,
       sa.id AS joined_speech_analysis_id,
       sa.submission_id AS speech_analysis_submission_id,
       sa.transcript AS speech_analysis_transcript,
       sa.pronunciation_score AS speech_analysis_pronunciation_score,
       sa.fluency_score AS speech_analysis_fluency_score,
       sa.overall_score AS speech_analysis_overall_score,
       sa.analyzed_at AS speech_analysis_analyzed_at
     FROM ai_progress_notes apn
     LEFT JOIN speech_analyses sa ON sa.id = apn.speech_analysis_id
     WHERE apn.patient_id = $1
     ORDER BY apn.created_at DESC`,
    [patientId]
  );

  return result.rows.map((row) => ({
    ...formatAiProgressNote(row),
    speech_analysis: row.joined_speech_analysis_id
      ? {
          id: row.joined_speech_analysis_id,
          submission_id: row.speech_analysis_submission_id,
          transcript: row.speech_analysis_transcript,
          pronunciation_score: row.speech_analysis_pronunciation_score,
          fluency_score: row.speech_analysis_fluency_score,
          overall_score: row.speech_analysis_overall_score,
          analyzed_at: row.speech_analysis_analyzed_at
        }
      : null
  }));
};

const generatePatientClinicalSummary = async (patientId) => {
  return generateSummaryNoteWithAiProvider({
    patientId,
    noteType: "clinical_summary"
  });
};

const getPatientChangeAnalysis = async (patientId) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    return null;
  }

  const [speechAnalyses, progressSnapshots, goalProgress, exerciseReviews] =
    await Promise.all([
      getPatientSpeechAnalyses(patientId),
      getPatientProgressSnapshots(patientId),
      getPatientGoalProgress(patientId),
      getPatientExerciseReviews(patientId)
    ]);

  return buildChangeAnalysis({
    speechAnalyses,
    progressSnapshots,
    goalProgress,
    exerciseReviews
  });
};

const getTreatmentEffectiveness = async (patientId) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    return null;
  }

  const [
    treatmentPlanRevisions,
    speechAnalyses,
    progressSnapshots,
    goals
  ] = await Promise.all([
    getPatientTreatmentPlanRevisions(patientId),
    getPatientSpeechAnalyses(patientId),
    getPatientProgressSnapshots(patientId),
    getPatientGoals(patientId)
  ]);

  return buildTreatmentEffectiveness(patient, {
    treatmentPlanRevisions,
    speechAnalyses,
    progressSnapshots,
    goals
  });
};

const getDecisionSupport = async (patientId) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    return null;
  }

  const [speechAnalyses, progressSnapshots, exerciseReviews, goals, aiNotes] =
    await Promise.all([
      getPatientSpeechAnalyses(patientId),
      getPatientProgressSnapshots(patientId),
      getPatientExerciseReviews(patientId),
      getPatientGoals(patientId),
      getPatientAiNotes(patientId)
    ]);

  return buildDecisionSupport(patient, {
    speechAnalyses,
    progressSnapshots,
    exerciseReviews,
    goals,
    aiNotes
  });
};

const generateWeeklySummary = async (patientId) => {
  return generateSummaryNoteWithAiProvider({
    patientId,
    noteType: "weekly_summary",
    period: "weekly"
  });
};

const generateMonthlySummary = async (patientId) => {
  return generateSummaryNoteWithAiProvider({
    patientId,
    noteType: "monthly_summary",
    period: "monthly"
  });
};

module.exports = {
  getPatientAiProgressNotes,
  generatePatientClinicalSummary,
  getPatientChangeAnalysis,
  getTreatmentEffectiveness,
  getDecisionSupport,
  generateWeeklySummary,
  generateMonthlySummary
};
