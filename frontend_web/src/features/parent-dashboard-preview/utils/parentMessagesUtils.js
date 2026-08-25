import { API_BASE_URL } from "../../../services/apiConfig";
import { readString } from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  formatConversationActivityTime,
  readUnreadCount,
  resolveConversationLastMessagePreview,
  resolveConversationPatientDisplayName,
} from "../../shared-dashboard/utils/messagesConversationListUtils.js";
import {
  formatMessageTime,
  getDefaultSpecialistLabel,
  getMessagesChatEmpty,
  getMessagesEmptyMessage,
  localizeParentMessageContent,
  resolveConversationSubtitle,
  resolveConversationTitle,
} from "./parentMessagesLocalization";

export {
  formatMessageTime,
  getMessagesChatEmpty,
  getMessagesEmptyMessage,
};

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

export function mapConversation(row, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const id = readString(row, ["id", "_id"]);
  const patientId = readString(row, ["patient_id", "patientId"]);
  const caseRequestChildName = readString(row, [
    "case_request_child_name",
    "caseRequestChildName",
    "child_name",
    "childName",
  ]);

  const normalizedRow = {
    ...row,
    specialistName: readString(row, ["specialist_name", "specialistName"]),
    patientName: readString(row, ["patient_name", "patientName"]),
    patientId,
    caseRequestChildName,
    childName: caseRequestChildName,
  };

  return {
    id,
    patientId,
    parentId: readString(row, ["parent_id", "parentId"]),
    specialistId: readString(row, ["specialist_id", "specialistId"]),
    patientName: normalizedRow.patientName,
    parentName: readString(row, ["parent_name", "parentName"]),
    parentProfileImageUrl: resolveMediaUrl(readString(row, [
      "parent_profile_image_url",
      "parentProfileImageUrl",
    ])),
    specialistName: normalizedRow.specialistName,
    specialistProfileImageUrl: resolveMediaUrl(readString(row, [
      "specialist_profile_image_url",
      "specialistProfileImageUrl",
    ])),
    caseRequestId: readString(row, ["case_request_id", "caseRequestId"]),
    caseRequestChildName,
    createdAt: readString(row, ["created_at", "createdAt"]),
    lastMessageContent: readString(row, ["last_message_content", "lastMessageContent"]),
    lastMessageAt: readString(row, ["last_message_at", "lastMessageAt"]),
    lastMessageHasAttachments: Boolean(
      row?.last_message_has_attachments ?? row?.lastMessageHasAttachments,
    ),
    unreadCount: readUnreadCount(row?.unread_count ?? row?.unreadCount),
    title: resolveConversationTitle(normalizedRow, t) || getDefaultSpecialistLabel(t),
    subtitle: resolveConversationSubtitle(normalizedRow, t),
    patientDisplayName: resolveConversationPatientDisplayName({
      ...normalizedRow,
      subtitleContext: caseRequestChildName && !patientId
        ? { kind: "regardingChild", name: caseRequestChildName }
        : normalizedRow.patientName
          ? { kind: "patient", name: normalizedRow.patientName }
          : null,
    }),
    activityTimeLabel: formatConversationActivityTime(
      readString(row, ["last_message_at", "lastMessageAt"])
        || readString(row, ["created_at", "createdAt"]),
      locale,
      t,
    ),
    previewLabel: resolveConversationLastMessagePreview(
      {
        lastMessageContent: readString(row, ["last_message_content", "lastMessageContent"]),
        lastMessageHasAttachments: Boolean(
          row?.last_message_has_attachments ?? row?.lastMessageHasAttachments,
        ),
      },
      { t, localizeContent: localizeParentMessageContent },
    ),
  };
}

export function mapConversations(rows, options = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => mapConversation(row, options)).filter((conversation) => conversation.id);
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
