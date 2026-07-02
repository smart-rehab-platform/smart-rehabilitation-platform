const pool = require("../../database/db");
const aiProviderService = require("../../services/aiProvider.service");

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

const getPatientDiagnoses = async (patientId) => {
  const result = await pool.query(
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
     ORDER BY d.created_at DESC
     LIMIT 10`,
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

const getPatientAssignedExercises = async (patientId) => {
  const result = await pool.query(
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
     ORDER BY ae.created_at DESC
     LIMIT 10`,
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
     LIMIT 10`,
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
     LIMIT 10`,
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

const getPatientAiRecommendations = async (patientId) => {
  const result = await pool.query(
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
     ORDER BY generated_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientAiReports = async (patientId) => {
  const result = await pool.query(
    `SELECT
       id,
       type,
       period_start,
       period_end,
       summary,
       pdf_url,
       generated_at
     FROM ai_reports
     WHERE patient_id = $1
     ORDER BY generated_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const getPatientAiProgressNotes = async (patientId) => {
  const result = await pool.query(
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
     ORDER BY created_at DESC
     LIMIT 5`,
    [patientId]
  );

  return result.rows;
};

const collectPatientContext = async (patientId) => {
  const [
    patientProfile,
    diagnoses,
    treatmentPlans,
    goals,
    assignedExercises,
    exerciseSubmissions,
    exerciseReviews,
    progressSnapshots,
    speechAnalyses,
    aiRecommendations,
    aiReports,
    aiProgressNotes
  ] = await Promise.all([
    getPatientProfile(patientId),
    getPatientDiagnoses(patientId),
    getPatientTreatmentPlans(patientId),
    getPatientGoals(patientId),
    getPatientAssignedExercises(patientId),
    getPatientExerciseSubmissions(patientId),
    getPatientExerciseReviews(patientId),
    getPatientProgressSnapshots(patientId),
    getPatientSpeechAnalyses(patientId),
    getPatientAiRecommendations(patientId),
    getPatientAiReports(patientId),
    getPatientAiProgressNotes(patientId)
  ]);

  return {
    patientProfile,
    diagnoses,
    treatmentPlans,
    goals,
    assignedExercises,
    exerciseSubmissions,
    exerciseReviews,
    progressSnapshots,
    speechAnalyses,
    aiRecommendations,
    aiReports,
    aiProgressNotes
  };
};

const formatConversation = (row) => ({
  id: row.id,
  user_id: row.user_id,
  started_at: row.started_at,
  message_count:
    row.message_count === undefined ? undefined : Number(row.message_count),
  last_message_at: row.last_message_at || null,
  last_message_preview: row.last_message_preview || null
});

const formatMessage = (row) => ({
  id: row.id,
  conversation_id: row.conversation_id,
  sender: row.sender,
  content: row.content,
  created_at: row.created_at
});

const getConversationByIdForUser = async (conversationId, userId) => {
  const result = await pool.query(
    `SELECT
       c.id,
       c.user_id,
       c.started_at,
       COUNT(m.id)::int AS message_count,
       MAX(m.created_at) AS last_message_at
     FROM chatbot_conversations c
     LEFT JOIN chatbot_messages m ON m.conversation_id = c.id
     WHERE c.id = $1 AND c.user_id = $2
     GROUP BY c.id`,
    [conversationId, userId]
  );

  return result.rows[0] ? formatConversation(result.rows[0]) : null;
};

const getConversationMessagesRaw = async (conversationId) => {
  const result = await pool.query(
    `SELECT *
     FROM chatbot_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return result.rows.map(formatMessage);
};

const getConversationHistoryForPrompt = async (conversationId) => {
  const result = await pool.query(
    `SELECT sender, content, created_at
     FROM chatbot_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT 20`,
    [conversationId]
  );

  return result.rows;
};

const createFallbackReply = ({ question, patientContext, userRole }) => {
  const normalizedQuestion = String(question || "").toLowerCase();

  if (normalizedQuestion.includes("diagnos") || normalizedQuestion.includes("medicine")) {
    return "I can provide general rehabilitation support, but I cannot diagnose or advise on medication. Please contact your specialist or doctor for medical decisions.";
  }

  if (
    normalizedQuestion.includes("exercise") ||
    normalizedQuestion.includes("home practice") ||
    normalizedQuestion.includes("home-practice")
  ) {
    if (patientContext?.assignedExercises?.length > 0) {
      const exercise = patientContext.assignedExercises[0];
      return `A helpful next step is to focus on one assigned exercise at a time and keep the practice short, calm, and consistent. For example, "${exercise.exercise_title}" should be explained in simple steps, demonstrated slowly, and followed with encouragement. If the child struggles or becomes frustrated, please contact the specialist for plan adjustments.`;
    }

    return "For home practice, keep sessions short, simple, and encouraging. Focus on one task at a time, use clear demonstrations, praise effort, and contact the specialist if the activity seems too difficult or no longer fits the child’s needs.";
  }

  if (
    normalizedQuestion.includes("report") ||
    normalizedQuestion.includes("summary") ||
    normalizedQuestion.includes("progress")
  ) {
    const latestSnapshot = patientContext?.progressSnapshots?.[0] || null;
    if (latestSnapshot) {
      return `In simple terms, the latest progress data shows ${latestSnapshot.exercises_completed} completed exercises with an improvement percentage of ${latestSnapshot.improvement_percentage}. This can help guide discussion with the specialist, but treatment decisions should still come from the care team.`;
    }

    return "I can help explain reports and summaries in simple language, but I only have limited structured data right now. Please review the latest report with the specialist for clinical decisions.";
  }

  if (userRole === "specialist") {
    return "I can help summarize rehabilitation context, explain exercise adherence, and restate AI-generated summaries in simpler language. For final treatment decisions, please rely on your direct clinical judgment and the patient’s specialist workflow.";
  }

  return "I can help explain exercises, progress, reports, and general rehabilitation support in simple language. I cannot diagnose, prescribe medication, or replace a specialist, so please contact the care team for medical or urgent decisions.";
};

const buildChatbotPrompt = ({
  user,
  question,
  patientContext,
  chatHistory
}) => {
  const promptContext = {
    user: {
      id: user.id,
      full_name: user.full_name,
      role: user.role
    },
    patient_context: patientContext,
    chat_history: chatHistory,
    latest_user_question: question
  };

  return [
    "You are a warm, supportive, simple rehabilitation assistant for parents and specialists.",
    "Stay strictly within rehabilitation and support scope.",
    "You may explain assigned exercises, parent guidance, reports, summaries, recommendations, therapy-support tips, and FAQ-style questions.",
    "Do not diagnose, prescribe medication, replace a specialist, or provide emergency medical advice.",
    "If a question requires medical judgment, explicitly advise the user to contact a specialist or doctor.",
    "Use simple, supportive language that a parent can understand, while still being useful for specialists.",
    "When patient context is available, clearly state that your answer is based on the available patient data.",
    "If context is limited, say so clearly.",
    "Keep replies concise and usually within about 300 words unless the user explicitly asks for more detail.",
    "Whenever appropriate, include a short section titled 'Suggested Home Practice' with 2 to 4 practical activities a parent can do at home.",
    "Always end with a short disclaimer that medical decisions should always be made with the treating specialist.",
    "Reply in plain text only. Do not use JSON or markdown code fences.",
    "",
    "Context:",
    JSON.stringify(promptContext, null, 2)
  ].join("\n");
};

const insertMessage = async (conversationId, sender, content) => {
  const result = await pool.query(
    `INSERT INTO chatbot_messages (conversation_id, sender, content)
     VALUES ($1, $2::chatbot_sender, $3)
     RETURNING *`,
    [conversationId, sender, content]
  );

  return formatMessage(result.rows[0]);
};

const ensureConversationOwnership = async (conversationId, userId) => {
  const conversation = await getConversationByIdForUser(conversationId, userId);

  if (!conversation) {
    throw createError("Chatbot conversation not found", 404);
  }

  return conversation;
};

const createConversation = async (userId) => {
  const result = await pool.query(
    `INSERT INTO chatbot_conversations (user_id)
     VALUES ($1)
     RETURNING *`,
    [userId]
  );

  return formatConversation(result.rows[0]);
};

const getUserConversations = async (userId) => {
  const result = await pool.query(
    `SELECT
       c.id,
       c.user_id,
       c.started_at,
       COUNT(m.id)::int AS message_count,
       MAX(m.created_at) AS last_message_at,
       (
         SELECT LEFT(cm.content, 180)
         FROM chatbot_messages cm
         WHERE cm.conversation_id = c.id
         ORDER BY cm.created_at DESC
         LIMIT 1
       ) AS last_message_preview
     FROM chatbot_conversations c
     LEFT JOIN chatbot_messages m ON m.conversation_id = c.id
     WHERE c.user_id = $1
     GROUP BY c.id
     ORDER BY c.started_at DESC`,
    [userId]
  );

  return result.rows.map(formatConversation);
};

const getConversationById = async (conversationId, userId) => {
  return ensureConversationOwnership(conversationId, userId);
};

const getConversationMessages = async (conversationId, userId) => {
  await ensureConversationOwnership(conversationId, userId);
  return getConversationMessagesRaw(conversationId);
};

const sendMessage = async ({
  conversationId,
  user,
  content,
  patientId = null
}) => {
  const conversation = await ensureConversationOwnership(conversationId, user.id);

  let patientContext = null;
  if (patientId) {
    patientContext = await collectPatientContext(patientId);

    if (!patientContext.patientProfile) {
      throw createError("Patient not found", 404);
    }
  }

  const userMessage = await insertMessage(conversation.id, "user", content.trim());
  const chatHistory = await getConversationHistoryForPrompt(conversation.id);

  const fallbackReply = createFallbackReply({
    question: content,
    patientContext,
    userRole: user.role
  });
  const prompt = buildChatbotPrompt({
    user,
    question: content,
    patientContext,
    chatHistory
  });
  const botReply = await aiProviderService.generateChatbotReply(
    prompt,
    fallbackReply
  );
  const botMessage = await insertMessage(conversation.id, "bot", botReply.reply);

  return {
    conversation: await getConversationByIdForUser(conversation.id, user.id),
    user_message: userMessage,
    bot_message: botMessage,
    bot_meta: {
      provider: botReply.provider,
      used_fallback: botReply.used_fallback
    }
  };
};

const ask = async ({
  conversationId = null,
  user,
  content,
  patientId = null
}) => {
  const conversation = conversationId
    ? await ensureConversationOwnership(conversationId, user.id)
    : await createConversation(user.id);

  return sendMessage({
    conversationId: conversation.id,
    user,
    content,
    patientId
  });
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  sendMessage,
  ask
};
