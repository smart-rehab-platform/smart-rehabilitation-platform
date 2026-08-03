import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../services/parentDashboardService";
import {
  countUnreadMessageNotifications,
  countUnreadNotifications,
  mapNotificationsToViewModels,
} from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const EMPTY_NOTIFICATION_STATE = {
  notifications: [],
  unreadCount: 0,
  messageUnreadCount: 0,
  isLoadingNotifications: false,
  notificationsError: null,
  isMarkingAllRead: false,
};

export function useParentNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;

    let cancelled = false;

    async function loadNotifications() {
      setIsLoadingNotifications(true);
      setNotificationsError(null);
      setNotifications([]);

      try {
        const rows = await getNotifications(userId);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setNotifications(mapNotificationsToViewModels(rows));
      } catch (error) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setNotifications([]);
        setNotificationsError(
          resolveErrorMessage(error, "Failed to load notifications."),
        );
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoadingNotifications(false);
        }
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [userId, refreshToken]);

  const unreadCount = useMemo(
    () => (notificationsError ? 0 : countUnreadNotifications(notifications)),
    [notifications, notificationsError],
  );

  const messageUnreadCount = useMemo(
    () => (notificationsError ? 0 : countUnreadMessageNotifications(notifications)),
    [notifications, notificationsError],
  );

  const markNotificationRead = useCallback(async (notificationId) => {
    if (!notificationId) {
      return;
    }

    let markedNotification = null;

    setNotifications((current) => current.map((item) => {
      if (item.id !== notificationId || !item.unread) {
        return item;
      }

      markedNotification = item;
      return { ...item, unread: false };
    }));

    if (!markedNotification) {
      return;
    }

    try {
      await markNotificationAsRead(notificationId);
    } catch {
      setNotifications((current) => current.map((item) => (
        item.id === notificationId
          ? { ...item, unread: true }
          : item
      )));
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const hasUnread = notifications.some((item) => item.unread);
    if (!hasUnread) {
      return;
    }

    setIsMarkingAllRead(true);

    setNotifications((current) => current.map((item) => (
      item.unread ? { ...item, unread: false } : item
    )));

    try {
      await markAllNotificationsAsRead();
    } catch {
      refetch();
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [notifications, refetch]);

  if (!userId) {
    return {
      ...EMPTY_NOTIFICATION_STATE,
      markNotificationRead,
      markAllNotificationsRead,
      refetch,
    };
  }

  return {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    isMarkingAllRead,
    markNotificationRead,
    markAllNotificationsRead,
    refetch,
  };
}
