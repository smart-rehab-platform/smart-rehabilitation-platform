import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  getChildren,
  getChildrenProgress,
} from "../../services/parentDashboardService";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { NotificationCard } from "./components/notifications/NotificationCard";
import { NotificationEmptyState } from "./components/notifications/NotificationEmptyState";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth, mergeChildren } from "./utils/parentDashboardMappers";
import { resolveParentNotificationDestination } from "./utils/parentNotificationNavigation";
import {
  enrichNotificationsForHub,
  getNotificationEmptyMessages,
  sortNotifications,
} from "./utils/parentNotificationsUtils";
import {
  isImplementedParentPath,
  PARENT_WEB_ROUTES,
} from "../../routes/parentDashboardRoutes";
import "./styles/parentDashboardTokens.css";

function buildChildNameLookup(children) {
  return Object.fromEntries(
    children
      .filter((child) => child?.id && child?.fullName)
      .map((child) => [child.id, child.fullName]),
  );
}

export default function ParentNotificationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, locale } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const initialChildId = searchParams.get("childId")?.trim() || "all";

  const [children, setChildren] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const childrenLoadRef = useRef(0);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    isMarkingAllRead,
    markNotificationRead,
    markAllNotificationsRead,
    refetch,
  } = useParentNotifications(parentUserId);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigation = useParentDashboardNavigation({
    selectedChildId: initialChildId !== "all" ? initialChildId : null,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    const loadToken = childrenLoadRef.current + 1;
    childrenLoadRef.current = loadToken;
    let cancelled = false;

    async function loadChildren() {
      try {
        const [childrenRows, progressRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
        ]);

        if (cancelled || childrenLoadRef.current !== loadToken) {
          return;
        }

        setChildren(mergeChildren(childrenRows, progressRows));
      } catch {
        if (!cancelled && childrenLoadRef.current === loadToken) {
          setChildren([]);
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [parentUserId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    document.body.classList.add("pd-preview-drawer-open");
    return () => document.body.classList.remove("pd-preview-drawer-open");
  }, [mobileNavOpen]);

  const childNameByPatientId = useMemo(
    () => buildChildNameLookup(children),
    [children],
  );

  const hubNotifications = useMemo(
    () => enrichNotificationsForHub(notifications, childNameByPatientId, { t, locale }),
    [notifications, childNameByPatientId, t, locale],
  );

  const visibleNotifications = useMemo(
    // No filter/search/sort controls on this page; keep the default chronological
    // ordering that matches the previous "Newest first" state.
    () => sortNotifications(hubNotifications, "newest"),
    [hubNotifications],
  );

  const emptyMessages = useMemo(() => getNotificationEmptyMessages(t), [t]);

  const emptyMessage = useMemo(() => {
    if (hubNotifications.length === 0) {
      return emptyMessages.none;
    }

    if (visibleNotifications.length === 0) {
      return emptyMessages.filtered;
    }

    return null;
  }, [hubNotifications.length, visibleNotifications.length, emptyMessages]);

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

  const handleBack = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.dashboard, {
      state: initialChildId !== "all" ? { selectedChildId: initialChildId } : undefined,
    });
  }, [navigate, initialChildId]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleNotificationSelect = useCallback(async (notification) => {
    if (notification?.unread) {
      await markNotificationRead(notification.id);
    }

    const route = resolveParentNotificationDestination(notification);
    if (route && isImplementedParentPath(route)) {
      navigate(route);
    }
  }, [markNotificationRead, navigate]);

  const subtitleSuffix = useMemo(() => {
    if (isLoadingNotifications || notificationsError) {
      return "";
    }

    const total = hubNotifications.length;
    const key = total === 1
      ? "parent.notificationsPage.subtitleUnread"
      : "parent.notificationsPage.subtitleUnreadPlural";

    return ` ${t(key, { unread: unreadCount, total })}`;
  }, [
    isLoadingNotifications,
    notificationsError,
    hubNotifications.length,
    unreadCount,
    t,
  ]);

  const summaryLabel = useMemo(() => {
    const count = visibleNotifications.length;
    const countLabel = count === 1
      ? t("parent.notificationsPage.summaryCount", { count })
      : t("parent.notificationsPage.summaryCountPlural", { count });

    if (unreadCount > 0) {
      return `${countLabel}${t("parent.notificationsPage.unreadSummary", { count: unreadCount })}`;
    }

    return countLabel;
  }, [visibleNotifications.length, unreadCount, t]);

  const renderContent = () => {
    if (isLoadingNotifications) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.pages.notifications.loading")}</p>
        </section>
      );
    }

    if (notificationsError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{notificationsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            {t("parent.common.retry")}
          </button>
        </section>
      );
    }

    if (emptyMessage) {
      return <NotificationEmptyState message={emptyMessage} />;
    }

    return (
      <div className="pd-notification-feed-panel pd-section-enter">
        <p className="pd-notification-feed-summary">
          {summaryLabel}
        </p>
        <ul className="pd-notification-feed">
          {visibleNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onSelect={handleNotificationSelect}
            />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="pd-preview">
      <ParentDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        badges={badges}
        parent={parent}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        onNotificationSelect={navigation.handleNotificationSelect}
        onViewAllNotifications={navigation.handleViewAllNotifications}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={navigation.handleSidebarNav}
        onSignOut={navigation.handleSignOut}
        onViewProfile={navigation.handleViewProfile}
        onMessages={navigation.handleMessages}
      >
        <div className="pd-task-hub-page">
          <div className="pd-task-hub-toolbar pd-notifications-page-toolbar">
            <button type="button" className="pd-btn pd-btn-ghost pd-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              {t("parent.common.backToDashboard")}
            </button>
            <div className="pd-notification-hub-toolbar-actions">
              <button
                type="button"
                className="pd-btn pd-btn-soft pd-btn-sm"
                onClick={handleRefresh}
                disabled={isLoadingNotifications}
              >
                {t("parent.common.refresh")}
              </button>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="pd-btn pd-btn-primary pd-btn-sm"
                  onClick={markAllNotificationsRead}
                  disabled={isMarkingAllRead || isLoadingNotifications}
                >
                  {t("parent.pages.notifications.markAllRead")}
                </button>
              ) : null}
            </div>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{t("parent.pages.notifications.title")}</h1>
            <p className="pd-task-hub-subtitle">
              {t("parent.pages.notifications.subtitle")}
              {subtitleSuffix}
            </p>
          </header>

          <div className="pd-task-hub-panel">{renderContent()}</div>
        </div>

        {toast ? (
          <div className="pd-toast" role="status" aria-live="polite">
            {toast}
          </div>
        ) : null}
      </ParentDashboardShell>
    </div>
  );
}
