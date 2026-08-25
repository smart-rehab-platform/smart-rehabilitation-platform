import { API_BASE_URL } from "../../../services/apiConfig";
import {
  readUnreadCount,
} from "../../shared-dashboard/utils/messagesConversationListUtils.js";

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
    return { kind: "regardingChild", name: caseChild };
  }

  if (patientName) {
    return { kind: "patient", name: patientName };
  }

  return null;
}

export function mapSpecialistConversation(row) {
  const id = readString(row, ["id", "_id"]);
  const parentName = readString(row, ["parent_name", "parentName"]) || "";

  return {
    id,
    patientId: readString(row, ["patient_id", "patientId"]),
    parentId: readString(row, ["parent_id", "parentId"]),
    specialistId: readString(row, ["specialist_id", "specialistId"]),
    patientName: readString(row, ["patient_name", "patientName"]),
    parentName,
    parentProfileImageUrl: resolveMediaUrl(readString(row, [
      "parent_profile_image_url",
      "parentProfileImageUrl",
    ])),
    specialistName: readString(row, ["specialist_name", "specialistName"]),
    specialistProfileImageUrl: resolveMediaUrl(readString(row, [
      "specialist_profile_image_url",
      "specialistProfileImageUrl",
    ])),
    caseRequestId: readString(row, ["case_request_id", "caseRequestId"]),
    caseRequestChildName: readString(row, [
      "case_request_child_name",
      "caseRequestChildName",
      "child_name",
      "childName",
    ]),
    createdAt: readString(row, ["created_at", "createdAt"]),
    lastMessageContent: readString(row, ["last_message_content", "lastMessageContent"]),
    lastMessageAt: readString(row, ["last_message_at", "lastMessageAt"]),
    lastMessageHasAttachments: Boolean(
      row?.last_message_has_attachments ?? row?.lastMessageHasAttachments,
    ),
    unreadCount: readUnreadCount(row?.unread_count ?? row?.unreadCount),
    subtitleContext: resolveSpecialistConversationSubtitle(row),
  };
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
