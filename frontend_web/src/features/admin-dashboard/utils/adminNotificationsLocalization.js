import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";
import {
  formatNotificationDisplayDate,
  getDefaultNotificationTitle,
  getNotificationTypeLabel as getSharedNotificationTypeLabel,
  getRecentlyLabel,
  localizeNotificationBody as localizeSharedNotificationBody,
  localizeNotificationTitle as localizeSharedNotificationTitle,
} from "../../specialist-dashboard/utils/specialistNotificationsLocalization.js";

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

const ADMIN_NOTIFICATION_TYPE_KEY = {
  complaint_submitted: "admin.notifications.type.complaintSubmitted",
  specialist_warning_issued: "admin.notifications.type.specialistWarningIssued",
};

const ADMIN_NOTIFICATION_TYPE_FALLBACK = {
  complaint_submitted: "Complaint submitted",
  specialist_warning_issued: "Specialist warning issued",
};

const SYSTEM_TITLE_EXACT_KEYS = {
  "New specialist complaint submitted": "admin.notifications.systemText.titles.complaintSubmitted",
  "New case intake request": "admin.notifications.systemText.titles.caseRequestSubmitted",
  "Case request accepted": "admin.notifications.systemText.titles.caseRequestAccepted",
  "Case request rejected": "admin.notifications.systemText.titles.caseRequestRejected",
  "Case request converted to patient": "admin.notifications.systemText.titles.caseRequestConverted",
  "Patient created": "admin.notifications.systemText.titles.patientCreated",
  "Parent linked": "admin.notifications.systemText.titles.parentLinked",
  "Specialist assigned": "admin.notifications.systemText.titles.specialistAssigned",
  "User deleted": "admin.notifications.systemText.titles.userDeleted",
  "User activated": "admin.notifications.systemText.titles.userActivated",
  "User deactivated": "admin.notifications.systemText.titles.userDeactivated",
  "New specialist support request": "admin.notifications.systemText.titles.supportRequestSubmitted",
  "Specialist replied to a support request": "admin.notifications.systemText.titles.supportRequestReply",
  "Specialist warning threshold reached": "admin.notifications.systemText.titles.specialistWarningThreshold",
  "New user registered": "admin.notifications.systemText.titles.userRegistered",
  "Report generated": "admin.notifications.systemText.titles.reportGenerated",
  "Treatment plan created": "admin.notifications.systemText.titles.treatmentPlanCreated",
};

const SYSTEM_BODY_EXACT_KEYS = {
  "A parent submitted a specialist complaint for administration review.": "admin.notifications.systemText.bodies.complaintSubmitted",
  "A specialist accepted a preliminary case request.": "admin.notifications.systemText.bodies.caseRequestAccepted",
  "A specialist rejected a preliminary case request.": "admin.notifications.systemText.bodies.caseRequestRejected",
  "The specialist added an attachment to a support request.": "admin.notifications.systemText.bodies.supportRequestAttachment",
};

const SYSTEM_TITLE_PATTERNS = [];

