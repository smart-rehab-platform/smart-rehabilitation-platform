import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  PARENT_WEB_ROUTES,
  buildParentProgressPath,
  buildParentReportsPath,
  buildParentSessionsPath,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { ReviewCard } from "./components/feedback/ReviewCard";
import { useParentChildDetail } from "./hooks/useParentChildDetail";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  buildChildMetaLine,
  getChildNotFoundMessage,
} from "./utils/parentChildrenUtils";
import "./styles/parentDashboardTokens.css";

export default function ParentChildDetailPage() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { t, locale } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const {
    child,
    assignedExercises,
    reports,
    sessions,
    reviews,
    isLoading,
    error,
    notFound,
    refetch,
  } = useParentChildDetail(parentUserId, childId);

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
    selectedChildId: childId ?? null,
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
    navigate(PARENT_WEB_ROUTES.children);
  }, [navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.children.loadingDetails")}</p>
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

    if (notFound || !child) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>{getChildNotFoundMessage(t)}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
            {t("parent.children.backToChildren")}
          </button>
        </section>
      );
    }

    return (
      <div className="pd-child-detail-stack">
        <section className="pd-card pd-card-pad">
          <div className="pd-child-detail-header">
            {child.profileImageUrl ? (
              <img
                src={child.profileImageUrl}
                alt=""
                className="pd-avatar pd-avatar-photo pd-child-detail-avatar"
              />
            ) : (
              <span className="pd-avatar pd-child-detail-avatar" aria-hidden="true">
                {child.fullName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <h2 className="pd-section-title">{child.fullName}</h2>
              {buildChildMetaLine(child, { t, locale }) ? (
                <p className="pd-section-sub">{buildChildMetaLine(child, { t, locale })}</p>
              ) : null}
              {child.progressPercent != null ? (
                <p className="pd-child-list-progress">
                  {t("parent.children.progressPercent", {
                    percent: Math.round(child.progressPercent),
                  })}
                </p>
              ) : null}
            </div>
          </div>
          <div className="pd-child-detail-actions">
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={() => navigate(buildParentProgressPath(child.id))}
            >
              {t("parent.children.viewProgress")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={() => navigate(buildParentSessionsPath(child.id))}
            >
              {t("parent.children.viewSessions")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={() => navigate(buildParentReportsPath(child.id))}
            >
              {t("parent.children.viewReports")}
            </button>
          </div>
        </section>

        <section className="pd-card pd-card-pad">
          <h3 className="pd-section-title">{t("parent.children.assignedExercises")}</h3>
          {assignedExercises.length === 0 ? (
            <p className="pd-section-sub">{t("parent.children.noAssignedExercises")}</p>
          ) : (
            <ul className="pd-simple-list">
              {assignedExercises.map((exercise) => (
                <li key={exercise.id}>
                  {exercise.title}
                  {exercise.frequency ? ` · ${exercise.frequency}` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pd-card pd-card-pad">
          <h3 className="pd-section-title">{t("parent.children.reports")}</h3>
          {reports.length === 0 ? (
            <p className="pd-section-sub">{t("parent.children.noReports")}</p>
          ) : (
            <ul className="pd-simple-list">
              {reports.slice(0, 5).map((report) => (
                <li key={report.id}>{report.title}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="pd-card pd-card-pad">
          <h3 className="pd-section-title">{t("parent.children.sessions")}</h3>
          {sessions.length === 0 ? (
            <p className="pd-section-sub">{t("parent.children.noSessions")}</p>
          ) : (
            <ul className="pd-simple-list">
              {sessions.map((session) => (
                <li key={session.id}>
                  {session.specialistName || t("parent.common.specialist")}
                  {session.whenLabel ? ` · ${session.whenLabel}` : ""}
                  {session.statusLabel ? ` · ${session.statusLabel}` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        {reviews.length > 0 ? (
          <section className="pd-child-detail-reviews">
            <h3 className="pd-section-title">{t("parent.children.specialistFeedback")}</h3>
            <div className="pd-task-hub-list">
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={`${review.patientId}-${review.id}`} review={review} />
              ))}
            </div>
          </section>
        ) : null}
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
              {t("parent.children.backToChildren")}
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{t("parent.children.detailTitle")}</h1>
            <p className="pd-task-hub-subtitle">
              {t("parent.children.detailSubtitle")}
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
