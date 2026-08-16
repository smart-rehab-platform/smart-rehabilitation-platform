import { API_BASE_URL } from "../../../services/apiConfig";

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function resolveMediaUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  const trimmed = fileUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

function resolveSpecialistConversationSubtitle(row) {
  const caseChild = readString(row, [
    "case_request_child_name",
    "caseRequestChildName",
    "child_name",
    "childName",
  ]);
  const patientId = readString(row, ["patient_id", "patientId"]);
  const patientName = readString(row, ["patient_name", "patientName"]);

  if (caseChild && !patientId) {
    return `Regarding ${caseChild}`;
  }

  if (patientName) {
    return `Patient: ${patientName}`;
  }

  return null;
}

export function mapSpecialistConversation(row) {
  const id = readString(row, ["id", "_id"]);
  const parentName = readString(row, ["parent_name", "parentName"]) || "Parent";

  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]),
    parentId: readString(row, ["parent_id", "parentId"]),
    specialistId: readString(row, ["specialist_id", "specialistId"]),
    patientName: readString(row, ["patient_name", "patientName"]),
    parentName,
    specialistName: readString(row, ["specialist_name", "specialistName"]),
    caseRequestId: readString(row, ["case_request_id", "caseRequestId"]),
    caseRequestChildName: readString(row, [
      "case_request_child_name",
      "caseRequestChildName",
      "child_name",
      "childName",
    ]),
    createdAt: readString(row, ["created_at", "createdAt"]),
    title: parentName,
    subtitle: resolveSpecialistConversationSubtitle(row),
    startedLabel: formatConversationStarted(row),
  };
}

function formatConversationStarted(row) {
  const createdAt = readString(row, ["created_at", "createdAt"]);
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `Started ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function mapSpecialistConversations(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapSpecialistConversation).filter((conversation) => conversation.id);
}

function mapAttachment(row) {
  const fileUrl = resolveMediaUrl(readString(row, ["file_url", "fileUrl", "url"]));
  return {
    id: readString(row, ["id", "_id"]),
    fileUrl,
    fileType: readString(row, ["file_type", "fileType", "mimetype"]),
  };
}

export function mapSpecialistMessage(row) {
  const attachments = Array.isArray(row?.attachments)
    ? row.attachments.map(mapAttachment).filter((item) => item.fileUrl)
    : [];

  return {
    id: readString(row, ["id", "_id"]),
    conversationId: readString(row, ["conversation_id", "conversationId"]),
    senderId: readString(row, ["sender_id", "senderId"]),
    senderName: readString(row, ["sender_name", "senderName"]),
    senderRole: readString(row, ["sender_role", "senderRole"]),
    content: readString(row, ["content"]) || "",
    isRead: Boolean(row?.is_read ?? row?.isRead),
    sentAt: readString(row, ["sent_at", "sentAt", "created_at", "createdAt"]),
    attachments,
    hasAttachments: attachments.length > 0,
  };
}

export function mapSpecialistMessages(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map(mapSpecialistMessage)
    .filter((message) => message.id && (message.content || message.hasAttachments));
}

export { getLatestReadOutgoingMessageId } from "../../shared-dashboard/utils/messageReadReceiptUtils";

export function formatMessageTime(sentAt) {
  if (!sentAt) {
    return "";
  }

  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function formatMessageDaySeparator(sentAt, now = new Date()) {
  if (!sentAt) {
    return "";
  }

  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (dayDiff === 0) {
    return "Today";
  }

  if (dayDiff === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildMessageThreadItems(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const items = [];
  let previousDay = null;

  messages.forEach((message) => {
    const dayKey = message.sentAt ? startOfDay(new Date(message.sentAt)) : null;
    if (dayKey != null && dayKey !== previousDay) {
      items.push({
        type: "separator",
        key: `day-${dayKey}`,
        label: formatMessageDaySeparator(message.sentAt),
      });
      previousDay = dayKey;
    }

    items.push({
      type: "message",
      key: message.id,
      message,
    });
  });

  return items;
}

export function filterSpecialistConversations(conversations, query) {
  const trimmed = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (!trimmed) {
    return conversations;
  }

  return conversations.filter((conversation) => {
    const parent = conversation.parentName?.toLowerCase() ?? "";
    const patient = conversation.patientName?.toLowerCase() ?? "";
    const caseChild = conversation.caseRequestChildName?.toLowerCase() ?? "";
    return parent.includes(trimmed) || patient.includes(trimmed) || caseChild.includes(trimmed);
  });
}

export const SPECIALIST_MESSAGES_EMPTY = "No parent conversations yet.";
export const SPECIALIST_MESSAGES_CHAT_EMPTY = "No messages yet. Start the conversation.";
