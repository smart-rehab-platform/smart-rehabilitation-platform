import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  buildParentCaseRequestEditPath,
  buildParentCaseRequestsPath,
  buildParentMessagesPath,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { useParentCaseRequestDetail } from "./hooks/useParentCaseRequests";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import { CaseRequestChildAvatar } from "./components/case-requests/CaseRequestChildAvatar";
import "./styles/parentDashboardTokens.css";

export default function ParentCaseRequestDetailPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const { request, isLoading, error, refetch } = useParentCaseRequestDetail(requestId);
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
    selectedChildId: null,
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
    navigate(buildParentCaseRequestsPath());
  }, [navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.caseRequests.loadingDetail")}</p>
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

    if (!request) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">
          <p>{t("parent.caseRequests.notFound")}</p>
        </section>
      );
    }

    return (
      <div className="pd-case-detail-stack">
        <section className="pd-card pd-card-pad">
          <div className="pd-case-detail-header">
            <CaseRequestChildAvatar
              childName={request.childName}
              imageUrl={request.childImageUrl}
              size="lg"
            />
            <div className="pd-case-detail-header-copy">
              <div className="pd-case-line">
                <h2 className="pd-section-title">{request.childName}</h2>
                <span className={`pd-status-pill pd-status-${request.status}`}>
                  {request.statusLabel}
                </span>
              </div>
              {request.statusSubtitle ? (
                <p className="pd-section-sub">{request.statusSubtitle}</p>
              ) : null}
              <p className="pd-case-meta">
                {t("parent.caseRequests.genderLabel", { gender: request.genderLabel })}
              </p>
              {request.categoryName ? (
                <p className="pd-case-meta">
                  {t("parent.caseRequests.categoryLabel", { category: request.categoryName })}
                </p>
              ) : null}
              {request.submittedLabel ? (
                <p className="pd-case-meta">
                  {t("parent.caseRequests.submitted", { date: request.submittedLabel })}
                </p>
              ) : null}
              {request.assignedSpecialistName ? (
                <p className="pd-case-meta">
                  {t("parent.caseRequests.assignedSpecialist", {
                    name: request.assignedSpecialistName,
                  })}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {request.caseDescription ? (
          <section className="pd-card pd-card-pad">
            <h3 className="pd-section-title">{t("parent.caseRequests.caseDescription")}</h3>
            <p>{request.caseDescription}</p>
          </section>
        ) : null}

        {request.observedDifficulties ? (
          <section className="pd-card pd-card-pad">
            <h3 className="pd-section-title">{t("parent.caseRequests.observedDifficulties")}</h3>
            <p>{request.observedDifficulties}</p>
          </section>
        ) : null}

        {request.rejectionReason ? (
          <section className="pd-card pd-card-pad">
            <h3 className="pd-section-title">{t("parent.caseRequests.rejectionReason")}</h3>
            <p>{request.rejectionReason}</p>
          </section>
        ) : null}

        <div className="pd-child-detail-actions">
          {request.canEdit ? (
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={() => navigate(buildParentCaseRequestEditPath(request.id))}
            >
              {t("parent.caseRequests.editRequest")}
            </button>
          ) : null}
          {request.conversationId ? (
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={() => navigate(buildParentMessagesPath(request.conversationId))}
            >
              {t("parent.caseRequests.openMessages")}
            </button>
          ) : null}
        </div>
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
              {t("parent.caseRequests.backToList")}
            </button>
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{t("parent.caseRequests.detailTitle")}</h1>
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
