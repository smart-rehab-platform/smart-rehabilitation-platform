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

export function getNotificationTitle(notification) {
  if (!notification || typeof notification !== "object") {
    return "Smart Rehabilitation";
  }

  const title = readString(notification.title ?? notification.subject ?? notification.type);
  if (title) {
    return title;
  }

  return "Smart Rehabilitation";
}

export function getNotificationBody(notification) {
  if (!notification || typeof notification !== "object") {
    return "";
  }

  return readString(notification.body ?? notification.message ?? "");
}

export function isUnreadWebNotification(notification) {
  if (!notification || typeof notification !== "object") {
    return false;
  }

  if (notification.unread === true) {
    return true;
  }

  if (notification.isRead === false || notification.is_read === false) {
    return true;
  }

  return false;
}

export function getWebDesktopNotificationIconUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return new URL("/branding/smart_rehab_icon.png", window.location.origin).toString();
  } catch {
    return "/branding/smart_rehab_icon.png";
  }
}

export function showWebDesktopNotification(notification, options = {}) {
  if (!supportsWebDesktopNotifications()) {
    return null;
  }

  if (window.Notification.permission !== "granted") {
    return null;
  }

  try {
    const id = getNotificationId(notification);
    const notificationTitle = getNotificationTitle(notification);
    const notificationBody = getNotificationBody(notification);
    const payload = new window.Notification(notificationTitle, {
      body: notificationBody || undefined,
      icon: getWebDesktopNotificationIconUrl() || undefined,
      tag: id || undefined,
    });

    if (typeof options.onClick === "function") {
      payload.onclick = () => {
        options.onClick(notification);
        window.focus();
        payload.close();
      };
    }

    if (typeof options.onClose === "function") {
      payload.onclose = () => options.onClose(notification);
    }

    return payload;
  } catch {
    return null;
  }
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

export function createWebDesktopNotificationTracker() {
  const seenIds = new Set();
  let initialized = false;

  return {
    track(notifications = []) {
      if (!Array.isArray(notifications)) {
        return [];
      }

      const currentIds = notifications
        .map((item) => getNotificationId(item))
        .filter(Boolean);

      if (!initialized) {
        for (const id of currentIds) {
          seenIds.add(id);
        }
        initialized = true;
        return [];
      }

      const newNotifications = notifications.filter((notification) => {
        const id = getNotificationId(notification);
        if (!id || seenIds.has(id)) {
          return false;
        }

        const shouldDisplay = isUnreadWebNotification(notification);
        if (!shouldDisplay) {
          seenIds.add(id);
          return false;
        }

        return true;
      });

      for (const notification of notifications) {
        const id = getNotificationId(notification);
        if (id) {
          seenIds.add(id);
        }
      }

      return newNotifications;
    },

    reset() {
      seenIds.clear();
      initialized = false;
    },
  };
}
