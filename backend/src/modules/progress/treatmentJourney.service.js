const pool = require("../../database/db");

const VALID_PERIODS = ["weekly", "monthly", "full"];
const TREND_THRESHOLD = 3;

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const roundScore = (value) => {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }

  return Math.round(num * 100) / 100;
};

const formatDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const parseDate = (value) => {
  const formatted = formatDate(value);
  if (!formatted) {
    return null;
  }

  const date = new Date(`${formatted}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getWeekBounds = (value) => {
  const date = parseDate(value);
  if (!date) {
    return { period_start: null, period_end: null };
  }

  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() + diffToMonday);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    period_start: formatDate(start),
    period_end: formatDate(end),
  };
};

const getMonthBounds = (value) => {
  const date = parseDate(value);
  if (!date) {
    return { period_start: null, period_end: null };
  }

  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  );

  return {
    period_start: formatDate(start),
    period_end: formatDate(end),
  };
};

const getBucketBounds = (value, period) => {
  if (period === "monthly" || period === "full") {
    return getMonthBounds(value);
  }

  return getWeekBounds(value);
};

const getBucketKey = (value, period) => {
  const bounds = getBucketBounds(value, period);
  return bounds.period_start;
};

const computeImprovementPercentage = (currentScore, previousScore) => {
  if (currentScore === null || previousScore === null || previousScore === 0) {
    return null;
  }

  return roundScore(((currentScore - previousScore) / previousScore) * 100);
};

const computeTrend = (chartPoints) => {
  if (chartPoints.length < 2) {
    return "stable";
  }

  const currentScore = chartPoints[chartPoints.length - 1].score;
  const previousScore = chartPoints[chartPoints.length - 2].score;

  if (currentScore === null || previousScore === null) {
    return "stable";
  }

  const diff = currentScore - previousScore;

  if (diff > TREND_THRESHOLD) {
    return "improving";
  }

  if (diff < -TREND_THRESHOLD) {
    return "declining";
  }

  return "stable";
};

const buildSummary = (chartPoints) => {
  if (chartPoints.length === 0) {
    return {
      starting_score: null,
      current_score: null,
      score_change: null,
      overall_improvement: null,
      trend: "stable",
    };
  }

  const startingScore = chartPoints[0].score;
  const currentScore = chartPoints[chartPoints.length - 1].score;
  const scoreChange =
    startingScore !== null && currentScore !== null
      ? roundScore(currentScore - startingScore)
      : null;
  const overallImprovement = computeImprovementPercentage(
    currentScore,
    startingScore
  );

  return {
    starting_score: startingScore,
    current_score: currentScore,
    score_change: scoreChange,
    overall_improvement: overallImprovement,
    trend: computeTrend(chartPoints),
  };
};

const getPatientTreatmentBounds = async (patientId) => {
  const patientResult = await pool.query(
    `SELECT id, created_at
     FROM patients
     WHERE id = $1`,
    [patientId]
  );

  if (!patientResult.rows[0]) {
    return null;
  }

  const planResult = await pool.query(
    `SELECT start_date, end_date
     FROM treatment_plans
     WHERE patient_id = $1
       AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [patientId]
  );

  const patient = patientResult.rows[0];
  const plan = planResult.rows[0];
  const today = formatDate(new Date());

  return {
    treatment_start: formatDate(plan?.start_date) || formatDate(patient.created_at),
    treatment_end: formatDate(plan?.end_date) || today,
  };
};

const getProgressSnapshots = async (
  patientId,
  period,
  treatmentStart,
  treatmentEnd
) => {
  const params = [patientId, treatmentStart, treatmentEnd];
  let sql = `
    SELECT
      period_start,
      period_end,
      exercises_completed,
      average_performance,
      improvement_percentage
    FROM progress_snapshots
    WHERE patient_id = $1
      AND period_end >= $2::date
      AND period_start <= $3::date
  `;

  if (period === "weekly") {
    sql += ` AND period = 'weekly'`;
  } else if (period === "monthly") {
    sql += ` AND period = 'monthly'`;
  }

  sql += ` ORDER BY period_start ASC, period_end ASC`;

  const result = await pool.query(sql, params);
  return result.rows;
};

