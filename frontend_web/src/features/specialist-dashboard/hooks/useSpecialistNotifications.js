import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../services/parentDashboardService";
import {
  applySpecialistNotificationsLocalization,
  getSpecialistNotificationsErrorMessages,
} from "../utils/specialistNotificationsLocalization.js";
import {
  countUnreadMessageNotifications,
  countUnreadNotifications,
  getConversationMessageNotifications,
  mapSpecialistNotificationsToViewModels,
} from "../utils/specialistNotificationUtils";

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

export function useSpecialistNotifications(userId) {
  const { t, locale } = useLocale();
  const errorMessages = useMemo(() => getSpecialistNotificationsErrorMessages(t), [t]);
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
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

        setNotifications(
          applySpecialistNotificationsLocalization(
            mapSpecialistNotificationsToViewModels(rows),
            mapperContext,
          ),
        );
      } catch (error) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setNotifications([]);
        setNotificationsError(
          resolveErrorMessage(error, errorMessages.loadFailed),
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
  }, [userId, refreshToken, mapperContext, errorMessages.loadFailed]);

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
      return false;
    }

    let wasUnread = false;

    setNotifications((current) => current.map((item) => {
      if (item.id !== notificationId) {
        return item;
      }

      wasUnread = item.unread;
      return wasUnread ? { ...item, unread: false } : item;
    }));

    try {
      await markNotificationAsRead(notificationId);

      setNotifications((current) => current.map((item) => (
        item.id === notificationId
          ? { ...item, unread: false }
          : item
      )));

      return true;
    } catch {
      if (wasUnread) {
        setNotifications((current) => current.map((item) => (
          item.id === notificationId
            ? { ...item, unread: true }
            : item
        )));
      }

      return false;
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const hasUnread = notifications.some((item) => item.unread);
    if (!hasUnread) {
      return true;
    }

    setIsMarkingAllRead(true);

    const previousNotifications = notifications;

    setNotifications((current) => current.map((item) => (
      item.unread ? { ...item, unread: false } : item
    )));

    try {
      await markAllNotificationsAsRead();
      return true;
    } catch {
      setNotifications(previousNotifications);
      return false;
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [notifications]);

  const markConversationNotificationsRead = useCallback(async (conversationId) => {
    const matching = getConversationMessageNotifications(notifications, conversationId);
    if (matching.length === 0) {
      return;
    }

    setNotifications((current) => current.map((item) => (
      matching.some((match) => match.id === item.id)
        ? { ...item, unread: false }
        : item
    )));

    const results = await Promise.all(
      matching.map((item) => markNotificationAsRead(item.id).catch(() => false)),
    );

    if (results.some((result) => result === false)) {
      refetch();
    }
  }, [notifications, refetch]);

  if (!userId) {
    return {
      ...EMPTY_NOTIFICATION_STATE,
      markNotificationRead,
      markAllNotificationsRead,
      refetch,
      markConversationNotificationsRead,
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
    markConversationNotificationsRead,
  };
}
