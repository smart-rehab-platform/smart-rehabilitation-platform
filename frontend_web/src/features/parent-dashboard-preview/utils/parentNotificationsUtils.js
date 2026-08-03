import {
  buildNotificationViewModel,
  getNotificationTimestamp,
  normalizeNotificationType,
} from "./parentDashboardMappers";

/** Confirmed backend notification_type enum values. */
export const NOTIFICATION_TYPE_LABELS = {
  exercise_reminder: "Exercise reminder",
  session_reminder: "Session reminder",
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

export const NOTIFICATION_READ_FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

export const NOTIFICATION_SORT_OPTIONS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "unreadFirst", label: "Unread first" },
];

export const NOTIFICATION_EMPTY_MESSAGES = {
  none: "No notifications yet.",
  filtered: "No notifications match your filters.",
};

function formatDisplayDate(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * @param {string|null|undefined} type
 */
export function getNotificationTypeLabel(type) {
  const normalized = normalizeNotificationType(type);
  if (normalized === "default") {
    return null;
  }

  if (NOTIFICATION_TYPE_LABELS[normalized]) {
    return NOTIFICATION_TYPE_LABELS[normalized];
  }

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * @param {{ relatedEntityType?: string|null, relatedEntityId?: string|null, title?: string|null, body?: string|null }} notification
 * @param {Record<string, string>|null|undefined} childNameByPatientId
 */
export function resolveNotificationPatientId(notification, childNameByPatientId = null) {
  const entityType = notification.relatedEntityType?.trim().toLowerCase();
  if (entityType === "patient" && notification.relatedEntityId) {
    return notification.relatedEntityId;
  }

  if (!childNameByPatientId) {
    return null;
  }

  const haystack = `${notification.title || ""} ${notification.body || ""}`.toLowerCase();
  const entries = Object.entries(childNameByPatientId)
    .filter(([, name]) => name)
    .sort(([, leftName], [, rightName]) => rightName.length - leftName.length);

  const match = entries.find(([, name]) => haystack.includes(name.toLowerCase()));
  return match?.[0] ?? null;
}

/**
 * @param {Record<string, unknown>} notificationRow
 * @param {Record<string, string>|null|undefined} childNameByPatientId
 */
export function mapNotificationRowToHubItem(notificationRow, childNameByPatientId = null) {
  const base = buildNotificationViewModel(notificationRow);
  if (!base) {
    return null;
  }

  const timestampValue = base.createdAt;
  const parsedMs = timestampValue ? Date.parse(timestampValue) : Number.NaN;
  const patientId = resolveNotificationPatientId(base, childNameByPatientId);

  return {
    ...base,
    typeLabel: getNotificationTypeLabel(base.type),
    displayDate: formatDisplayDate(timestampValue),
    createdAtMs: Number.isFinite(parsedMs) ? parsedMs : null,
    patientId,
    childName: patientId ? childNameByPatientId?.[patientId] ?? null : null,
  };
}

/**
 * @param {Array<Record<string, unknown>>} notificationRows
 * @param {Record<string, string>|null|undefined} childNameByPatientId
 */
export function mapNotificationRowsToHubItems(notificationRows, childNameByPatientId = null) {
  if (!Array.isArray(notificationRows)) {
    return [];
  }

  return notificationRows
    .map((row) => mapNotificationRowToHubItem(row, childNameByPatientId))
    .filter(Boolean);
}

/**
 * @param {Array<{ type?: string|null }>} notifications
 */
export function buildNotificationTypeFilterOptions(notifications) {
  const typeSet = new Set();

  notifications.forEach((notification) => {
    if (notification.type) {
      typeSet.add(notification.type);
    }
  });

  const options = [{ id: "all", label: "All types" }];
  [...typeSet]
    .sort((left, right) => (
      getNotificationTypeLabel(left).localeCompare(getNotificationTypeLabel(right))
    ))
    .forEach((type) => {
      options.push({ id: type, label: getNotificationTypeLabel(type) });
    });

  return options;
}

/**
 * @param {Array<Record<string, unknown>>} notifications
 * @param {{ search?: string, readState?: string, notificationType?: string, childId?: string }} filters
 */
export function filterNotifications(notifications, filters) {
  const search = filters.search?.trim().toLowerCase() || "";
  const readState = filters.readState || "all";
  const notificationType = filters.notificationType || "all";
  const childId = filters.childId || "all";

  return notifications.filter((notification) => {
    if (readState === "unread" && !notification.unread) {
      return false;
    }

    if (readState === "read" && notification.unread) {
      return false;
    }

    if (notificationType !== "all" && notification.type !== notificationType) {
      return false;
    }

    if (childId !== "all") {
      if (!notification.patientId || notification.patientId !== childId) {
        return false;
      }
    }

    if (!search) {
      return true;
    }

    const haystack = [
      notification.title,
      notification.body,
      notification.childName,
      notification.typeLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

/**
 * @param {Array<Record<string, unknown>>} notifications
 * @param {string} sortKey
 */
export function sortNotifications(notifications, sortKey) {
  const copy = [...notifications];

  if (sortKey === "oldest") {
    return copy.sort((left, right) => compareByDate(left, right, "asc"));
  }

  if (sortKey === "unreadFirst") {
    return copy.sort((left, right) => {
      const leftUnread = left.unread ? 0 : 1;
      const rightUnread = right.unread ? 0 : 1;
      if (leftUnread !== rightUnread) {
        return leftUnread - rightUnread;
      }

      return compareByDate(left, right, "desc");
    });
  }

  return copy.sort((left, right) => compareByDate(left, right, "desc"));
}

function compareByDate(left, right, direction) {
  const leftMs = left.createdAtMs ?? (direction === "desc" ? -1 : Number.MAX_SAFE_INTEGER);
  const rightMs = right.createdAtMs ?? (direction === "desc" ? -1 : Number.MAX_SAFE_INTEGER);

  if (leftMs !== rightMs) {
    return direction === "desc" ? rightMs - leftMs : leftMs - rightMs;
  }

  return String(left.title || "").localeCompare(String(right.title || ""));
}

/**
 * Maps hub notifications from existing view models.
 * @param {Array<Record<string, unknown>>} notifications
 * @param {Record<string, string>|null|undefined} childNameByPatientId
 */
export function enrichNotificationsForHub(notifications, childNameByPatientId = null) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.map((notification) => {
    const timestampValue = notification.createdAt ?? getNotificationTimestamp(notification);
    const parsedMs = timestampValue ? Date.parse(timestampValue) : Number.NaN;
    const patientId = resolveNotificationPatientId(notification, childNameByPatientId);

    return {
      ...notification,
      typeLabel: getNotificationTypeLabel(notification.type),
      displayDate: formatDisplayDate(timestampValue),
      createdAtMs: Number.isFinite(parsedMs) ? parsedMs : null,
      patientId,
      childName: patientId ? childNameByPatientId?.[patientId] ?? null : null,
    };
  });
}
