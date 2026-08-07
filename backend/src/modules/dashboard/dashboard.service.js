const pool = require("../../database/db");
const {
  getAppTimezone,
  formatWeekLabel,
  localDateSql,
  normalizeWeekOffset,
} = require("../../utils/appTimezone");

// Admin Dashboard
exports.getAdminOverview = async () => {
  const usersResult = await pool.query(
    `SELECT COUNT(*)::int AS total_users FROM users`
  );

  const patientsResult = await pool.query(
    `SELECT COUNT(*)::int AS total_patients FROM patients`
  );

  const exercisesResult = await pool.query(
    `SELECT COUNT(*)::int AS total_exercises FROM exercises`
  );

  const sessionsResult = await pool.query(
    `SELECT COUNT(*)::int AS total_sessions FROM sessions`
  );

  return {
    totalUsers: usersResult.rows[0].total_users,
    totalPatients: patientsResult.rows[0].total_patients,
    totalExercises: exercisesResult.rows[0].total_exercises,
    totalSessions: sessionsResult.rows[0].total_sessions,
  };
};

exports.getAdminUsers = async () => {
  const result = await pool.query(`
    SELECT
      role,
      COUNT(*)::int AS count
    FROM users
    GROUP BY role
    ORDER BY role
  `);

  return result.rows;
};

exports.getSystemAnalytics = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM patients) AS patients,
      (SELECT COUNT(*) FROM treatment_plans) AS treatment_plans,
      (SELECT COUNT(*) FROM exercises) AS exercises
  `);

  return result.rows[0];
};

exports.getWeeklySystemActivity = async (weekOffset = 0) => {
  const offset = Number.isFinite(Number(weekOffset))
    ? Math.max(0, Math.min(52, Math.trunc(Number(weekOffset))))
    : 0;

  const result = await pool.query(
    `
    WITH week_bounds AS (
      SELECT
        (date_trunc('week', CURRENT_DATE)::date - ($1 * interval '7 days'))::date AS week_start,
        (date_trunc('week', CURRENT_DATE)::date - ($1 * interval '7 days') + interval '6 days')::date AS week_end
    ),
    days AS (
      SELECT
        generate_series(
          (SELECT week_start FROM week_bounds),
          (SELECT week_end FROM week_bounds),
          interval '1 day'
        )::date AS activity_day
    ),
    events AS (
      SELECT u.created_at::date AS activity_day
      FROM users u
      WHERE u.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT p.created_at::date AS activity_day
      FROM patients p
      WHERE p.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT COALESCE(cir.submitted_at, cir.created_at)::date AS activity_day
      FROM case_intake_requests cir
      WHERE COALESCE(cir.submitted_at, cir.created_at)::date
        BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT tp.created_at::date AS activity_day
      FROM treatment_plans tp
      WHERE tp.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT g.created_at::date AS activity_day
      FROM goals g
      WHERE g.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT e.created_at::date AS activity_day
      FROM exercises e
      WHERE e.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT ae.created_at::date AS activity_day
      FROM assigned_exercises ae
      WHERE ae.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT es.submitted_at::date AS activity_day
      FROM exercise_submissions es
      WHERE es.submitted_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT r.created_at::date AS activity_day
      FROM reports r
      WHERE r.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT ar.generated_at::date AS activity_day
      FROM ai_reports ar
      WHERE ar.generated_at::date
        BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT rec.generated_at::date AS activity_day
      FROM ai_recommendations rec
      WHERE rec.generated_at::date
        BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT COALESCE(s.updated_at, s.scheduled_at)::date AS activity_day
      FROM sessions s
      WHERE s.status = 'completed'
        AND COALESCE(s.updated_at, s.scheduled_at)::date
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT COALESCE(ps.period_start, ps.period_end)::date AS activity_day
      FROM progress_snapshots ps
      WHERE COALESCE(ps.period_start, ps.period_end)::date
        BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT gp.recorded_at::date AS activity_day
      FROM goal_progress gp
      WHERE gp.recorded_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT sa.analyzed_at::date AS activity_day
      FROM speech_analyses sa
      WHERE sa.analyzed_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT n.created_at::date AS activity_day
      FROM notifications n
      WHERE n.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT al.created_at::date AS activity_day
      FROM audit_logs al
      WHERE al.created_at::date BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)
    )
    SELECT
      d.activity_day,
      trim(to_char(d.activity_day, 'Dy')) AS day_label,
      to_char(d.activity_day, 'FMDay') AS full_day_label,
      COUNT(e.activity_day)::int AS activity_count
    FROM days d
    LEFT JOIN events e ON e.activity_day = d.activity_day
    GROUP BY d.activity_day
    ORDER BY d.activity_day
  `,
    [offset]
  );

  const weekStart = result.rows[0]?.activity_day ?? null;
  const weekEnd = result.rows[result.rows.length - 1]?.activity_day ?? null;

  return {
    week_offset: offset,
    week_start: weekStart,
    week_end: weekEnd,
    days: result.rows.map((row) => ({
      date: row.activity_day,
      label: row.day_label,
      full_label: row.full_day_label,
      activity_count: row.activity_count,
    })),
  };
};

// Specialist Dashboard
exports.getSpecialistOverview = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT
      (SELECT COUNT(*) FROM patient_specialists WHERE specialist_id = $1) AS active_cases,
      (SELECT COUNT(*) FROM sessions WHERE specialist_id = $1 AND status = 'scheduled') AS upcoming_sessions,
      (
        SELECT COUNT(*)
        FROM exercise_submissions es
        WHERE es.status = 'pending'
      ) AS pending_reviews
    `,
    [specialistId]
  );

  return result.rows[0];
};