const SYSTEM_BODY_PATTERNS = [
  {
    pattern: /^(.+) submitted a new preliminary case request\.$/,
    key: "admin.notifications.systemText.bodies.caseRequestSubmitted",
    fallback: "{name} submitted a new preliminary case request.",
    map: (match) => ({ name: match[1] }),
  },
  {
    pattern: /^(.+)'s preliminary case request was converted to an official patient profile\.$/,
    key: "admin.notifications.systemText.bodies.caseRequestConverted",
    fallback: "{name}'s preliminary case request was converted to an official patient profile.",
    map: (match) => ({ name: match[1] }),
  },
  {
    pattern: /^(.+) was added to the system\.$/,
    key: "admin.notifications.systemText.bodies.patientCreated",
    fallback: "{name} was added to the system.",
    map: (match) => ({ name: match[1] }),
  },
  {
    pattern: /^(.+) was linked to patient (.+)\.$/,
    key: "admin.notifications.systemText.bodies.parentLinked",
    fallback: "{parent} was linked to patient {patient}.",
    map: (match) => ({ parent: match[1], patient: match[2] }),
  },
  {
    pattern: /^(.+) was assigned to patient (.+)\.$/,
    key: "admin.notifications.systemText.bodies.specialistAssigned",
    fallback: "{specialist} was assigned to patient {patient}.",
    map: (match) => ({ specialist: match[1], patient: match[2] }),
  },
  {
    pattern: /^Treatment plan "(.+)" was created for patient (.+)\.$/,
    key: "admin.notifications.systemText.bodies.treatmentPlanCreated",
    fallback: "Treatment plan \"{planTitle}\" was created for patient {patient}.",
    map: (match) => ({ planTitle: match[1], patient: match[2] }),
  },
  {
    pattern: /^(.+) was activated\.$/,
    key: "admin.notifications.systemText.bodies.userActivated",
    fallback: "{name} was activated.",
    map: (match) => ({ name: match[1] }),
  },
  {
    pattern: /^(.+) was deactivated\.$/,
    key: "admin.notifications.systemText.bodies.userDeactivated",
    fallback: "{name} was deactivated.",
    map: (match) => ({ name: match[1] }),
  },
  {
    pattern: /^(.+) was deleted from the system\.$/,
    key: "admin.notifications.systemText.bodies.userDeleted",
    fallback: "{name} was deleted from the system.",
    map: (match) => ({ name: match[1] }),
  },
  {
    pattern: /^A specialist submitted a support request: (.+)$/,
    key: "admin.notifications.systemText.bodies.supportRequestSubmitted",
    fallback: "A specialist submitted a support request: {subject}",
    map: (match) => ({ subject: match[1] }),
  },
  {
    pattern: /^A specialist reached (\d+) confirmed complaints within (\d+) days\.$/,
    key: "admin.notifications.systemText.bodies.specialistWarningThreshold",
    fallback: "A specialist reached {count} confirmed complaints within {days} days.",
    map: (match) => ({ count: match[1], days: match[2] }),
  },
  {
    pattern: /^(.+) registered as (.+)\.$/,
    key: "admin.notifications.systemText.bodies.userRegistered",
    fallback: "{name} registered as {role}.",
    map: (match) => ({ name: match[1], role: match[2] }),
  },
  {
    pattern: /^Report "(.+)" was generated for patient (.+)\.$/,
    key: "admin.notifications.systemText.bodies.reportGenerated",
    fallback: "Report \"{reportTitle}\" was generated for patient {patient}.",
    map: (match) => ({ reportTitle: match[1], patient: match[2] }),
  },
];

function normalizeNotificationType(type) {
  return typeof type === "string" ? type.trim().toLowerCase().replace(/-/g, "_") : "";
}

export function getAdminNotificationTypeLabel(type, t = null) {
  const normalized = normalizeNotificationType(type);
  const adminKey = ADMIN_NOTIFICATION_TYPE_KEY[normalized];

  if (adminKey) {
    return translateKey(t, adminKey, ADMIN_NOTIFICATION_TYPE_FALLBACK[normalized]);
  }

  return getSharedNotificationTypeLabel(type, t);
}

function localizeExactOrPattern(value, exactMap, patterns, t) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return raw;
  }

  const exactKey = exactMap[raw];
  if (exactKey) {
    return translateKey(t, exactKey, raw);
  }

  for (const entry of patterns) {
    const match = raw.match(entry.pattern);
    if (match) {
      const params = entry.map(match);
      return translateKey(t, entry.key, entry.fallback, params);
    }
  }

  return raw;
}

export function localizeAdminNotificationTitle(title, type, t = null) {
  const rawTitle = typeof title === "string" ? title.trim() : "";
  if (!rawTitle) {
    return getDefaultNotificationTitle(t);
  }

  const shared = localizeSharedNotificationTitle(rawTitle, type, t);
  if (shared !== rawTitle) {
    return shared;
  }

  const localized = localizeExactOrPattern(
    rawTitle,
    SYSTEM_TITLE_EXACT_KEYS,
    SYSTEM_TITLE_PATTERNS,
    t,
  );

  if (localized !== rawTitle) {
    return localized;
  }

  return rawTitle;
}

export function localizeAdminNotificationBody(body, type, t = null) {
  const rawBody = typeof body === "string" ? body.trim() : "";
  if (!rawBody) {
    return rawBody;
  }

  const shared = localizeSharedNotificationBody(rawBody, t);
  if (shared !== rawBody) {
    return shared;
  }

  const localized = localizeExactOrPattern(
    rawBody,
    SYSTEM_BODY_EXACT_KEYS,
    SYSTEM_BODY_PATTERNS,
    t,
  );

  return localized;
}

