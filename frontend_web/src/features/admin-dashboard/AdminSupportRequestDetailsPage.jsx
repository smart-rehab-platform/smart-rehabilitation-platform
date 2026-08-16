import { ArrowLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ADMIN_WEB_ROUTES } from "../../routes/adminDashboardRoutes";
import { SupportRequestComposer } from "../shared-dashboard/components/supportRequests/SupportRequestComposer";
import { SupportRequestResolvedNotice } from "../shared-dashboard/components/supportRequests/SupportRequestResolvedNotice";
import { SupportRequestSummary } from "../shared-dashboard/components/supportRequests/SupportRequestSummary";
import { SupportRequestThread } from "../shared-dashboard/components/supportRequests/SupportRequestThread";
import { useAdminShell } from "./hooks/useAdminShell";
import { useAdminSupportRequestDetails } from "./hooks/useAdminSupportRequestDetails";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminSupportRequestActions } from "./sections/AdminSupportRequestActions";
import "../shared-dashboard/styles/dashboardTokens.css";
import "../shared-dashboard/styles/supportRequestSections.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminComplaintsSections.css";

function AdminSupportRequestStatusDialog({
  open,
  title,
  copy,
  confirmLabel,
  cancelLabel,
  updatingLabel,
  onCancel,
  onConfirm,
  isSubmitting,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="pd-admin-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="pd-admin-modal pd-admin-modal-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-support-request-status-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-support-request-status-title" className="pd-admin-modal-title">{title}</h2>
        <p className="pd-admin-modal-copy">{copy}</p>
        <div className="pd-admin-modal-actions">
          <button type="button" className="pd-btn pd-btn-soft" disabled={isSubmitting} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="pd-btn pd-btn-primary" disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? updatingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSupportRequestDetailsPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { user, isInitializing } = useAuth();
  const adminUserId = isInitializing ? null : user?.id ?? null;
  const shell = useAdminShell();
  const [statusDialog, setStatusDialog] = useState(null);

  const {
    labels,
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
    isUpdatingStatus,
    statusError,
    updateStatus,
  } = useAdminSupportRequestDetails(requestId, adminUserId);

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.supportRequests);
  }, [navigate]);

  const handleSendReply = useCallback(async () => {
    const result = await sendReply();
    if (result.ok) {
      shell.showToast(labels.toast.replySent);
      await refetch();
      return;
    }
    if (result.message) {
      shell.showToast(result.message);
    }
  }, [sendReply, shell, refetch, labels.toast.replySent]);

  const handleConfirmStatus = useCallback(async () => {
    if (!statusDialog?.status) {
      return;
    }

    const result = await updateStatus(statusDialog.status);
    if (result.ok) {
      setStatusDialog(null);
      shell.showToast(
        statusDialog.status === "resolved"
          ? labels.toast.markResolvedSuccess
          : labels.toast.markInProgressSuccess,
      );
      await refetch();
      return;
    }
    if (result.message) {
      shell.showToast(result.message);
    }
  }, [statusDialog, updateStatus, shell, refetch, labels.toast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad">
          <p className="pd-inline-loading">{labels.loadingDetails}</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad">
          <p className="pd-inline-error">{error}</p>
          {errorStatus !== 404 ? (
            <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
              {labels.retry}
            </button>
          ) : null}
        </section>
      );
    }

    if (!request) {
      return (
        <section className="pd-card pd-card-pad">
          <p className="pd-inline-error">{labels.unavailable}</p>
        </section>
      );
    }

    return (
      <div className="pd-support-request-ticket">
        <div className="pd-support-request-ticket-head">
          <SupportRequestSummary request={request} />
          <AdminSupportRequestActions
            labels={labels}
            request={request}
            isUpdatingStatus={isUpdatingStatus}
            statusError={statusError}
            onMarkInProgress={() => setStatusDialog({
              status: "in_progress",
              title: labels.statusDialog.markInProgressTitle,
              copy: labels.statusDialog.markInProgressBody,
              confirmLabel: labels.markInProgress,
            })}
            onMarkResolved={() => setStatusDialog({
              status: "resolved",
              title: labels.statusDialog.markResolvedTitle,
              copy: labels.statusDialog.markResolvedBody,
              confirmLabel: labels.resolveRequest,
            })}
          />
        </div>
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
      <AdminDashboardShell
        collapsed={shell.sidebarCollapsed}
        mobileOpen={shell.mobileNavOpen}
        navItems={shell.navItems}
        badges={shell.badges}
        user={shell.adminUser}
        notificationsOpen={shell.notificationsOpen}
        onNotificationsOpenChange={shell.setNotificationsOpen}
        onToggleCollapse={() => shell.setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => shell.setMobileNavOpen(true)}
        onCloseMobile={() => shell.setMobileNavOpen(false)}
        onNavAction={shell.handleSidebarNav}
        onSignOut={shell.handleSignOut}
        onViewProfile={shell.handleViewProfile}
        onViewAllNotifications={shell.handleViewAllNotifications}
        showToast={shell.showToast}
      >
        <div className="pd-admin-complaint-details pd-section-enter">
          <button type="button" className="pd-btn pd-btn-soft pd-admin-complaint-back" onClick={handleBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            {labels.back}
          </button>
          {renderContent()}
        </div>
      </AdminDashboardShell>

      <AdminSupportRequestStatusDialog
        open={Boolean(statusDialog)}
        title={statusDialog?.title}
        copy={statusDialog?.copy}
        confirmLabel={statusDialog?.confirmLabel}
        cancelLabel={labels.statusDialog.cancel}
        updatingLabel={labels.statusDialog.updating}
        isSubmitting={isUpdatingStatus}
        onCancel={() => setStatusDialog(null)}
        onConfirm={handleConfirmStatus}
      />

      {shell.toast ? (
        <div className="pd-toast" role="status" aria-live="polite">{shell.toast}</div>
      ) : null}
    </div>
  );
}