exports.getSpecialistActiveCases = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT
      p.*
    FROM patients p
    JOIN patient_specialists ps
      ON ps.patient_id = p.id
    WHERE ps.specialist_id = $1
    ORDER BY p.created_at DESC
    `,
    [specialistId]
  );

  return result.rows;
};

exports.getSpecialistUpcomingSessions = async (specialistId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM sessions
    WHERE specialist_id = $1
      AND status = 'scheduled'
    ORDER BY scheduled_at ASC
    `,
    [specialistId]
  );

  return result.rows;
};

exports.getSpecialistPendingReviews = async () => {
  const result = await pool.query(`
    SELECT *
    FROM exercise_submissions
    WHERE status = 'pending'
    ORDER BY submitted_at DESC
  `);

  return result.rows;
};

exports.getSpecialistWeeklyPatientInteractions = async (
  specialistId,
  weekOffset = 0
) => {
  const offset = normalizeWeekOffset(weekOffset);
  const timezone = getAppTimezone();
  const localTimestamp = (expression) => localDateSql(expression, timezone);
  const sessionActivityDay = localTimestamp("COALESCE(s.updated_at, s.scheduled_at)");
  const assessmentActivityDay = `COALESCE(a.assessment_date, ${localTimestamp("a.created_at")})`;
  const treatmentPlanCreatedDay = localTimestamp("tp.created_at");
  const treatmentPlanUpdatedDay = localTimestamp("tp.updated_at");
  const planRevisionDay = localTimestamp("tpr.created_at");
  const assignedExerciseDay = localTimestamp("ae.created_at");
  const exerciseReviewDay = localTimestamp("er.reviewed_at");
  const reportDay = localTimestamp("r.created_at");
  const aiRecommendationDay = localTimestamp("rec.reviewed_at");
  const messageDay = localTimestamp("m.sent_at");
  const sessionRequestDay = localTimestamp("sr.reviewed_at");

  const result = await pool.query(
    `
    WITH local_today AS (
      SELECT (now() AT TIME ZONE '${timezone}')::date AS today
    ),
    week_bounds AS (
      SELECT
        (date_trunc('week', today)::date + ($1 * interval '7 days'))::date AS week_start,
        (date_trunc('week', today)::date + ($1 * interval '7 days') + interval '6 days')::date AS week_end
      FROM local_today
    ),
    days AS (
      SELECT
        generate_series(
          (SELECT week_start FROM week_bounds),
          (SELECT week_end FROM week_bounds),
          interval '1 day'
        )::date AS activity_day
    ),
    events AS (
      SELECT
        s.patient_id,
        ${sessionActivityDay} AS activity_day
      FROM sessions s
      JOIN patient_specialists ps
        ON ps.patient_id = s.patient_id
       AND ps.specialist_id = $2
      WHERE s.specialist_id = $2
        AND s.status = 'completed'
        AND ${sessionActivityDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        a.patient_id,
        ${assessmentActivityDay} AS activity_day
      FROM assessments a
      JOIN patient_specialists ps
        ON ps.patient_id = a.patient_id
       AND ps.specialist_id = $2
      WHERE a.specialist_id = $2
        AND ${assessmentActivityDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        tp.patient_id,
        ${treatmentPlanCreatedDay} AS activity_day
      FROM treatment_plans tp
      JOIN patient_specialists ps
        ON ps.patient_id = tp.patient_id
       AND ps.specialist_id = $2
      WHERE tp.specialist_id = $2
        AND ${treatmentPlanCreatedDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        tp.patient_id,
        ${treatmentPlanUpdatedDay} AS activity_day
      FROM treatment_plans tp
      JOIN patient_specialists ps
        ON ps.patient_id = tp.patient_id
       AND ps.specialist_id = $2
      WHERE tp.specialist_id = $2
        AND ${treatmentPlanUpdatedDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        tp.patient_id,
        ${planRevisionDay} AS activity_day
      FROM treatment_plan_revisions tpr
      JOIN treatment_plans tp
        ON tp.id = tpr.plan_id
      JOIN patient_specialists ps
        ON ps.patient_id = tp.patient_id
       AND ps.specialist_id = $2
      WHERE tpr.edited_by = $2
        AND ${planRevisionDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        ae.patient_id,
        ${assignedExerciseDay} AS activity_day
      FROM assigned_exercises ae
      JOIN patient_specialists ps
        ON ps.patient_id = ae.patient_id
       AND ps.specialist_id = $2
      WHERE ae.assigned_by = $2
        AND ${assignedExerciseDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        ae.patient_id,
        ${exerciseReviewDay} AS activity_day
      FROM exercise_reviews er
      JOIN exercise_submissions es
        ON es.id = er.submission_id
      JOIN assigned_exercises ae
        ON ae.id = es.assigned_exercise_id
      JOIN patient_specialists ps
        ON ps.patient_id = ae.patient_id
       AND ps.specialist_id = $2
      WHERE er.specialist_id = $2
        AND ${exerciseReviewDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        r.patient_id,
        ${reportDay} AS activity_day
      FROM reports r
      JOIN patient_specialists ps
        ON ps.patient_id = r.patient_id
       AND ps.specialist_id = $2
      WHERE r.generated_by = $2
        AND ${reportDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        rec.patient_id,
        ${aiRecommendationDay} AS activity_day
      FROM ai_recommendations rec
      JOIN patient_specialists ps
        ON ps.patient_id = rec.patient_id
       AND ps.specialist_id = $2
      WHERE rec.reviewed_by = $2
        AND rec.reviewed_at IS NOT NULL
        AND ${aiRecommendationDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        c.patient_id,
        ${messageDay} AS activity_day
      FROM messages m
      JOIN conversations c
        ON c.id = m.conversation_id
      JOIN patient_specialists ps
        ON ps.patient_id = c.patient_id
       AND ps.specialist_id = $2
      WHERE m.sender_id = $2
        AND c.patient_id IS NOT NULL
        AND ${messageDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)

      UNION ALL

      SELECT
        sr.patient_id,
        ${sessionRequestDay} AS activity_day
      FROM session_requests sr
      JOIN patient_specialists ps
        ON ps.patient_id = sr.patient_id
       AND ps.specialist_id = $2
      WHERE sr.specialist_id = $2
        AND sr.reviewed_at IS NOT NULL
        AND ${sessionRequestDay}
          BETWEEN (SELECT week_start FROM week_bounds) AND (SELECT week_end FROM week_bounds)
    ),
    daily_patients AS (
      SELECT DISTINCT
        e.activity_day,
        e.patient_id,
        p.full_name AS patient_name
      FROM events e
      JOIN patients p
        ON p.id = e.patient_id
    ),
    weekly_totals AS (
      SELECT COUNT(DISTINCT patient_id)::int AS total_unique_patients
      FROM daily_patients
    )
    SELECT
      d.activity_day,
      trim(to_char(d.activity_day, 'Dy')) AS day_label,
      COALESCE(COUNT(dp.patient_id), 0)::int AS interaction_count,
      COALESCE(
        json_agg(
          json_build_object('id', dp.patient_id, 'name', dp.patient_name)
          ORDER BY dp.patient_name
        ) FILTER (WHERE dp.patient_id IS NOT NULL),
        '[]'::json
      ) AS patients,
      (SELECT total_unique_patients FROM weekly_totals) AS total_unique_patients
    FROM days d
    LEFT JOIN daily_patients dp
      ON dp.activity_day = d.activity_day
    GROUP BY d.activity_day
    ORDER BY d.activity_day
    `,
    [offset, specialistId]
  );

  const weekStart = result.rows[0]?.activity_day ?? null;
  const weekEnd = result.rows[result.rows.length - 1]?.activity_day ?? null;
  const totalUniquePatients = result.rows[0]?.total_unique_patients ?? 0;

  const weekLabel = formatWeekLabel(offset);

  return {
    week_offset: offset,
    weekOffset: offset,
    week_label: weekLabel,
    weekLabel,
    week_start: weekStart,
    week_end: weekEnd,
    total_unique_patients: totalUniquePatients,
    totalUniquePatients,
    timezone,
    days: result.rows.map((row) => ({
      day: row.day_label,
      date: row.activity_day,
      count: row.interaction_count,
      patients: row.patients,
    })),
  };
};

