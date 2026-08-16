import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import { PARENT_WEB_ROUTES } from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { ReviewCard } from "./components/feedback/ReviewCard";
import { ReviewEmptyState } from "./components/feedback/ReviewEmptyState";
import { ReviewFilters } from "./components/feedback/ReviewFilters";
import { useParentFeedback } from "./hooks/useParentFeedback";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  filterFeedbackReviews,
  getFeedbackEmptyMessages,
  sortFeedbackReviews,
} from "./utils/parentFeedbackUtils";
import "./styles/parentDashboardTokens.css";

export default function ParentFeedbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;
  const notificationUserId = parentUserId;

  const initialChildId = searchParams.get("childId")?.trim() || "all";

  const [search, setSearch] = useState("");
  const [childFilter, setChildFilter] = useState(initialChildId);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("newest");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    children,
    reviews,
    isLoading,
    error,
    refetch,
  } = useParentFeedback(parentUserId);

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(notificationUserId);

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

  const filteredReviews = useMemo(
    () => filterFeedbackReviews(reviews, {
      search,
      childId: childFilter,
      status: statusFilter,
    }),
    [reviews, search, childFilter, statusFilter],
  );

  const visibleReviews = useMemo(
    () => sortFeedbackReviews(filteredReviews, sortKey),
    [filteredReviews, sortKey],
  );

  const emptyMessages = useMemo(() => getFeedbackEmptyMessages(t), [t]);

  const emptyMessage = useMemo(() => {
    if (reviews.length === 0) {
      return emptyMessages.none;
    }

    if (visibleReviews.length === 0) {
      return emptyMessages.filtered;
    }

    return null;
  }, [reviews.length, visibleReviews.length, emptyMessages]);

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.pages.feedback.loading")}</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (emptyMessage) {
      return <ReviewEmptyState message={emptyMessage} />;
    }

    return (
      <div className="pd-task-hub-list">
        {visibleReviews.map((review) => (
          <ReviewCard key={`${review.patientId}-${review.id}`} review={review} />
        ))}
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
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("parent.common.backToDashboard")}
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{t("parent.pages.feedback.title")}</h1>
            <p className="pd-task-hub-subtitle">
              {t("parent.pages.feedback.subtitle")}
            </p>
          </header>

          <ReviewFilters
            search={search}
            onSearchChange={setSearch}
            childId={childFilter}
            onChildChange={setChildFilter}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            sortKey={sortKey}
            onSortChange={setSortKey}
            children={children}
          />

          <div className="pd-task-hub-panel">
            {renderContent()}
          </div>
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
