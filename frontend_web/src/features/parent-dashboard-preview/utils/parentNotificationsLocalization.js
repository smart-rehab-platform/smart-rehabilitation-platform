import {
  formatParentWeekdayDate,
  formatTimeAgo,
  translateKey,
} from "./parentLocalizationCore.js";

export const NOTIFICATION_TYPE_VALUES = [
  "exercise_reminder",
  "session_reminder",
  "session_updated",
  "session_cancelled",
  "feedback_received",
  "report_ready",
  "new_message",
  "general",
  "session_request",
  "case_request_submitted",
  "case_request_assigned",
  "case_request_accepted",
  "case_request_rejected",
  "case_request_converted",
];

export const NOTIFICATION_READ_FILTER_VALUES = ["all", "unread", "read"];
export const NOTIFICATION_SORT_VALUES = ["newest", "oldest", "unreadFirst"];

const NOTIFICATION_TYPE_KEY_BY_VALUE = {
  exercise_reminder: "parent.notifications.type.exerciseReminder",
  session_reminder: "parent.notifications.type.sessionReminder",
  session_updated: "parent.notifications.type.sessionUpdated",
  session_cancelled: "parent.notifications.type.sessionCancelled",
  feedback_received: "parent.notifications.type.feedbackReceived",
  report_ready: "parent.notifications.type.reportReady",
  new_message: "parent.notifications.type.newMessage",
  general: "parent.notifications.type.general",
  session_request: "parent.notifications.type.sessionRequest",
  case_request_submitted: "parent.notifications.type.caseRequestSubmitted",
  case_request_assigned: "parent.notifications.type.caseRequestAssigned",
  case_request_accepted: "parent.notifications.type.caseRequestAccepted",
  case_request_rejected: "parent.notifications.type.caseRequestRejected",
  case_request_converted: "parent.notifications.type.caseRequestConverted",
};

const EN_NOTIFICATION_TYPE = {
  exercise_reminder: "Exercise reminder",
  session_reminder: "Session reminder",
  session_updated: "Session updated",
  session_cancelled: "Session cancelled",
  feedback_received: "Feedback received",
  report_ready: "Report ready",
  new_message: "New message",
  general: "General",
  session_request: "Session request",
  case_request_submitted: "Case request submitted",
  case_request_assigned: "Case request assigned",
  case_request_accepted: "Case request accepted",
  case_request_rejected: "Case request rejected",
  case_request_converted: "Case request converted",
};

export function getNotificationTypeLabel(type, t = null) {
  const normalized = typeof type === "string" ? type.trim().toLowerCase().replace(/-/g, "_") : "";
  if (!normalized || normalized === "default") {
    return null;
  }

  const key = NOTIFICATION_TYPE_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_NOTIFICATION_TYPE[normalized]);
  }

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildNotificationReadFilterOptions(t) {
  return [
    { id: "all", label: translateKey(t, "parent.common.filters.all", "All") },
    { id: "unread", label: translateKey(t, "parent.common.filters.unread", "Unread") },
    { id: "read", label: translateKey(t, "parent.common.filters.read", "Read") },
  ];
}

export function buildNotificationSortOptions(t) {
  return [
    { id: "newest", label: translateKey(t, "parent.common.sort.newest", "Newest first") },
    { id: "oldest", label: translateKey(t, "parent.common.sort.oldest", "Oldest first") },
    { id: "unreadFirst", label: translateKey(t, "parent.notifications.sort.unreadFirst", "Unread first") },
  ];
}

export function buildNotificationTypeFilterOptions(notifications, t) {
  const typeSet = new Set();

  notifications.forEach((notification) => {
    if (notification.type) {
      typeSet.add(notification.type);
    }
  });

  const options = [{ id: "all", label: translateKey(t, "parent.common.filters.allTypes", "All types") }];
  [...typeSet]
    .sort((left, right) => (
      getNotificationTypeLabel(left, t).localeCompare(getNotificationTypeLabel(right, t))
    ))
    .forEach((type) => {
      options.push({ id: type, label: getNotificationTypeLabel(type, t) });
    });

  return options;
}