// Parent Dashboard
exports.getParentOverview = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(DISTINCT pg.patient_id)::int AS children_count
    FROM patient_guardians pg
    WHERE pg.parent_id = $1
    `,
    [parentId]
  );

  return result.rows[0];
};

exports.getParentChildrenProgress = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.full_name,
      ps.period,
      ps.improvement_percentage
    FROM patient_guardians pg
    JOIN patients p
      ON p.id = pg.patient_id
    LEFT JOIN progress_snapshots ps
      ON ps.patient_id = p.id
    WHERE pg.parent_id = $1
    ORDER BY p.full_name
    `,
    [parentId]
  );

  return result.rows;
};

exports.getParentTasks = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      ae.*
    FROM assigned_exercises ae
    JOIN patient_guardians pg
      ON pg.patient_id = ae.patient_id
    WHERE pg.parent_id = $1
      AND ae.is_active = true
    ORDER BY ae.created_at DESC
    `,
    [parentId]
  );

  return result.rows;
};

exports.getParentReports = async (parentId) => {
  const result = await pool.query(
    `
    SELECT
      r.*
    FROM reports r
    JOIN patient_guardians pg
      ON pg.patient_id = r.patient_id
    WHERE pg.parent_id = $1
    ORDER BY r.created_at DESC
    `,
    [parentId]
  );

  return result.rows;
};

exports.getAdminPatients = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.full_name,
      p.date_of_birth,
      p.gender,
      p.profile_image_url,
      p.created_at,
      ld.diagnosis_title AS condition,
      ld.diagnosed_at AS condition_diagnosed_at,
      ps.session_id AS previous_session_id,
      ps.scheduled_at AS previous_session_at,
      ps.status AS previous_session_status
    FROM patients p
    LEFT JOIN LATERAL (
      SELECT diagnosis_title, diagnosed_at
      FROM diagnoses d
      WHERE d.patient_id = p.id
      ORDER BY COALESCE(d.diagnosed_at, d.created_at) DESC
      LIMIT 1
    ) ld ON true
    LEFT JOIN LATERAL (
      SELECT s.id AS session_id, s.scheduled_at, s.status
      FROM sessions s
      WHERE s.patient_id = p.id
        AND s.scheduled_at <= now()
      ORDER BY s.scheduled_at DESC
      LIMIT 1
    ) ps ON true
    ORDER BY p.full_name ASC
  `);

  return result.rows.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    date_of_birth: row.date_of_birth,
    gender: row.gender,
    profile_image_url: row.profile_image_url,
    created_at: row.created_at,
    condition: row.condition,
    condition_diagnosed_at: row.condition_diagnosed_at,
    previous_session: row.previous_session_id
      ? {
          id: row.previous_session_id,
          scheduled_at: row.previous_session_at,
          status: row.previous_session_status,
        }
      : null,
  }));
};

