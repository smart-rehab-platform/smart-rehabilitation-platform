import api from "./api";

function extractData(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload ?? null;
}

function extractList(response) {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

function extractMap(response) {
  const data = extractData(response);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data;
  }
  return null;
}

function requireId(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }
  if (error instanceof Error && error.message) {
    throw error;
  }
  throw new Error(fallbackMessage);
}

export async function getUserConversations(userId) {
  const id = requireId(userId, "User id");
  try {
    const response = await api.get(`/users/${encodeURIComponent(id)}/conversations`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load conversations.");
  }
}

export async function getConversation(conversationId) {
  const id = requireId(conversationId, "Conversation id");
  try {
    const response = await api.get(`/conversations/${encodeURIComponent(id)}`);
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to load conversation.");
  }
}

export async function getConversationMessages(conversationId) {
  const id = requireId(conversationId, "Conversation id");
  try {
    const response = await api.get(`/conversations/${encodeURIComponent(id)}/messages`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load messages.");
  }
}

export async function sendConversationMessage(conversationId, content) {
  const id = requireId(conversationId, "Conversation id");
  const trimmed = typeof content === "string" ? content.trim() : "";
  if (!trimmed) {
    throw new Error("Message content is required.");
  }
  try {
    const response = await api.post(`/conversations/${encodeURIComponent(id)}/messages`, {
      content: trimmed,
    });
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to send message.");
  }
}

export async function uploadMessageAttachment(file, onProgress) {
  if (!(file instanceof File)) {
    throw new Error("A file is required.");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/uploads/message-attachment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (typeof onProgress === "function" && event.total) {
          onProgress(event.loaded / event.total);
        }
      },
    });
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to upload attachment.");
  }
}

export async function sendConversationAttachmentMessage(
  conversationId,
  { fileUrl, fileType, content },
) {
  const id = requireId(conversationId, "Conversation id");
  const trimmedUrl = typeof fileUrl === "string" ? fileUrl.trim() : "";
  if (!trimmedUrl) {
    throw new Error("Attachment URL is required.");
  }

  const payload = {
    file_url: trimmedUrl,
    file_type: fileType || null,
  };

  const trimmedContent = typeof content === "string" ? content.trim() : "";
  if (trimmedContent) {
    payload.content = trimmedContent;
  }

  try {
    const response = await api.post(
      `/conversations/${encodeURIComponent(id)}/attachments`,
      payload,
    );
    return extractMap(response);
  } catch (error) {
    throwServiceError(error, "Failed to send attachment.");
  }
}

export async function markMessageRead(messageId) {
  const id = requireId(messageId, "Message id");
  try {
    await api.patch(`/messages/${encodeURIComponent(id)}/read`);
  } catch (error) {
    throwServiceError(error, "Failed to mark message as read.");
  }
}

const parentCommunicationService = {
  getUserConversations,
  getConversation,
  getConversationMessages,
  sendConversationMessage,
  uploadMessageAttachment,
  sendConversationAttachmentMessage,
  markMessageRead,
};

export default parentCommunicationService;
