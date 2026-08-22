import { resolveParentNotificationDestination } from "../../parent-dashboard-preview/utils/parentNotificationNavigation.js";
import { resolveSpecialistNotificationRoute } from "../../specialist-dashboard/utils/specialistNotificationUtils.js";
import { resolveAdminNotificationRoute } from "../../admin-dashboard/utils/adminNotificationsMappers.js";

function readString(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || "";
  }

  if (value == null) {
    return "";
  }

  const trimmed = String(value).trim();
  return trimmed || "";
}

export function supportsWebDesktopNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getWebDesktopNotificationPermission() {
  if (!supportsWebDesktopNotifications()) {
    return "unsupported";
  }

  return window.Notification.permission;
}

export async function requestWebDesktopNotificationPermission() {
  if (!supportsWebDesktopNotifications()) {
    return "unsupported";
  }

  if (window.Notification.permission === "granted") {
    return "granted";
  }

  if (window.Notification.permission === "denied") {
    return "denied";
  }

  const result = await window.Notification.requestPermission();
  return result;
}

export function getNotificationId(notification) {
  if (!notification || typeof notification !== "object") {
    return "";
  }

  const direct = readString(notification.id ?? notification._id);
  if (direct) {
    return direct;
  }

  return "";
}

export function openWebDesktopNotificationRoute(route) {
  if (!route || typeof window === "undefined") {
    return false;
  }

  const nextUrl = /^https?:\/\//i.test(route)
    ? route
    : new URL(route, window.location.origin).toString();

  try {
    window.focus();
    window.location.assign(nextUrl);
    return true;
  } catch {
    return false;
  }
}

export function resolveWebDesktopNotificationRoute(notification, role, builders = {}) {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "parent") {
    return resolveParentNotificationDestination(notification);
  }

  if (normalizedRole === "specialist") {
    return resolveSpecialistNotificationRoute(notification, builders.specialist ?? {});
  }

  if (normalizedRole === "admin") {
    return resolveAdminNotificationRoute(notification, builders.admin ?? {});
  }

  return null;
}
