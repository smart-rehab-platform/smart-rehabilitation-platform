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

  if (caseChild && !patientId) {
    return translateKey(t, "parent.messages.regardingChild", "Regarding {name}", { name: caseChild });
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

/** @deprecated Use getMessagesEmptyMessage(t) */
export const MESSAGES_EMPTY_MESSAGE = getMessagesEmptyMessage(null);

/** @deprecated Use getMessagesChatEmpty(t) */
export const MESSAGES_CHAT_EMPTY = getMessagesChatEmpty(null);
