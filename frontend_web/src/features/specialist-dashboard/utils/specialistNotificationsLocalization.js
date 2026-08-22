import { formatAppDate } from "../../../i18n/formatters.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

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

const NOTIFICATION_TYPE_KEY = {
  exercise_reminder: "specialist.notifications.type.exerciseReminder",
  session_reminder: "specialist.notifications.type.sessionReminder",
  session_updated: "specialist.notifications.type.sessionUpdated",
  session_cancelled: "specialist.notifications.type.sessionCancelled",
  feedback_received: "specialist.notifications.type.feedbackReceived",
  report_ready: "specialist.notifications.type.reportReady",
  new_message: "specialist.notifications.type.newMessage",
  general: "specialist.notifications.type.general",
  session_request: "specialist.notifications.type.sessionRequest",
  case_request_submitted: "specialist.notifications.type.caseRequestSubmitted",
  case_request_assigned: "specialist.notifications.type.caseRequestAssigned",
  case_request_accepted: "specialist.notifications.type.caseRequestAccepted",
  case_request_rejected: "specialist.notifications.type.caseRequestRejected",
  case_request_converted: "specialist.notifications.type.caseRequestConverted",
  support_request_submitted: "specialist.notifications.type.supportRequestSubmitted",
  support_request_reply: "specialist.notifications.type.supportRequestReply",
  support_request_status_changed: "specialist.notifications.type.supportRequestStatusChanged",
};

const NOTIFICATION_TYPE_FALLBACK = {
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
  support_request_submitted: "Support request submitted",
  support_request_reply: "Support request reply",
  support_request_status_changed: "Support request status changed",
};

const SYSTEM_ATTACHMENT_BODY_KEYS = {
  "Sent an image": "specialist.notifications.systemText.sentImage",
  "Sent an audio recording": "specialist.notifications.systemText.sentAudio",
  "Sent a PDF file": "specialist.notifications.systemText.sentPdf",
  "Sent a video": "specialist.notifications.systemText.sentVideo",
  "Sent a file": "specialist.notifications.systemText.sentFile",
};

const NEW_MESSAGE_FROM_TITLE_PATTERN = /^New message from (.+)$/i;

function normalizeNotificationType(type) {
  return typeof type === "string" ? type.trim().toLowerCase().replace(/-/g, "_") : "";
}

export function getNotificationTypeLabel(type, t = null) {
  const normalized = normalizeNotificationType(type);
  const key = NOTIFICATION_TYPE_KEY[normalized];
  if (key) {
    return translateKey(t, key, NOTIFICATION_TYPE_FALLBACK[normalized]);
  }

  if (!normalized) {
    return translateKey(t, "specialist.notifications.type.update", "Update");
  }

  return type;
}

export function formatNotificationDisplayDate(dateValue, locale = "en", t = null) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return translateKey(t, "auth.shared.emptyDisplay", "—");
  }

  return formatAppDate(date, locale) ?? translateKey(t, "auth.shared.emptyDisplay", "—");
}

export function formatNotificationTimeAgo(dateValue, locale = "en", t = null) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return translateKey(t, "specialist.notifications.time.justNow", "Just now");
  }

  if (diffMins < 60) {
    return translateKey(t, "specialist.notifications.time.minutesAgo", "{count}m ago", { count: diffMins });
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return translateKey(t, "specialist.notifications.time.hoursAgo", "{count}h ago", { count: diffHours });
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return translateKey(t, "common.yesterday", "Yesterday");
  }

  if (diffDays < 7) {
    return translateKey(t, "specialist.notifications.time.daysAgo", "{count}d ago", { count: diffDays });
  }

  return formatNotificationDisplayDate(date, locale, t);
}

export function getDefaultNotificationTitle(t = null) {
  return translateKey(t, "specialist.notifications.defaultTitle", "Notification");
}

export function getRecentlyLabel(t = null) {
  return translateKey(t, "specialist.notifications.time.recently", "Recently");
}

export function localizeNotificationTitle(title, type, t = null) {
  const rawTitle = typeof title === "string" ? title.trim() : "";
  if (!rawTitle) {
    return getDefaultNotificationTitle(t);
  }

  const normalizedType = normalizeNotificationType(type);
  if (normalizedType === "new_message") {
    const match = rawTitle.match(NEW_MESSAGE_FROM_TITLE_PATTERN);
    if (match) {
      const senderName = match[1]?.trim() || "";
      return translateKey(
        t,
        "specialist.notifications.systemText.newMessageFrom",
        "New message from {name}",
        { name: senderName },
      );
    }
  }

  return rawTitle;
}

export function localizeNotificationBody(body, t = null) {
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

export function applySpecialistNotificationLocalization(notification, context = {}) {
  if (!notification) {
    return notification;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);
  const rawTitle = notification.title;
  const rawBody = notification.body;

  return {
    ...notification,
    type: notification.type,
    title: localizeNotificationTitle(rawTitle, notification.type, t),
    titleRaw: rawTitle,
    body: localizeNotificationBody(rawBody, t),
    bodyRaw: rawBody,
    typeLabel: getNotificationTypeLabel(notification.type, t),
    displayDate: formatNotificationDisplayDate(notification.createdAt, locale, t),
    timeAgo: formatNotificationTimeAgo(notification.createdAt, locale, t) || getRecentlyLabel(t),
  };
}

export function applySpecialistNotificationsLocalization(notifications, context = {}) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.map((item) => applySpecialistNotificationLocalization(item, context));
}

export function getSpecialistNotificationsPageLabels(t = null) {
  return {
    title: translateKey(t, "specialist.notifications.title", "Notifications"),
    subtitle: translateKey(
      t,
      "specialist.notifications.subtitle",
      "Stay updated on your patients and clinical activity",
    ),
    loading: translateKey(t, "specialist.notifications.loading", "Loading notifications..."),
    empty: translateKey(t, "specialist.notifications.empty.none", "No notifications yet."),
    markAllRead: translateKey(t, "specialist.notifications.markAllRead", "Mark all as read"),
    refresh: translateKey(t, "parent.common.refresh", "Refresh"),
    backToDashboard: translateKey(t, "specialist.messages.backToDashboard", "Back to Dashboard"),
    retry: translateKey(t, "common.retry", "Retry"),
    markAllReadFailed: translateKey(
      t,
      "specialist.notifications.markAllReadFailed",
      "Unable to mark all notifications as read.",
    ),
    markReadFailed: translateKey(
      t,
      "specialist.notifications.markReadFailed",
      "Unable to mark notification as read.",
    ),
    unread: translateKey(t, "specialist.notifications.unread", "Unread"),
    unreadNotification: (title) => translateKey(
      t,
      "specialist.notifications.unreadNotification",
      "Unread notification: {title}",
      { title },
    ),
    notification: (title) => translateKey(
      t,
      "specialist.notifications.notification",
      "Notification: {title}",
      { title },
    ),
  };
}

export function getSpecialistNotificationsErrorMessages(t = null) {
  return {
    loadFailed: translateKey(
      t,
      "specialist.notifications.errors.loadFailed",
      "Failed to load notifications.",
    ),
  };
}
