import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_WEB_ROUTES } from "../../routes/adminDashboardRoutes";
import { AdminComplaintReviewActionDialog } from "./components/AdminComplaintReviewActionDialog";
import { AdminComplaintStartReviewDialog } from "./components/AdminComplaintStartReviewDialog";
import { useAdminComplaintDetails } from "./hooks/useAdminComplaintDetails";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminComplaintActions } from "./sections/AdminComplaintActions";
import { AdminComplaintAttachment } from "./sections/AdminComplaintAttachment";
import { AdminComplaintDescription } from "./sections/AdminComplaintDescription";
import { AdminComplaintExistingNotes } from "./sections/AdminComplaintExistingNotes";
import { AdminComplaintInformation } from "./sections/AdminComplaintInformation";
import { AdminComplaintParties } from "./sections/AdminComplaintParties";
import { AdminComplaintSummary } from "./sections/AdminComplaintSummary";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminComplaintsSections.css";

function DetailsSkeleton({ labels }) {
  return (
    <div
      className="pd-admin-complaint-details"
      aria-busy="true"
      aria-label={labels.detailsLoadingAriaLabel}
    >
      <div className="pd-card pd-card-pad pd-admin-complaint-skeleton-hero">
        <span className="pd-admin-complaints-skeleton-line is-wide" />
        <span className="pd-admin-complaints-skeleton-line" />
        <span className="pd-admin-complaints-skeleton-line is-short" />
      </div>
      <div className="pd-admin-complaint-details-grid">
        <div className="pd-admin-complaint-details-main">
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-complaints-skeleton-line is-wide" />
            <span className="pd-admin-complaints-skeleton-line" />
            <span className="pd-admin-complaints-skeleton-line" />
          </div>
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-complaints-skeleton-line is-wide" />
            <span className="pd-admin-complaints-skeleton-line" />
            <span className="pd-admin-complaints-skeleton-line is-wide" />
          </div>
        </div>
        <div className="pd-admin-complaint-details-side">
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-complaints-skeleton-line" />
            <span className="pd-admin-complaints-skeleton-line is-short" />
          </div>
          <div className="pd-card pd-card-pad">
            <span className="pd-admin-complaints-skeleton-line" />
            <span className="pd-admin-complaints-skeleton-line is-short" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackButton({ labels, onClick }) {
  return (
    <button type="button" className="pd-btn pd-btn-soft pd-admin-complaint-back" onClick={onClick}>
      <ArrowLeft size={16} aria-hidden="true" />
      {labels.back}
    </button>
  );
}

export default function AdminComplaintDetailsPage() {
  const navigate = useNavigate();
  const { complaintId } = useParams();

  const {
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
    handleSignOut,
    handleViewProfile,
    handleViewAllNotifications,
    handleSidebarNav,
  } = useAdminShell();

  const {
    complaint,
    isLoading,
    error,
    errorStatus,
    refresh,
    labels,
  } = useAdminComplaintDetails(complaintId);

  const [startReviewOpen, setStartReviewOpen] = useState(false);
  const [reviewActionType, setReviewActionType] = useState(null);

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.complaints);
  }, [navigate]);

  const handleStartReviewSuccess = useCallback(async () => {
    setStartReviewOpen(false);
    showToast(labels.toast.startReviewSuccess);
    await refresh();
  }, [labels.toast.startReviewSuccess, refresh, showToast]);

  const handleReviewActionSuccess = useCallback(async (actionType) => {
    setReviewActionType(null);
    showToast(
      actionType === "resolve"
        ? labels.toast.resolveSuccess
        : labels.toast.rejectSuccess,
    );
    await refresh();
  }, [labels.toast.rejectSuccess, labels.toast.resolveSuccess, refresh, showToast]);

  const isNotFound = errorStatus === 404
    || (typeof error === "string" && error.toLowerCase().includes("not found"));

  let body;

  if (isLoading) {
    body = (
      <>
        <BackButton labels={labels} onClick={handleBack} />
        <DetailsSkeleton labels={labels} />
      </>
    );
  } else if (isNotFound) {
    body = (
      <div className="pd-admin-complaint-details">
        <BackButton labels={labels} onClick={handleBack} />
        <section className="pd-card pd-card-pad pd-section-enter">
          <p className="pd-admin-complaint-empty-copy">{labels.notFound}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
            {labels.back}
          </button>
        </section>
      </div>
    );
  } else if (error) {
    body = (
      <div className="pd-admin-complaint-details">
        <BackButton labels={labels} onClick={handleBack} />
        <section className="pd-card pd-card-pad pd-admin-complaints-error pd-section-enter">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
            {labels.retry}
          </button>
        </section>
      </div>
    );
  } else if (!complaint) {
    body = (
      <div className="pd-admin-complaint-details">
        <BackButton labels={labels} onClick={handleBack} />
        <section className="pd-card pd-card-pad pd-section-enter">
          <p className="pd-admin-complaint-empty-copy">{labels.notFound}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
            {labels.back}
          </button>
        </section>
      </div>
    );
  } else {
    body = (
      <div className="pd-admin-complaint-details">
        <BackButton labels={labels} onClick={handleBack} />

        <AdminComplaintSummary complaint={complaint} />

        <div className="pd-admin-complaint-details-grid">
          <div className="pd-admin-complaint-details-main">
            <AdminComplaintInformation complaint={complaint} />
            <AdminComplaintDescription description={complaint.description} />
            <AdminComplaintAttachment
              attachmentUrl={complaint.attachmentUrl}
              attachmentResolvedUrl={complaint.attachmentResolvedUrl}
            />
            <AdminComplaintExistingNotes adminNotes={complaint.adminNotes} />
          </div>

          <div className="pd-admin-complaint-details-side">
            <AdminComplaintParties complaint={complaint} />
          </div>
        </div>

        <AdminComplaintActions
          complaint={complaint}
          onStartReview={() => setStartReviewOpen(true)}
          onResolve={() => setReviewActionType("resolve")}
          onReject={() => setReviewActionType("reject")}
        />
      </div>
    );
  }

  return (
    <div className="pd-preview">
      <AdminDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={adminUser}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onViewAllNotifications={handleViewAllNotifications}
        showToast={showToast}
      >
        {body}
      </AdminDashboardShell>

      <AdminComplaintStartReviewDialog
        open={startReviewOpen}
        complaint={complaint}
        onClose={() => setStartReviewOpen(false)}
        onSuccess={handleStartReviewSuccess}
        onStaleRefresh={refresh}
      />

      <AdminComplaintReviewActionDialog
        open={Boolean(reviewActionType)}
        actionType={reviewActionType}
        complaint={complaint}
        onClose={() => setReviewActionType(null)}
        onSuccess={handleReviewActionSuccess}
        onStaleRefresh={refresh}
      />

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