export function formatAdminNotificationMetaLabel(notification, context = {}) {
  const { t, locale } = resolveAdminMapperContext(context);
  const typeLabel = getAdminNotificationTypeLabel(notification?.type, t);
  const dateLabel = formatNotificationDisplayDate(
    notification?.createdAt ?? notification?.created_at,
    locale,
    t,
  ) || getRecentlyLabel(t);

  return `${typeLabel} • ${dateLabel}`;
}

export function applyAdminNotificationLocalization(notification, context = {}) {
  if (!notification) {
    return notification;
  }

  const { t, locale } = resolveAdminMapperContext(context);
  const rawTitle = notification.title;
  const rawBody = notification.body;

  return {
    ...notification,
    type: notification.type,
    title: localizeAdminNotificationTitle(rawTitle, notification.type, t),
    titleRaw: rawTitle,
    body: localizeAdminNotificationBody(rawBody, notification.type, t),
    bodyRaw: rawBody,
    typeLabel: getAdminNotificationTypeLabel(notification.type, t),
    metaLabel: formatAdminNotificationMetaLabel(notification, { t, locale }),
    displayDate: formatNotificationDisplayDate(notification.createdAt, locale, t),
  };
}

export function applyAdminNotificationsLocalization(notifications, context = {}) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.map((item) => applyAdminNotificationLocalization(item, context));
}

export function getAdminNotificationsLabels(t = null) {
  return {
    title: translateKey(t, "admin.notifications.title", "Notifications"),
    toolbarAriaLabel: translateKey(t, "admin.notifications.toolbarAriaLabel", "Notifications header"),
    listAriaLabel: translateKey(t, "admin.notifications.listAriaLabel", "Notifications list"),
    listLoadingAriaLabel: translateKey(
      t,
      "admin.notifications.listLoadingAriaLabel",
      "Notifications loading",
    ),
    markAllRead: translateKey(t, "admin.notifications.markAllRead", "Mark all as read"),
    refresh: translateKey(t, "parent.common.refresh", "Refresh"),
    empty: translateKey(t, "admin.notifications.empty", "No notifications yet."),
    loading: translateKey(t, "admin.notifications.loading", "Loading notifications..."),
    retry: translateKey(t, "common.retry", "Retry"),
    markingAsRead: translateKey(t, "admin.notifications.markingAsRead", "Marking as read"),
    unreadNotification: (title) => translateKey(
      t,
      "admin.notifications.unreadNotification",
      "Unread notification: {title}. Mark as read.",
      { title },
    ),
    notification: (title) => translateKey(
      t,
      "admin.notifications.notification",
      "Notification: {title}",
      { title },
    ),
    loadFailed: translateKey(
      t,
      "admin.notifications.errors.loadFailed",
      "Failed to load notifications.",
    ),
    markReadFailed: translateKey(
      t,
      "admin.notifications.errors.markReadFailed",
      "Failed to mark notification as read.",
    ),
    markAllReadFailed: translateKey(
      t,
      "admin.notifications.errors.markAllReadFailed",
      "Failed to mark all notifications as read.",
    ),
    signedOut: translateKey(
      t,
      "admin.notifications.errors.signedOut",
      "Please sign in to view notifications.",
    ),
  };
}

export function getAdminNotificationsPopoverLabels(t = null) {
  const pageLabels = getAdminNotificationsLabels(t);

  return {
    ...pageLabels,
    triggerAria: (count) => translateKey(
      t,
      count > 0 ? "admin.notifications.popover.triggerWithUnread" : "admin.notifications.popover.trigger",
      count > 0 ? "Notifications, {count} unread" : "Notifications",
      { count },
    ),
    dialogAriaLabel: translateKey(
      t,
      "admin.notifications.popover.dialogAriaLabel",
      "Recent notifications",
    ),
    viewAll: translateKey(
      t,
      "admin.notifications.popover.viewAll",
      "View All Notifications",
    ),
  };
}

export const ADMIN_NOTIFICATION_TYPE_CODES = Object.freeze([
  ...Object.keys(ADMIN_NOTIFICATION_TYPE_KEY),
  "case_request_submitted",
  "case_request_accepted",
  "case_request_rejected",
  "case_request_converted",
  "support_request_submitted",
  "support_request_reply",
  "support_request_status_changed",
  "new_message",
  "general",
]);
