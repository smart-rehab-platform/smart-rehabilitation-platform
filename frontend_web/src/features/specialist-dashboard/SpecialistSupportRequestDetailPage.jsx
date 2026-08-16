import { ArrowLeft } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";import { buildSpecialistSupportRequestsPath } from "../../routes/specialistDashboardRoutes";
import { SupportRequestComposer } from "../shared-dashboard/components/supportRequests/SupportRequestComposer";
import { SupportRequestResolvedNotice } from "../shared-dashboard/components/supportRequests/SupportRequestResolvedNotice";
import { SupportRequestSummary } from "../shared-dashboard/components/supportRequests/SupportRequestSummary";
import { SupportRequestThread } from "../shared-dashboard/components/supportRequests/SupportRequestThread";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { useSpecialistSupportRequestDetails } from "./hooks/useSpecialistSupportRequestDetails";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { getSpecialistSupportDetailLabels } from "./utils/specialistSupportRequestsLocalization.js";import "../shared-dashboard/styles/dashboardTokens.css";
import "../shared-dashboard/styles/supportRequestSections.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistSupportRequestDetailPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const detailLabels = useMemo(() => getSpecialistSupportDetailLabels(t), [t]);  const { requestId } = useParams();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;
  const shell = useSpecialistShell(specialistUserId);

  const {
    request,
    isLoading,
    error,
    errorStatus,
    refetch,
    replyContent,
    setReplyContent,
    attachmentFile,
    attachmentError,
    handleSelectAttachment,
    clearAttachment,
    isReplying,
    replyError,
    sendReply,
  } = useSpecialistSupportRequestDetails(requestId, specialistUserId);

  const handleBack = useCallback(() => {
    navigate(buildSpecialistSupportRequestsPath());
  }, [navigate]);

  const handleSendReply = useCallback(async () => {
    const result = await sendReply();
    if (result.ok) {
      shell.showToast(detailLabels.replySuccess);
      return;
    }
    if (result.message) {
      shell.showToast(result.message);
    }
  }, [sendReply, shell, detailLabels.replySuccess]);
  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad">
          <p className="pd-inline-loading">{detailLabels.loading}</p>        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad">
          <p className="pd-inline-error">{error}</p>
          {errorStatus !== 404 ? (
            <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
              {t("common.retry")}
            </button>          ) : null}
        </section>
      );
    }

    if (!request) {
      return (
        <section className="pd-card pd-card-pad">
          <p className="pd-inline-error">{detailLabels.unavailable}</p>        </section>
      );
    }

    return (
      <div className="pd-support-request-ticket">
        <SupportRequestSummary request={request} />
        <div className="pd-support-request-conversation-shell">
          <SupportRequestThread messages={request.messages} />
          {request.isResolved ? (
            <SupportRequestResolvedNotice resolvedAtLabel={request.resolvedAtLabel} />
          ) : (
            <SupportRequestComposer
              content={replyContent}
              attachmentFile={attachmentFile}
              attachmentError={attachmentError}
              isSubmitting={isReplying}
              submitError={replyError}
              onContentChange={setReplyContent}
              onSelectAttachment={handleSelectAttachment}
              onClearAttachment={clearAttachment}
              onSubmit={handleSendReply}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pd-preview">
      <SpecialistDashboardShell
        collapsed={shell.sidebarCollapsed}
        mobileOpen={shell.mobileNavOpen}
        navItems={shell.navItems}
        badges={shell.badges}
        user={shell.specialist}
        notifications={shell.notifications}
        notificationsOpen={shell.notificationsOpen}
        onNotificationsOpenChange={shell.setNotificationsOpen}
        notificationsLoading={shell.isLoadingNotifications}
        notificationsError={shell.notificationsError}
        onNotificationSelect={shell.handleNotificationSelect}
        onViewAllNotifications={shell.handleViewAllNotifications}
        onSignOut={shell.handleSignOut}
        onViewProfile={shell.handleViewProfile}
        onMessages={shell.handleMessages}
        onToggleCollapse={() => shell.setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => shell.setMobileNavOpen(true)}
        onCloseMobile={shell.closeMobileNav}
        onNavAction={shell.handleSidebarNav}
        showToast={shell.showToast}
      >
        <div className="pd-support-request-page pd-section-enter">
          <div className="pd-profile-page-toolbar">
            <button type="button" className="pd-btn pd-btn-soft pd-back-link" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              {detailLabels.backToList}
            </button>          </div>
          {renderContent()}
        </div>
      </SpecialistDashboardShell>

      {shell.toast ? (
        <div className="pd-toast" role="status" aria-live="polite">{shell.toast}</div>
      ) : null}
    </div>
  );
}
