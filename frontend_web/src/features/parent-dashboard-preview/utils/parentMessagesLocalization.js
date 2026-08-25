import { formatParentDateTime, translateKey } from "./parentLocalizationCore.js";

export function formatMessageTime(sentAt, locale = "en", t = null) {
  if (!sentAt) {
    return "";
  }

  const formatted = formatParentDateTime(sentAt, locale, t);
  return formatted ?? translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function getDefaultSpecialistLabel(t) {
  return translateKey(t, "parent.common.specialist", "Specialist");
}

export function resolveConversationTitle(row, t = null) {
  const specialistName = row?.specialistName ?? row?.specialist_name ?? row?.specialistName;
  if (typeof specialistName === "string" && specialistName.trim()) {
    return specialistName.trim();
  }

  return getDefaultSpecialistLabel(t);
}

export function resolveConversationSubtitle(row, t = null) {
  const caseChild = row?.caseRequestChildName ?? row?.case_request_child_name ?? row?.childName ?? row?.child_name;
  const patientId = row?.patientId ?? row?.patient_id;
  const patientName = row?.patientName ?? row?.patient_name;

  if (caseChild) {
    return translateKey(t, "parent.messages.patientLabel", "Patient: {name}", { name: caseChild });
  }

  if (patientName) {
    return translateKey(t, "parent.messages.patientLabel", "Patient: {name}", { name: patientName });
  }

  return null;
}

export function getMessagesEmptyMessage(t) {
  return translateKey(t, "parent.messages.empty.conversations", "No conversations yet.");
}

export function getMessagesChatEmpty(t) {
  return translateKey(t, "parent.messages.empty.chat", "No messages yet. Start the conversation below.");
}

const SYSTEM_MESSAGE_BODY_KEYS = {
  "Sent an image": "parent.notifications.systemText.sentImage",
  "Sent an audio recording": "parent.notifications.systemText.sentAudio",
  "Sent a PDF file": "parent.notifications.systemText.sentPdf",
  "Sent a video": "parent.notifications.systemText.sentVideo",
  "Sent a file": "parent.notifications.systemText.sentFile",
};

export function localizeParentMessageContent(content, t = null) {
  const rawContent = typeof content === "string" ? content.trim() : "";
  if (!rawContent) {
    return rawContent;
  }

  const translationKey = SYSTEM_MESSAGE_BODY_KEYS[rawContent];
  if (translationKey) {
    return translateKey(t, translationKey, rawContent);
  }

  return content;
}

/** @deprecated Use getMessagesEmptyMessage(t) */
export const MESSAGES_EMPTY_MESSAGE = getMessagesEmptyMessage(null);

/** @deprecated Use getMessagesChatEmpty(t) */
export const MESSAGES_CHAT_EMPTY = getMessagesChatEmpty(null);
