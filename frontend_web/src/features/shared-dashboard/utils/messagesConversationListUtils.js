import { formatAppDate } from "../../../i18n/formatters.js";

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }

  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }

  return fallback;
}

export function resolveConversationPatientDisplayName(conversation) {
  if (!conversation || typeof conversation !== "object") {
    return null;
  }

  const context = conversation.subtitleContext;
  if (context?.name) {
    return context.name;
  }

  if (conversation.patientName) {
    return conversation.patientName;
  }

  if (conversation.caseRequestChildName && !conversation.patientId) {
    return conversation.caseRequestChildName;
  }

  return null;
}

export function formatConversationActivityTime(
  activityAt,
  locale = "en",
  t = null,
  now = new Date(),
) {
  if (!activityAt) {
    return "";
  }

  const date = activityAt instanceof Date ? activityAt : new Date(activityAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (dayDiff === 0) {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  if (dayDiff === 1) {
    return translateKey(t, "common.yesterday", "Yesterday");
  }

  const formatted = formatAppDate(date, locale);
  return formatted || translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function resolveConversationLastMessagePreview(
  conversation,
  { t = null, localizeContent = (content) => content } = {},
) {
  const content = typeof conversation?.lastMessageContent === "string"
    ? conversation.lastMessageContent.trim()
    : "";

  if (content) {
    return localizeContent(content, t);
  }

  if (conversation?.lastMessageHasAttachments) {
    return translateKey(t, "common.messages.attachment", "Attachment");
  }

  return "";
}

export function readUnreadCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
}
