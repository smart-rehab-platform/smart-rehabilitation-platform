import api from "./api";

function extractData(response) {
  const payload = response?.data;

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload ?? null;
}

function extractList(response) {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
}

function throwServiceError(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    throw new Error(apiMessage.trim());
  }

  if (error instanceof Error && error.message) {
    throw error;
  }

  throw new Error(fallbackMessage);
}

function requireId(value, label) {
  const id = typeof value === "string" ? value.trim() : "";

  if (!id) {
    throw new Error(`${label} is required.`);
  }

  return id;
}

export async function loadAdminNotifications(userId) {
  const id = requireId(userId, "User id");

  try {
    const response = await api.get(`/users/${encodeURIComponent(id)}/notifications`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load notifications.");
  }
}

export async function loadAdminUnreadNotifications(userId) {
  const id = requireId(userId, "User id");

  try {
    const response = await api.get(`/users/${encodeURIComponent(id)}/notifications/unread`);
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to load unread notifications.");
  }
}

export async function markAdminNotificationRead(notificationId) {
  const id = requireId(notificationId, "Notification id");

  try {
    const response = await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
    return extractData(response);
  } catch (error) {
    throwServiceError(error, "Failed to mark notification as read.");
  }
}

export async function markAllAdminNotificationsRead() {
  try {
    const response = await api.patch("/notifications/read-all");
    return extractList(response);
  } catch (error) {
    throwServiceError(error, "Failed to mark all notifications as read.");
  }
}
