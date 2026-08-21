import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, MessageSquare, UserRound } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import { buildParentFeedbackPath } from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { StatusBadge } from "./components/StatusBadge";
import { useParentFeedbackDetail } from "./hooks/useParentFeedbackDetail";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import { getFeedbackStatusMeta } from "./utils/parentFeedbackUtils";
import "./styles/parentDashboardTokens.css";
import "./styles/parentFeedbackSections.css";

export default function ParentFeedbackDetailPage() {
  const navigate = useNavigate();
  const { reviewId: reviewIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;
  const notificationUserId = parentUserId;

  const reviewId = reviewIdParam?.trim() || null;
  const patientId = searchParams.get("patientId")?.trim() || null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {
    review,
    isLoading,
    error,
    refetch,
  } = useParentFeedbackDetail(reviewId, patientId, parentUserId);

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
    selectedChildId: patientId || review?.patientId || null,
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

  const statusMeta = review
    ? getFeedbackStatusMeta(review.status, t)
    : null;

  const handleBack = useCallback(() => {
    navigate(buildParentFeedbackPath(patientId || review?.patientId));
  }, [navigate, patientId, review?.patientId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.pages.feedback.loadingDetail")}</p>
        </section>
      );
    }

    if (error || !review) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-error">{error || t("parent.pages.feedback.notFound")}</p>
          <div className="pd-feedback-detail-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
              {t("common.retry")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-ghost"
              onClick={handleBack}
            >
              {t("parent.common.backToFeedback")}
            </button>
          </div>
        </section>
      );
    }

    return (
      <div className="pd-feedback-detail-stack pd-section-enter">
        <section
          className="pd-card pd-card-pad pd-feedback-summary-card"
          aria-label={t("parent.pages.feedback.detailTitle")}
        >
          <div className="pd-feedback-summary-main">
            <div className="pd-feedback-summary-copy">
              <div className="pd-feedback-summary-title-row">
                <h1 className="pd-feedback-detail-title" dir="auto">
                  {review.exerciseTitle || t("parent.pages.feedback.detailTitle")}
                </h1>
                {statusMeta ? (
                  <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
                ) : null}
              </div>
              {review.childName ? (
                <p className="pd-feedback-detail-child">
                  {t("parent.feedback.forChild", { name: review.childName })}
                </p>
              ) : null}
            </div>

            {review.performanceRating != null ? (
              <div
                className="pd-feedback-performance-tile"
                aria-label={t("parent.feedback.performanceRating")}
              >
                <span className="pd-feedback-performance-label">
                  {t("parent.feedback.performanceRating")}
                </span>
                <p className="pd-feedback-performance-value">
                  <strong>{review.performanceRating}</strong>
                  <span>/10</span>
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section
          className="pd-card pd-card-pad pd-feedback-details-card"
          aria-label={t("parent.feedback.specialistComments")}
        >
          <ul className="pd-feedback-detail-meta">
            {review.specialistName ? (
              <li>
                <strong>{t("parent.common.specialist")}</strong>
                <span className="pd-feedback-detail-meta-value">
                  <UserRound size={14} aria-hidden="true" />
                  {review.specialistName}
                </span>
              </li>
            ) : null}
            {review.reviewedAt ? (
              <li>
                <strong>{t("parent.feedback.reviewDate")}</strong>
                <span className="pd-feedback-detail-meta-value">
                  <CalendarDays size={14} aria-hidden="true" />
                  {review.reviewedAt}
                </span>
              </li>
            ) : null}
          </ul>

          <section className="pd-feedback-detail-comments">
            <h2 className="pd-section-title pd-feedback-comments-title">
              <MessageSquare size={16} aria-hidden="true" />
              {t("parent.feedback.specialistComments")}
            </h2>
            {review.feedback ? (
              <blockquote className="pd-feedback-quote" dir="auto">
                {review.feedback}
              </blockquote>
            ) : (
              <div className="pd-feedback-detail-empty-state">
                <MessageSquare size={18} aria-hidden="true" />
                <p className="pd-feedback-detail-empty">
                  {t("parent.feedback.noComments")}
                </p>
              </div>
            )}
          </section>
        </section>
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
        <div className="pd-task-hub-page pd-feedback-detail-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("parent.common.backToFeedback")}
            </button>
          </div>

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
