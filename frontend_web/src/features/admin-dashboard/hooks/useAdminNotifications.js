import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import {
  loadAdminNotifications,
  loadAdminUnreadNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "../../../services/adminNotificationsService";
import { mapAdminNotifications } from "../utils/adminNotificationsMappers";

const SIGNED_OUT_ERROR = "Please sign in to view notifications.";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminNotifications() {
  const { user, isInitializing } = useAuth();
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

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

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

        setNotifications(mapAdminNotifications(listRows));
        setUnreadNotifications(mapAdminNotifications(unreadRows));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setNotifications([]);
        setUnreadNotifications([]);
        setError(resolveErrorMessage(loadError, "Failed to load notifications."));
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
  }, [adminUserId, refreshToken]);

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
        resolveErrorMessage(markError, "Failed to mark notification as read."),
      );
      return false;
    } finally {
      markingIdsRef.current.delete(id);
      setUpdatingNotificationId((current) => (current === id ? null : current));
      setIsUpdating(markingIdsRef.current.size > 0 || markAllInFlightRef.current);
    }
  }, [notifications]);

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
        resolveErrorMessage(markError, "Failed to mark all notifications as read."),
      );
      return false;
    } finally {
      markAllInFlightRef.current = false;
      setIsUpdating(markingIdsRef.current.size > 0);
    }
  }, [unreadCount]);

  if (!adminUserId) {
    return {
      notifications: [],
      unreadNotifications: [],
      unreadCount: 0,
      isLoading: isInitializing,
      error: isInitializing ? null : SIGNED_OUT_ERROR,
      mutationError: null,
      isUpdating: false,
      updatingNotificationId: null,
      refresh,
      markAsRead,
      markAllAsRead,
    };
  }

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    error,
    mutationError,
    isUpdating,
    updatingNotificationId,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