exports.getAdminAiCenter = async () => {
  const speechStats = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COALESCE(AVG(overall_score), 0)::numeric(10,2) AS average_score
    FROM speech_analyses
  `);

  const latestSpeech = await pool.query(`
    SELECT
      sa.id,
      sa.overall_score,
      sa.pronunciation_score,
      sa.fluency_score,
      sa.analyzed_at,
      p.id AS patient_id,
      p.full_name AS patient_name
    FROM speech_analyses sa
    JOIN exercise_submissions es ON sa.submission_id = es.id
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    JOIN patients p ON ae.patient_id = p.id
    ORDER BY sa.analyzed_at DESC
    LIMIT 5
  `);

  const recStats = await pool.query(`
    SELECT COUNT(*)::int AS total FROM ai_recommendations
  `);

  const latestRecommendations = await pool.query(`
    SELECT
      ar.id,
      ar.type,
      ar.status,
      ar.generated_at,
      p.id AS patient_id,
      p.full_name AS patient_name
    FROM ai_recommendations ar
    JOIN patients p ON ar.patient_id = p.id
    ORDER BY ar.generated_at DESC
    LIMIT 5
  `);

  const reportStats = await pool.query(`
    SELECT COUNT(*)::int AS total FROM ai_reports
  `);

  const latestReports = await pool.query(`
    SELECT
      ar.id,
      ar.type,
      ar.period_start,
      ar.period_end,
      ar.generated_at,
      p.id AS patient_id,
      p.full_name AS patient_name
    FROM ai_reports ar
    JOIN patients p ON ar.patient_id = p.id
    ORDER BY ar.generated_at DESC
    LIMIT 5
  `);

  const patientsNeedingAttention = await pool.query(`
    SELECT
      p.id,
      p.full_name,
      latest_speech.overall_score AS speech_score,
      latest_progress.improvement_percentage
    FROM patients p
    LEFT JOIN LATERAL (
      SELECT sa.overall_score
      FROM speech_analyses sa
      JOIN exercise_submissions es ON sa.submission_id = es.id
      JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
      WHERE ae.patient_id = p.id
      ORDER BY sa.analyzed_at DESC
      LIMIT 1
    ) latest_speech ON true
    LEFT JOIN LATERAL (
      SELECT improvement_percentage
      FROM progress_snapshots
      WHERE patient_id = p.id
      ORDER BY created_at DESC
      LIMIT 1
    ) latest_progress ON true
    WHERE (
      latest_speech.overall_score IS NOT NULL
      AND latest_speech.overall_score < 75
    ) OR (
      latest_progress.improvement_percentage IS NOT NULL
      AND latest_progress.improvement_percentage < 10
    )
    ORDER BY
      COALESCE(latest_speech.overall_score, 100),
      COALESCE(latest_progress.improvement_percentage, 100)
    LIMIT 10
  `);

  const usageStats = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM speech_analyses) AS speech_analyses_count,
      (SELECT COUNT(*)::int FROM ai_recommendations) AS recommendations_count,
      (SELECT COUNT(*)::int FROM ai_reports) AS reports_count,
      (SELECT COUNT(*)::int FROM ai_recommendations WHERE status = 'pending') AS pending_recommendations
  `);

  return {
    speech: {
      total: speechStats.rows[0].total,
      average_score: Number(speechStats.rows[0].average_score),
      latest: latestSpeech.rows,
    },
    recommendations: {
      total: recStats.rows[0].total,
      latest: latestRecommendations.rows,
    },
    reports: {
      total: reportStats.rows[0].total,
      latest: latestReports.rows,
    },
    patients_needing_attention: patientsNeedingAttention.rows,
    usage_statistics: usageStats.rows[0],
  };
};