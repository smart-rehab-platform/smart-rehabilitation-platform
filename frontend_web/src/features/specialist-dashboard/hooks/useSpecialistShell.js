import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import {
  SPECIALIST_NAV_UNAVAILABLE,
  SPECIALIST_SIDEBAR_NAV_ROUTE_KEYS,
  SPECIALIST_WEB_ROUTES,
  getSpecialistRoutePath,
} from "../../../routes/specialistDashboardRoutes";
import { SPECIALIST_NAV_ITEMS } from "../constants/specialistNavigation";
import { useSpecialistNotifications } from "./useSpecialistNotifications";
import { mapSpecialistFromAuth } from "../utils/specialistDashboardUtils";
import { mapSpecialistNotificationsForPopover } from "../utils/specialistNotificationUtils";

export function useSpecialistShell(specialistUserId = null) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const specialist = useMemo(() => mapSpecialistFromAuth(user), [user]);

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    isMarkingAllRead,
    markNotificationRead,
    markAllNotificationsRead,
    refetch: refetchNotifications,
    markConversationNotificationsRead,
  } = useSpecialistNotifications(specialistUserId);

  const popoverNotifications = useMemo(
    () => mapSpecialistNotificationsForPopover(notifications),
    [notifications],
  );

  const badges = useMemo(() => ({
    notifications:
      !notificationsError && !isLoadingNotifications && unreadCount > 0
        ? unreadCount
        : null,
    messages: messageUnreadCount > 0 ? messageUnreadCount : null,
  }), [
    notificationsError,
    isLoadingNotifications,
    unreadCount,
    messageUnreadCount,
  ]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigateToRouteKey = useCallback((routeKey) => {
    const path = getSpecialistRoutePath(routeKey);
    if (path) {
      navigate(path);
      return true;
    }

    return false;
  }, [navigate]);

  const showUnavailableToast = useCallback((routeKey) => {
    const unavailableKey = routeKey && routeKey in SPECIALIST_NAV_UNAVAILABLE
      ? routeKey
      : "generic";

    showToast(SPECIALIST_NAV_UNAVAILABLE[unavailableKey]);
  }, [showToast]);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      navigate(SPECIALIST_WEB_ROUTES.login, { replace: true });
    } catch {
      showToast("Unable to sign out. Please try again.");
    }
  }, [logout, navigate, showToast]);

  const handleViewProfile = useCallback(() => {
    showUnavailableToast("profile");
  }, [showUnavailableToast]);

  const handleMessages = useCallback(() => {
    navigateToRouteKey("messages");
  }, [navigateToRouteKey]);

  const handleViewAllNotifications = useCallback(() => {
    navigate(SPECIALIST_WEB_ROUTES.notifications);
  }, [navigate]);

  const handleNotificationSelect = useCallback(async (item) => {
    if (!item?.id) {
      return false;
    }

    return markNotificationRead(item.id);
  }, [markNotificationRead]);

  const handleSidebarNav = useCallback((navItemId) => {
    closeMobileNav();

    const routeKey = SPECIALIST_SIDEBAR_NAV_ROUTE_KEYS[navItemId];
    if (navigateToRouteKey(routeKey)) {
      return;
    }

    showUnavailableToast(routeKey);
  }, [closeMobileNav, navigateToRouteKey, showUnavailableToast]);

  return {
    specialist,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems: SPECIALIST_NAV_ITEMS,
    notifications: popoverNotifications,
    fullNotifications: notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    isMarkingAllRead,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    closeMobileNav,
    navigateToRouteKey,
    showUnavailableToast,
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
    markNotificationRead,
    markAllNotificationsRead,
    refetchNotifications,
    markConversationNotificationsRead,
  };
}
