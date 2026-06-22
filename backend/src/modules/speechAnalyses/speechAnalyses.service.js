const pool = require("../../database/db");

const analyzeSpeech = async ({ submission_id }) => {
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
    throw new Error("Exercise submission not found");
  }

  const submission = submissionResult.rows[0];

  const previousAnalysisResult = await pool.query(
    `
    SELECT sa.*
    FROM speech_analyses sa
    JOIN exercise_submissions es ON sa.submission_id = es.id
    JOIN assigned_exercises ae ON es.assigned_exercise_id = ae.id
    WHERE ae.patient_id = $1
    ORDER BY sa.analyzed_at DESC
    LIMIT 1
    `,
    [submission.patient_id]
  );

  const previousAnalysis = previousAnalysisResult.rows[0];

  const pronunciationScore = Math.floor(Math.random() * 21) + 70;
  const fluencyScore = Math.floor(Math.random() * 21) + 70;
  const overallScore = Number(
    ((pronunciationScore + fluencyScore) / 2).toFixed(2)
  );

  const transcript =
    "Simulated transcript: The child repeated the assigned pronunciation exercise.";

  const rawAiOutput = {
    analysis_type: "rule_based_simulation",
    patient_name: submission.patient_name,
    notes:
      "This is a simulated speech analysis. It can later be replaced with OpenAI Whisper or another speech AI model.",
    previous_overall_score: previousAnalysis
      ? previousAnalysis.overall_score
      : null,
    improvement:
      previousAnalysis && previousAnalysis.overall_score
        ? Number((overallScore - previousAnalysis.overall_score).toFixed(2))
        : null,
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
      transcript,
      pronunciationScore,
      fluencyScore,
      overallScore,
      previousAnalysis ? previousAnalysis.id : null,
      rawAiOutput,
    ]
  );

  return result.rows[0];
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