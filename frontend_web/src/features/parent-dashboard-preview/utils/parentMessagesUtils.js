import { API_BASE_URL } from "../../../services/apiConfig";
import { readString } from "./parentDashboardMappers";

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

export function mapConversation(row) {
  const id = readString(row, ["id", "_id"]);
  const patientId = readString(row, ["patient_id", "patientId"]);
  const caseRequestChildName = readString(row, [
    "case_request_child_name",
    "caseRequestChildName",
    "child_name",
    "childName",
  ]);

  return {
    id,
    patientId,
    parentId: readString(row, ["parent_id", "parentId"]),
    specialistId: readString(row, ["specialist_id", "specialistId"]),
    patientName: readString(row, ["patient_name", "patientName"]),
    parentName: readString(row, ["parent_name", "parentName"]),
    specialistName: readString(row, ["specialist_name", "specialistName"]),
    caseRequestId: readString(row, ["case_request_id", "caseRequestId"]),
    caseRequestChildName,
    createdAt: readString(row, ["created_at", "createdAt"]),
    title: resolveConversationTitle(row),
    subtitle: resolveConversationSubtitle(row),
  };
}

function resolveConversationTitle(row) {
  const specialistName = readString(row, ["specialist_name", "specialistName"]);
  if (specialistName) {
    return specialistName;
  }

  return "Specialist";
}

function resolveConversationSubtitle(row) {
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

export function mapConversations(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapConversation).filter((conversation) => conversation.id);
}

export function mapMessage(row) {
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

function mapAttachment(row) {
  const fileUrl = resolveMediaUrl(readString(row, ["file_url", "fileUrl", "url"]));
  return {
    id: readString(row, ["id", "_id"]),
    fileUrl,
    fileType: readString(row, ["file_type", "fileType", "mimetype"]),
  };
}

export function mapMessages(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map(mapMessage)
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

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const MESSAGES_EMPTY_MESSAGE = "No conversations yet.";
export const MESSAGES_CHAT_EMPTY = "No messages yet. Start the conversation below.";
