import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  getChildren,
  getChildrenProgress,
} from "../../services/parentDashboardService";
import { PARENT_WEB_ROUTES } from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { NotificationCard } from "./components/notifications/NotificationCard";
import { NotificationFilters } from "./components/notifications/NotificationFilters";
import { NotificationEmptyState } from "./components/notifications/NotificationEmptyState";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth, mergeChildren, resolveNotificationRoute } from "./utils/parentDashboardMappers";
import {
  NOTIFICATION_EMPTY_MESSAGES,
  buildNotificationTypeFilterOptions,
  enrichNotificationsForHub,
  filterNotifications,
  sortNotifications,
} from "./utils/parentNotificationsUtils";
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
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const initialChildId = searchParams.get("childId")?.trim() || "all";

  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [childFilter, setChildFilter] = useState(initialChildId);
  const [sortKey, setSortKey] = useState("newest");
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
    selectedChildId: childFilter !== "all" ? childFilter : null,
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
    () => enrichNotificationsForHub(notifications, childNameByPatientId),
    [notifications, childNameByPatientId],
  );

  const notificationTypeOptions = useMemo(
    () => buildNotificationTypeFilterOptions(hubNotifications),
    [hubNotifications],
  );

  const filteredNotifications = useMemo(
    () => filterNotifications(hubNotifications, {
      search,
      readState: readFilter,
      notificationType: typeFilter,
      childId: childFilter,
    }),
    [hubNotifications, search, readFilter, typeFilter, childFilter],
  );

  const visibleNotifications = useMemo(
    () => sortNotifications(filteredNotifications, sortKey),
    [filteredNotifications, sortKey],
  );

  const emptyMessage = useMemo(() => {
    if (hubNotifications.length === 0) {
      return NOTIFICATION_EMPTY_MESSAGES.none;
    }

    if (visibleNotifications.length === 0) {
      return NOTIFICATION_EMPTY_MESSAGES.filtered;
    }

    return null;
  }, [hubNotifications.length, visibleNotifications.length]);

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
      state: childFilter !== "all" ? { selectedChildId: childFilter } : undefined,
    });
  }, [navigate, childFilter]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleNotificationSelect = useCallback(async (notification) => {
    if (notification?.unread) {
      await markNotificationRead(notification.id);
    }

    const route = resolveNotificationRoute(notification);
    if (route) {
      navigate(route);
    }
  }, [markNotificationRead, navigate]);

  const renderContent = () => {
    if (isLoadingNotifications) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading notifications...</p>
        </section>
      );
    }

    if (notificationsError) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{notificationsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            Retry
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
          {visibleNotifications.length} notification{visibleNotifications.length === 1 ? "" : "s"}
          {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
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
        navItems={parentDashboardMock.navItems}
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
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-ghost pd-back-btn" onClick={handleBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Dashboard
            </button>
            <div className="pd-notification-hub-toolbar-actions">
              <button
                type="button"
                className="pd-btn pd-btn-soft pd-btn-sm"
                onClick={handleRefresh}
                disabled={isLoadingNotifications}
              >
                Refresh
              </button>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="pd-btn pd-btn-primary pd-btn-sm"
                  onClick={markAllNotificationsRead}
                  disabled={isMarkingAllRead || isLoadingNotifications}
                >
                  Mark all as read
                </button>
              ) : null}
            </div>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">Notifications</h1>
            <p className="pd-task-hub-subtitle">
              Stay updated on sessions, reports, feedback, and messages.
              {!isLoadingNotifications && !notificationsError ? (
                ` ${unreadCount} unread of ${hubNotifications.length} notification${hubNotifications.length === 1 ? "" : "s"}.`
              ) : ""}
            </p>
          </header>

          {!isLoadingNotifications && !notificationsError && hubNotifications.length > 0 ? (
            <NotificationFilters
              search={search}
              onSearchChange={setSearch}
              readState={readFilter}
              onReadStateChange={setReadFilter}
              notificationType={typeFilter}
              onNotificationTypeChange={setTypeFilter}
              childId={childFilter}
              onChildChange={setChildFilter}
              sortKey={sortKey}
              onSortChange={setSortKey}
              children={children}
              notificationTypeOptions={notificationTypeOptions}
            />
          ) : null}

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
