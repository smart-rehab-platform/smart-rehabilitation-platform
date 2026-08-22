import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { useLocale } from "../../../context/useLocale.js";
import {
  loadAdminNotifications,
  loadAdminUnreadNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "../../../services/adminNotificationsService";
import {
  applyAdminNotificationsLocalization,
  getAdminNotificationsLabels,
} from "../utils/adminNotificationsLocalization.js";
import { mapAdminNotifications } from "../utils/adminNotificationsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const DESKTOP_NOTIFICATION_POLL_MS = 30_000;

export function useAdminNotifications() {
  const { user, isInitializing } = useAuth();
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminNotificationsLabels(t), [t]);
  const adminUserId = isInitializing ? null : user?.id ?? null;

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingNotificationId, setUpdatingNotificationId] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadTokenRef = useRef(0);
  const markAllInFlightRef = useRef(false);
  const markingIdsRef = useRef(new Set());

  const unreadCount = useMemo(
    () => unreadNotifications.length,
    [unreadNotifications],
  );

  const localizedNotifications = useMemo(
    () => applyAdminNotificationsLocalization(notifications, mapperContext),
    [notifications, mapperContext],
  );

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!adminUserId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refresh();
    }, DESKTOP_NOTIFICATION_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [adminUserId, refresh]);

  useEffect(() => {
    if (!adminUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadNotifications() {
      setIsLoading(true);
      setError(null);
      setMutationError(null);

      try {
        const [listRows, unreadRows] = await Promise.all([
          loadAdminNotifications(adminUserId),
          loadAdminUnreadNotifications(adminUserId),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mappedNotifications = mapAdminNotifications(listRows);
        setNotifications(mappedNotifications);
        setUnreadNotifications(mapAdminNotifications(unreadRows));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setNotifications([]);
        setUnreadNotifications([]);
        setError(resolveErrorMessage(loadError, labels.loadFailed));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [adminUserId, labels.loadFailed, refreshToken]);

  const markAsRead = useCallback(async (notificationId) => {
    const id = typeof notificationId === "string" ? notificationId.trim() : "";
    if (!id) {
      return false;
    }

    const target = notifications.find((item) => item.id === id);
    if (target?.isRead) {
      return true;
    }

    if (markingIdsRef.current.has(id) || markAllInFlightRef.current) {
      return false;
    }

    markingIdsRef.current.add(id);
    setUpdatingNotificationId(id);
    setIsUpdating(true);
    setMutationError(null);

    try {
      await markAdminNotificationRead(id);

      setNotifications((current) => current.map((item) => (
        item.id === id
          ? { ...item, isRead: true }
          : item
      )));
      setUnreadNotifications((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (markError) {
      setMutationError(
        resolveErrorMessage(markError, labels.markReadFailed),
      );
      return false;
    } finally {
      markingIdsRef.current.delete(id);
      setUpdatingNotificationId((current) => (current === id ? null : current));
      setIsUpdating(markingIdsRef.current.size > 0 || markAllInFlightRef.current);
    }
  }, [labels.markReadFailed, notifications]);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) {
      return true;
    }

    if (markAllInFlightRef.current || markingIdsRef.current.size > 0) {
      return false;
    }

    markAllInFlightRef.current = true;
    setIsUpdating(true);
    setMutationError(null);

    try {
      await markAllAdminNotificationsRead();

      setNotifications((current) => current.map((item) => (
        item.isRead ? item : { ...item, isRead: true }
      )));
      setUnreadNotifications([]);
      return true;
    } catch (markError) {
      setMutationError(
        resolveErrorMessage(markError, labels.markAllReadFailed),
      );
      return false;
    } finally {
      markAllInFlightRef.current = false;
      setIsUpdating(markingIdsRef.current.size > 0);
    }
  }, [labels.markAllReadFailed, unreadCount]);

  if (!adminUserId) {
    return {
      notifications: [],
      unreadNotifications: [],
      unreadCount: 0,
      isLoading: isInitializing,
      error: isInitializing ? null : labels.signedOut,
      mutationError: null,
      isUpdating: false,
      updatingNotificationId: null,
      labels,
      refresh,
      markAsRead,
      markAllAsRead,
    };
  }

  return {
    notifications: localizedNotifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    error,
    mutationError,
    isUpdating,
    updatingNotificationId,
    labels,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
