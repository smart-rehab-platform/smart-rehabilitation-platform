function readString(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

function readDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (value == null || value === "") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isNotificationRead(row) {
  return row?.is_read === true || row?.isRead === true;
}

/**
 * Formats a notification timestamp as Flutter Admin does: d/M/yyyy (local).
 */
export function formatAdminNotificationDate(value) {
  const date = readDate(value);
  if (!date) {
    return "Recently";
  }

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/**
 * Flutter Admin meta line: "{type} • {d/M/yyyy}"
 */
export function formatAdminNotificationMeta(notification) {
  const type = readString(notification?.type) || "Update";
  const dateLabel = formatAdminNotificationDate(
    notification?.createdAt ?? notification?.created_at,
  );

  return `${type} • ${dateLabel}`;
}

export function mapAdminNotification(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row.id ?? row._id);
  if (!id) {
    return null;
  }

  return {
    id,
    userId: readString(row.user_id ?? row.userId),
    type: readString(row.type ?? row.category),
    title: readString(row.title ?? row.subject) || "Notification",
    body: readString(row.body ?? row.message),
    isRead: isNotificationRead(row),
    relatedEntityType: readString(row.related_entity_type ?? row.relatedEntityType),
    relatedEntityId: readString(row.related_entity_id ?? row.relatedEntityId),
    createdAt: readDate(row.created_at ?? row.createdAt),
  };
}

export function mapAdminNotifications(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  // Preserve backend order (newest-first). Do not re-sort.
  return rows.map(mapAdminNotification).filter(Boolean);
}

/**
 * Maps Admin notification view models into the compact header-popover shape.
 * Preserves backend/hook order (newest-first). Does not re-sort.
 * Expects notifications to already include localized title/body/metaLabel when available.
 */
export function mapAdminNotificationsForPopover(notifications) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body || null,
    timeAgo: item.metaLabel ?? item.timeAgo ?? "",
    icon: "notifications",
    tone: item.isRead ? "gray" : "blue",
    unread: !item.isRead,
    relatedEntityType: item.relatedEntityType,
    relatedEntityId: item.relatedEntityId,
    type: item.type,
  }));
}

/**
 * Resolves an admin notification to an in-app route when one exists.
 * @param {object|null|undefined} notification
 * @param {{ buildSupportRequestDetailPath?: (id: string) => string, buildComplaintDetailPath?: (id: string) => string }} builders
 */
export function resolveAdminNotificationRoute(notification, builders = {}) {
  if (!notification?.relatedEntityId) {
    return null;
  }

  const entityType = notification.relatedEntityType?.trim().toLowerCase();

  if (entityType === "support_request" && typeof builders.buildSupportRequestDetailPath === "function") {
    return builders.buildSupportRequestDetailPath(notification.relatedEntityId);
  }

  if (entityType === "complaint" && typeof builders.buildComplaintDetailPath === "function") {
    return builders.buildComplaintDetailPath(notification.relatedEntityId);
  }

  return null;
}
