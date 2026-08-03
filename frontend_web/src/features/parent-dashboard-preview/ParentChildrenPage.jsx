import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  PARENT_WEB_ROUTES,
  buildParentChildDetailPath,
} from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { useParentChildren } from "./hooks/useParentChildren";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  CHILDREN_EMPTY_MESSAGE,
  buildChildMetaLine,
} from "./utils/parentChildrenUtils";
import { UserProfileAvatar } from "./components/profile/UserProfileAvatar";
import "./styles/parentDashboardTokens.css";

export default function ParentChildrenPage() {
  const navigate = useNavigate();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const { children, isLoading, error, refetch } = useParentChildren(parentUserId);
  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(parentUserId);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigation = useParentDashboardNavigation({
    selectedChildId: children[0]?.id ?? null,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

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
    navigate(PARENT_WEB_ROUTES.dashboard);
  }, [navigate]);

  const handleOpenChild = useCallback((childId) => {
    const path = buildParentChildDetailPath(childId);
    if (path) {
      navigate(path);
    }
  }, [navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">Loading linked children...</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            Retry
          </button>
        </section>
      );
    }

    if (children.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>{CHILDREN_EMPTY_MESSAGE}</p>
        </section>
      );
    }

    return (
      <div className="pd-task-hub-list">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            className="pd-card pd-card-pad pd-child-list-card"
            onClick={() => handleOpenChild(child.id)}
          >
            <div className="pd-child-list-row">
              <UserProfileAvatar
                imageUrl={child.profileImageUrl}
                initials={child.initials}
                alt=""
                shellClassName="pd-avatar pd-child-list-avatar"
                fallbackClassName="pd-avatar pd-child-list-avatar"
                className="pd-avatar-photo"
              />
              <div className="pd-child-list-copy">
                <strong>{child.fullName}</strong>
                {buildChildMetaLine(child) ? (
                  <span>{buildChildMetaLine(child)}</span>
                ) : null}
                {child.progressPercent != null ? (
                  <span className="pd-child-list-progress">
                    Progress: {Math.round(child.progressPercent)}%
                  </span>
                ) : null}
              </div>
              <ArrowRight size={16} className="pd-child-list-chevron" aria-hidden="true" />
            </div>
          </button>
        ))}
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
            <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back to Dashboard
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">My Children</h1>
            <p className="pd-task-hub-subtitle">
              Linked child profiles connected to your parent account.
            </p>
          </header>

          <div className="pd-task-hub-panel">{renderContent()}</div>
        </div>
      </ParentDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
