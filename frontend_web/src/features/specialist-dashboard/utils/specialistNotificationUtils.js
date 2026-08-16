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

function readTimestampValue(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (value == null || value === "") {
      continue;
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

const NOTIFICATION_TIMESTAMP_KEYS = ["created_at", "createdAt"];

function isNotificationRead(notification) {
  return notification?.is_read === true || notification?.isRead === true;
}

export function normalizeSpecialistNotificationType(type) {
  if (!type || typeof type !== "string") {
    return "";
  }

  return type.trim().toLowerCase().replace(/-/g, "_");
}

export function formatSpecialistNotificationTypeLabel(type) {
  if (typeof type === "string" && type.trim()) {
    return type.trim();
  }

  return "Update";
}

export function formatSpecialistNotificationDate(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatNotificationTimeAgo(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Just now";
  }

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return formatSpecialistNotificationDate(dateValue);
}

export function mapSpecialistNotificationTypeToPopoverUi(type) {
  const normalized = normalizeSpecialistNotificationType(type);

  if (normalized === "new_message") {
    return { icon: "message", tone: "blue" };
  }

  if (
    normalized.includes("support_request")
    || normalized === "support_request_submitted"
    || normalized === "support_request_reply"
    || normalized === "support_request_status_changed"
  ) {
    return { icon: "message", tone: "blue" };
  }

  if (normalized.includes("session") || normalized.includes("case_request")) {
    return { icon: "calendar", tone: "green" };
  }

  if (normalized.includes("report")) {
    return { icon: "report", tone: "purple" };
  }

  if (
    normalized.includes("review")
    || normalized.includes("feedback")
    || normalized.includes("exercise")
  ) {
    return { icon: "message", tone: "blue" };
  }

  if (normalized === "general") {
    return { icon: "message", tone: "gray" };
  }

  return { icon: "message", tone: "gray" };
}

export function sortSpecialistNotificationsNewestFirst(notifications) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return [...notifications].sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export function buildSpecialistNotificationViewModel(notificationRow) {
  const id = readString(notificationRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const type = readString(notificationRow, ["type", "category"]);
  const createdAt = readTimestampValue(notificationRow, NOTIFICATION_TIMESTAMP_KEYS);
  const { icon, tone } = mapSpecialistNotificationTypeToPopoverUi(type);

  return {
    id,
    title: readString(notificationRow, ["title", "subject"]) || "Notification",
    body: readString(notificationRow, ["body", "message"]),
    type,
    typeLabel: formatSpecialistNotificationTypeLabel(type),
    displayDate: formatSpecialistNotificationDate(createdAt),
    timeAgo: formatNotificationTimeAgo(createdAt) || "Recently",
    unread: !isNotificationRead(notificationRow),
    tone,
    icon,
    relatedEntityType: readString(notificationRow, [
      "related_entity_type",
      "relatedEntityType",
    ]),
    relatedEntityId: readString(notificationRow, [
      "related_entity_id",
      "relatedEntityId",
    ]),
    createdAt,
  };
}

export function mapSpecialistNotificationsToViewModels(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return sortSpecialistNotificationsNewestFirst(
    rows
      .map((row) => buildSpecialistNotificationViewModel(row))
      .filter(Boolean),
  );
}

export function mapSpecialistNotificationRow(row) {
  return buildSpecialistNotificationViewModel(row);
}

export function mapSpecialistNotifications(rows) {
  return mapSpecialistNotificationsToViewModels(rows);
}

export function countUnreadNotifications(notifications) {
  if (!Array.isArray(notifications)) {
    return 0;
  }

  return notifications.filter((item) => item.unread).length;
}

export function countUnreadMessageNotifications(notifications) {
  if (!Array.isArray(notifications)) {
    return 0;
  }

  return notifications.filter(
    (item) => item.unread && normalizeSpecialistNotificationType(item.type) === "new_message",
  ).length;
}

export function getConversationMessageNotifications(notifications, conversationId) {
  if (!conversationId || !Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter((item) => (
    item.unread
    && normalizeSpecialistNotificationType(item.type) === "new_message"
    && item.relatedEntityType?.trim().toLowerCase() === "conversation"
    && item.relatedEntityId === conversationId
  ));
}

export function mapSpecialistNotificationsForPopover(notifications) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return sortSpecialistNotificationsNewestFirst(notifications).map((item) => ({
    id: item.id,
    title: item.title,
    timeAgo: item.timeAgo,
    icon: item.icon,
    tone: item.tone,
    unread: item.unread,
    relatedEntityType: item.relatedEntityType,
    relatedEntityId: item.relatedEntityId,
    type: item.type,
  }));
}

/**
 * Resolves a specialist notification to an in-app route when one exists.
 * @param {object|null|undefined} notification
 * @param {{ buildSupportRequestDetailPath?: (id: string) => string, buildMessagesPath?: (id: string) => string }} builders
 */
export function resolveSpecialistNotificationRoute(notification, builders = {}) {
  if (!notification?.relatedEntityId) {
    return null;
  }

  const entityType = notification.relatedEntityType?.trim().toLowerCase();
  const type = normalizeSpecialistNotificationType(notification.type);

  if (entityType === "support_request" && typeof builders.buildSupportRequestDetailPath === "function") {
    return builders.buildSupportRequestDetailPath(notification.relatedEntityId);
  }

  if (
    entityType === "conversation"
    && type === "new_message"
    && typeof builders.buildMessagesPath === "function"
  ) {
    return builders.buildMessagesPath(notification.relatedEntityId);
  }

  return null;
}
