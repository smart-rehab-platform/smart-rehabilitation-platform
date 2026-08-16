import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useLocale } from "../../../context/useLocale.js";
import {
  ADMIN_SIDEBAR_NAV_ROUTE_KEYS,
  ADMIN_WEB_ROUTES,
  getAdminRoutePath,
} from "../../../routes/adminDashboardRoutes";
import {
  buildAdminNavItems,
  getAdminShellLabels,
} from "../utils/adminDashboardLocalization.js";
import { mapAdminFromAuth } from "../utils/adminDashboardUtils";

/**
 * Admin chrome/navigation shell state.
 * Notification data lives in AdminNotificationsProvider (single source of truth).
 */
export function useAdminShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const shellLabels = useMemo(() => getAdminShellLabels(t), [t]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const adminUser = useMemo(() => mapAdminFromAuth(user), [user]);

  // Sidebar badges stay unchanged (Phase 3 wires header bell only).
  const badges = useMemo(() => ({
    notifications: null,
  }), []);

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
    const path = getAdminRoutePath(routeKey);
    if (path) {
      navigate(path);
      return true;
    }

    return false;
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      navigate(ADMIN_WEB_ROUTES.login, { replace: true });
    } catch {
      showToast(shellLabels.signOutFailed);
    }
  }, [logout, navigate, showToast, shellLabels.signOutFailed]);

  const navItems = useMemo(() => buildAdminNavItems(t), [t]);

  const handleViewProfile = useCallback(() => {
    navigateToRouteKey("profile");
  }, [navigateToRouteKey]);

  const handleViewAllNotifications = useCallback(() => {
    setNotificationsOpen(false);
    navigate(ADMIN_WEB_ROUTES.notifications);
  }, [navigate]);

  const handleSidebarNav = useCallback((navItemId) => {
    closeMobileNav();

    const routeKey = ADMIN_SIDEBAR_NAV_ROUTE_KEYS[navItemId];
    navigateToRouteKey(routeKey);
  }, [closeMobileNav, navigateToRouteKey]);

  return {
    adminUser,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    closeMobileNav,
    navigateToRouteKey,
    handleSignOut,
    handleViewProfile,
    handleViewAllNotifications,
    handleSidebarNav,
  };
}