export function formatNotificationDisplayDate(value, locale = "en", t = null) {
  return formatParentWeekdayDate(value, locale, t);
}

export function formatNotificationTimeAgo(value, locale = "en", t = null) {
  return formatTimeAgo(value, locale, t);
}

export function getDefaultNotificationTitle(t) {
  return translateKey(t, "parent.notifications.defaultTitle", "Notification");
}

export function getRecentlyLabel(t) {
  return translateKey(t, "parent.common.recently", "Recently");
}

export function getNotificationEmptyMessages(t) {
  return {
    none: translateKey(t, "parent.notifications.empty.none", "No notifications yet."),
    filtered: translateKey(t, "parent.notifications.empty.filtered", "No notifications match your filters."),
  };
}

const SYSTEM_ATTACHMENT_BODY_KEYS = {
  "Sent an image": "parent.notifications.systemText.sentImage",
  "Sent an audio recording": "parent.notifications.systemText.sentAudio",
  "Sent a PDF file": "parent.notifications.systemText.sentPdf",
  "Sent a video": "parent.notifications.systemText.sentVideo",
  "Sent a file": "parent.notifications.systemText.sentFile",
};

const NEW_MESSAGE_FROM_TITLE_PATTERN = /^New message from (.+)$/i;

function normalizeNotificationTypeValue(type) {
  return typeof type === "string" ? type.trim().toLowerCase().replace(/-/g, "_") : "";
}

/**
 * Localizes known system-generated notification titles. Preserves arbitrary backend text.
 */
export function localizeNotificationTitle(title, type, t = null) {
  const rawTitle = typeof title === "string" ? title.trim() : "";
  if (!rawTitle) {
    return getDefaultNotificationTitle(t);
  }

  const normalizedType = normalizeNotificationTypeValue(type);
  if (normalizedType === "new_message") {
    const match = rawTitle.match(NEW_MESSAGE_FROM_TITLE_PATTERN);
    if (match) {
      const senderName = match[1]?.trim() || "";
      if (senderName.toLowerCase() === "a participant") {
        return translateKey(
          t,
          "parent.notifications.systemText.newMessageFromParticipant",
          "New message from a participant",
        );
      }

      return translateKey(
        t,
        "parent.notifications.systemText.newMessageFrom",
        "New message from {name}",
        { name: senderName },
      );
    }
  }

  return rawTitle;
}

/**
 * Localizes known system-generated attachment preview bodies. Preserves user-authored text.
 */
export function localizeNotificationBody(body, type, t = null) {
  const rawBody = typeof body === "string" ? body.trim() : "";
  if (!rawBody) {
    return rawBody;
  }

  const translationKey = SYSTEM_ATTACHMENT_BODY_KEYS[rawBody];
  if (translationKey) {
    return translateKey(t, translationKey, rawBody);
  }

  return rawBody;
}

/** @deprecated Use getNotificationTypeLabel(type, t) via buildNotificationTypeFilterOptions */
export const NOTIFICATION_TYPE_LABELS = Object.fromEntries(
  NOTIFICATION_TYPE_VALUES.map((value) => [value, getNotificationTypeLabel(value, null)]),
);

/** @deprecated Use buildNotificationReadFilterOptions(t) */
export const NOTIFICATION_READ_FILTER_OPTIONS = buildNotificationReadFilterOptions(null);

/** @deprecated Use buildNotificationSortOptions(t) */
export const NOTIFICATION_SORT_OPTIONS = buildNotificationSortOptions(null);

/** @deprecated Use getNotificationEmptyMessages(t) */
export const NOTIFICATION_EMPTY_MESSAGES = getNotificationEmptyMessages(null);
