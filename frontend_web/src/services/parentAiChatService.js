import api from "./api";

const AI_CHAT_TIMEOUT_MS = 120000;

/**
 * @param {import('axios').AxiosResponse} response
 */
function extractData(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload ?? null;
}

/**
 * @param {import('axios').AxiosResponse} response
 */
function extractList(response) {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {import('axios').AxiosResponse} response
 */
function extractMap(response) {
  const data = extractData(response);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data;
  }
  return null;
}

/**
 * @param {unknown} error
 * @param {string} fallbackMessage
 */
function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  const serviceError = apiMessage && typeof apiMessage === "string" && apiMessage.trim()
    ? new Error(apiMessage.trim())
    : error instanceof Error && error.message
      ? error
      : new Error(fallbackMessage);

  if (error?.response?.status) {
    serviceError.statusCode = error.response.status;
  }

  throw serviceError;
}

function aiConfig() {
  return { timeout: AI_CHAT_TIMEOUT_MS };
}

export async function getAiConversations() {
  try {
    const response = await api.get("/ai/chat/conversations", aiConfig());
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load AI conversations.");
  }
}

/**
 * @param {string|null|undefined} patientId
 */
export async function createAiConversation(patientId = null) {
  try {
    const body = patientId ? { patient_id: patientId } : {};
    const response = await api.post("/ai/chat/conversations", body, aiConfig());
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to create AI conversation.");
  }
}

/**
 * @param {string} conversationId
 */
export async function getAiConversation(conversationId) {
  try {
    const response = await api.get(
      `/ai/chat/conversations/${encodeURIComponent(conversationId)}`,
      aiConfig(),
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load AI conversation.");
  }
}

/**
 * @param {string} conversationId
 */
export async function getAiConversationMessages(conversationId) {
  try {
    const response = await api.get(
      `/ai/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      aiConfig(),
    );
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load AI messages.");
  }
}

/**
 * @param {string} conversationId
 * @param {string} content
 * @param {string|null|undefined} patientId
 */
export async function sendAiMessage(conversationId, content, patientId = null) {
  try {
    const body = { content: content.trim() };
    if (patientId) {
      body.patient_id = patientId;
    }

    const response = await api.post(
      `/ai/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      body,
      aiConfig(),
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to send AI message.");
  }
}

/**
 * @param {string} content
 * @param {{ conversationId?: string|null, patientId?: string|null }} options
 */
export async function askAiAssistant(content, options = {}) {
  try {
    const body = { content: content.trim() };
    if (options.conversationId) {
      body.conversation_id = options.conversationId;
    }
    if (options.patientId) {
      body.patient_id = options.patientId;
    }

    const response = await api.post("/ai/chat/ask", body, aiConfig());
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to send AI message.");
  }
}
