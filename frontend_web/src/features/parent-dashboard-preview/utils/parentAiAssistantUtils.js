import { readString } from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  AI_DISCLAIMER_TEXT,
  AI_EMPTY_MESSAGES,
  AI_QUICK_PROMPTS,
  AI_SAFETY_NOTICE,
  buildAiQuickPrompts,
  formatAiDisplayDate,
  getAiDisclaimerText,
  getAiEmptyMessages,
  getAiSafetyNotice,
  getAiSenderLabel,
  getNewConversationTitle,
  getSuggestedHomePracticeTitle,
} from "./parentAiAssistantLocalization";

export {
  AI_DISCLAIMER_TEXT,
  AI_EMPTY_MESSAGES,
  AI_QUICK_PROMPTS,
  AI_SAFETY_NOTICE,
  buildAiQuickPrompts,
  getAiDisclaimerText,
  getAiEmptyMessages,
  getAiSafetyNotice,
  getAiSenderLabel,
  getNewConversationTitle,
  getSuggestedHomePracticeTitle,
};

const CONVERSATION_TIMESTAMP_KEYS = ["last_message_at", "lastMessageAt", "started_at", "startedAt"];
const MESSAGE_TIMESTAMP_KEYS = ["created_at", "createdAt"];

const CONVERSATION_PATIENT_STORAGE_KEY = "pd-ai-conversation-patients";

function readTimestampValue(entity, keys) {
  if (!entity || typeof entity !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = entity[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function normalizeAiSender(sender) {
  const normalized = typeof sender === "string" ? sender.trim().toLowerCase() : "";
  if (normalized === "user") {
    return "user";
  }
  if (normalized === "bot") {
    return "assistant";
  }
  return normalized || "unknown";
}

export function readConversationPatientMap() {
  try {
    const raw = window.localStorage.getItem(CONVERSATION_PATIENT_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeConversationPatientMap(map) {
  try {
    window.localStorage.setItem(CONVERSATION_PATIENT_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures.
  }
}

export function rememberConversationPatient(conversationId, patientId) {
  if (!conversationId || !patientId) {
    return;
  }

  const map = readConversationPatientMap();
  map[conversationId] = patientId;
  writeConversationPatientMap(map);
}

export function getConversationPatientId(conversationId) {
  if (!conversationId) {
    return null;
  }

  return readConversationPatientMap()[conversationId] ?? null;
}

export function mapConversationRowToHubItem(row, childNameByPatientId = null, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const timestampValue = readTimestampValue(row, CONVERSATION_TIMESTAMP_KEYS);
  const parsedMs = timestampValue ? Date.parse(timestampValue) : Number.NaN;
  const preview = readString(row, ["last_message_preview", "lastMessagePreview"]);
  const patientId = getConversationPatientId(id);

  return {
    id,
    title: getNewConversationTitle(t),
    preview,
    patientId,
    childName: patientId && childNameByPatientId?.[patientId] ? childNameByPatientId[patientId] : null,
    messageCount: row.message_count ?? row.messageCount ?? 0,
    updatedDate: formatAiDisplayDate(timestampValue, locale, t),
    updatedAtMs: Number.isFinite(parsedMs) ? parsedMs : null,
    startedAt: readTimestampValue(row, ["started_at", "startedAt"]),
  };
}

export function mapConversationRowsToHubItems(rows, childNameByPatientId = null, options = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => mapConversationRowToHubItem(row, childNameByPatientId, options))
    .filter(Boolean)
    .sort((left, right) => (right.updatedAtMs ?? 0) - (left.updatedAtMs ?? 0));
}

export function filterConversationsForChild(conversations, childId) {
  if (!childId) {
    return [];
  }

  return conversations.filter((conversation) => conversation.patientId === childId);
}

export function mapMessageRowToHubItem(row, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const sender = readString(row, ["sender", "role"]) || "unknown";
  const content = readString(row, ["content", "message", "text"]) || "";
  const timestampValue = readTimestampValue(row, MESSAGE_TIMESTAMP_KEYS);
  const parsedMs = timestampValue ? Date.parse(timestampValue) : Number.NaN;
  const parsedContent = parseSuggestedHomePractice(content, options);

  return {
    id,
    conversationId: readString(row, ["conversation_id", "conversationId"]),
    sender,
    role: normalizeAiSender(sender),
    senderLabel: getAiSenderLabel(sender, t),
    content: parsedContent.mainText,
    suggestedPractice: parsedContent.suggestedPractice,
    createdDate: formatAiDisplayDate(timestampValue, locale, t),
    createdAtIso: timestampValue,
    createdAtMs: Number.isFinite(parsedMs) ? parsedMs : null,
  };
}

export function mapMessageRowsToHubItems(rows, options = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => mapMessageRowToHubItem(row, options))
    .filter(Boolean)
    .sort((left, right) => (left.createdAtMs ?? 0) - (right.createdAtMs ?? 0));
}

/**
 * Parses optional "Suggested Home Practice" section from plain-text bot replies.
 */
export function parseSuggestedHomePractice(content, options = {}) {
  const { t } = resolveMapperContext(options);

  if (!content || typeof content !== "string") {
    return { mainText: "", suggestedPractice: null };
  }

  const sectionTitle = getSuggestedHomePracticeTitle(t);
  const match = content.match(new RegExp(`\\n\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n`, "i"))
    ?? content.match(/\n\s*Suggested Home Practice\s*\n/i);

  if (!match || match.index === undefined) {
    return { mainText: content.trim(), suggestedPractice: null };
  }

  const mainText = content.slice(0, match.index).trim();
  const practiceText = content.slice(match.index + match[0].length).trim();

  if (!practiceText) {
    return { mainText: content.trim(), suggestedPractice: null };
  }

  return {
    mainText: mainText || content.trim(),
    suggestedPractice: {
      title: sectionTitle,
      body: practiceText,
    },
  };
}

export function mapSendMessageResponse(data, childNameByPatientId = null, options = {}) {
  const conversation = mapConversationRowToHubItem(data?.conversation, childNameByPatientId, options);
  const userMessage = mapMessageRowToHubItem(data?.user_message || data?.userMessage, options);
  const botMessage = mapMessageRowToHubItem(data?.bot_message || data?.botMessage, options);

  return {
    conversation,
    userMessage,
    botMessage,
    botMeta: data?.bot_meta || data?.botMeta || null,
  };
}

export function isLinkedChildId(childId, children) {
  if (!childId || !Array.isArray(children)) {
    return false;
  }

  return children.some((child) => child.id === childId);
}
