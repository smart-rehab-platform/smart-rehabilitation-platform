import {
  buildNotificationViewModel,
  getNotificationTimestamp,
} from "./parentDashboardMappers";
import { resolveMapperContext } from "./parentLocalizationCore";
import {
  buildNotificationReadFilterOptions,
  buildNotificationSortOptions,
  buildNotificationTypeFilterOptions,
  formatNotificationDisplayDate,
  formatNotificationTimeAgo,
  getDefaultNotificationTitle,
  getNotificationEmptyMessages,
  getNotificationTypeLabel,
  getRecentlyLabel,
  localizeNotificationBody,
  localizeNotificationTitle,
  NOTIFICATION_EMPTY_MESSAGES,
  NOTIFICATION_READ_FILTER_OPTIONS,
  NOTIFICATION_SORT_OPTIONS,
  NOTIFICATION_TYPE_LABELS,
} from "./parentNotificationsLocalization";

export {
  buildNotificationReadFilterOptions,
  buildNotificationSortOptions,
  buildNotificationTypeFilterOptions,
  getNotificationTypeLabel,
  NOTIFICATION_EMPTY_MESSAGES,
  NOTIFICATION_READ_FILTER_OPTIONS,
  NOTIFICATION_SORT_OPTIONS,
  NOTIFICATION_TYPE_LABELS,
};

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
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function mapNotificationRowToHubItem(notificationRow, childNameByPatientId = null, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const base = buildNotificationViewModel(notificationRow, options);
  if (!base) {
    return null;
  }

  const timestampValue = base.createdAt;
  const parsedMs = timestampValue ? Date.parse(timestampValue) : Number.NaN;
  const patientId = resolveNotificationPatientId(base, childNameByPatientId);

  return {
    ...base,
    typeLabel: getNotificationTypeLabel(base.type, t),
    displayDate: formatNotificationDisplayDate(timestampValue, locale, t),
    createdAtMs: Number.isFinite(parsedMs) ? parsedMs : null,
    patientId,
    childName: patientId ? childNameByPatientId?.[patientId] ?? null : null,
  };
}

/**
 * @param {Array<Record<string, unknown>>} notificationRows
 * @param {Record<string, string>|null|undefined} childNameByPatientId
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function mapNotificationRowsToHubItems(notificationRows, childNameByPatientId = null, options = {}) {
  if (!Array.isArray(notificationRows)) {
    return [];
  }

  return notificationRows
    .map((row) => mapNotificationRowToHubItem(row, childNameByPatientId, options))
    .filter(Boolean);
}

/**
 * @param {Array<{ type?: string|null }>} notifications
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function buildNotificationTypeFilterOptionsLocalized(notifications, options = {}) {
  const { t } = resolveMapperContext(options);
  return buildNotificationTypeFilterOptions(notifications, t);
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
 * @param {{ t?: Function, locale?: string }} [options]
 */
export function enrichNotificationsForHub(notifications, childNameByPatientId = null, options = {}) {
  const { t, locale } = resolveMapperContext(options);

  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.map((notification) => {
    const timestampValue = notification.createdAt ?? getNotificationTimestamp(notification);
    const parsedMs = timestampValue ? Date.parse(timestampValue) : Number.NaN;
    const patientId = resolveNotificationPatientId(notification, childNameByPatientId);

    return {
      ...notification,
      typeLabel: getNotificationTypeLabel(notification.type, t),
      displayDate: formatNotificationDisplayDate(timestampValue, locale, t),
      timeAgo: formatNotificationTimeAgo(timestampValue, locale, t) ?? getRecentlyLabel(t),
      title: localizeNotificationTitle(notification.title, notification.type, t)
        || getDefaultNotificationTitle(t),
      body: localizeNotificationBody(notification.body, notification.type, t),
      createdAtMs: Number.isFinite(parsedMs) ? parsedMs : null,
      patientId,
      childName: patientId ? childNameByPatientId?.[patientId] ?? null : null,
    };
  });
}

export { getNotificationEmptyMessages };