const mapSnapshotsToChartPoints = (rows) =>
  rows
    .map((row) => {
      const score = roundScore(row.average_performance);

      if (score === null) {
        return null;
      }

      return {
        date: formatDate(row.period_end),
        period_start: formatDate(row.period_start),
        period_end: formatDate(row.period_end),
        score,
        exercises_completed: toNumber(row.exercises_completed) ?? 0,
        improvement_percentage: roundScore(row.improvement_percentage),
      };
    })
    .filter(Boolean);

const getExerciseReviews = async (patientId, treatmentStart, treatmentEnd) => {
  const result = await pool.query(
    `
    SELECT
      er.performance_rating,
      er.reviewed_at
    FROM exercise_reviews er
    INNER JOIN exercise_submissions es ON es.id = er.submission_id
    INNER JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
    WHERE ae.patient_id = $1
      AND er.reviewed_at::date >= $2::date
      AND er.reviewed_at::date <= $3::date
      AND er.performance_rating IS NOT NULL
    ORDER BY er.reviewed_at ASC
    `,
    [patientId, treatmentStart, treatmentEnd]
  );

  return result.rows;
};

const mapReviewsToChartPoints = (rows, period) => {
  const buckets = new Map();

  rows.forEach((row) => {
    const reviewedAt = formatDate(row.reviewed_at);
    const bucketKey = getBucketKey(reviewedAt, period);

    if (!bucketKey) {
      return;
    }

    const rating = toNumber(row.performance_rating);
    if (rating === null) {
      return;
    }

    const normalizedScore = roundScore(rating * 10);
    const bounds = getBucketBounds(reviewedAt, period);

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, {
        date: bounds.period_end,
        period_start: bounds.period_start,
        period_end: bounds.period_end,
        scores: [],
        exercises_completed: 0,
      });
    }

    const bucket = buckets.get(bucketKey);
    bucket.scores.push(normalizedScore);
    bucket.exercises_completed += 1;
  });

  const chartPoints = Array.from(buckets.values())
    .map((bucket) => ({
      date: bucket.date,
      period_start: bucket.period_start,
      period_end: bucket.period_end,
      score: roundScore(
        bucket.scores.reduce((sum, value) => sum + value, 0) /
          bucket.scores.length
      ),
      exercises_completed: bucket.exercises_completed,
      improvement_percentage: null,
    }))
    .sort((a, b) => {
      const aDate = parseDate(a.period_start);
      const bDate = parseDate(b.period_start);
      return (aDate?.getTime() || 0) - (bDate?.getTime() || 0);
    });

  chartPoints.forEach((point, index) => {
    if (index === 0) {
      return;
    }

    point.improvement_percentage = computeImprovementPercentage(
      point.score,
      chartPoints[index - 1].score
    );
  });

  return chartPoints;
};

const getTreatmentJourney = async (patientId, period = "weekly") => {
  const normalizedPeriod = VALID_PERIODS.includes(period) ? period : "weekly";
  const bounds = await getPatientTreatmentBounds(patientId);

  if (!bounds) {
    return null;
  }

  const { treatment_start, treatment_end } = bounds;
  const snapshots = await getProgressSnapshots(
    patientId,
    normalizedPeriod,
    treatment_start,
    treatment_end
  );

  let dataSource = "progress_snapshots";
  let chartPoints = mapSnapshotsToChartPoints(snapshots);

  if (snapshots.length === 0) {
    const reviews = await getExerciseReviews(
      patientId,
      treatment_start,
      treatment_end
    );
    chartPoints = mapReviewsToChartPoints(reviews, normalizedPeriod);
    dataSource = "exercise_reviews";
  }

  const summary = buildSummary(chartPoints);

  return {
    patient_id: patientId,
    period: normalizedPeriod,
    treatment_start,
    treatment_end,
    ...summary,
    data_source: dataSource,
    chart_points: chartPoints,
  };
};

module.exports = {
  VALID_PERIODS,
  getTreatmentJourney,
};
