import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_WEB_ROUTES,
  buildAdminCaseRequestSpecialistsPath,
} from "../../routes/adminDashboardRoutes";
import { useAdminCaseRequestDetails } from "./hooks/useAdminCaseRequestDetails";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminCaseAssignedSpecialist } from "./sections/AdminCaseAssignedSpecialist";
import { AdminCaseAttachments } from "./sections/AdminCaseAttachments";
import { AdminCaseChildInfo } from "./sections/AdminCaseChildInfo";
import { AdminCaseInformation } from "./sections/AdminCaseInformation";
import { AdminCaseParentInfo } from "./sections/AdminCaseParentInfo";
import { AdminCasePreviousTreatment } from "./sections/AdminCasePreviousTreatment";
import { AdminCaseRequestSummary } from "./sections/AdminCaseRequestSummary";
import { AdminCaseRequestTimeline } from "./sections/AdminCaseRequestTimeline";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminCaseRequestsSections.css";

export default function AdminCaseRequestDetailsPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();

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

  const { detail, isLoading, error, reload } = useAdminCaseRequestDetails(requestId);

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.caseRequests);
  }, [navigate]);

  const handleAssignSpecialist = useCallback(() => {
    if (!requestId) {
      return;
    }
    navigate(buildAdminCaseRequestSpecialistsPath(requestId));
  }, [navigate, requestId]);

  const handleCopy = useCallback(async (label, value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmed);
      showToast(`${label} copied.`);
    } catch {
      showToast(`Unable to copy ${label.toLowerCase()}.`);
    }
  }, [showToast]);

  let body;

  if (isLoading) {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Case Requests
        </button>
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-case-request-empty-copy">Loading case request...</p>
        </div>
      </div>
    );
  } else if (error) {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Case Requests
        </button>
        <div className="pd-card pd-card-pad pd-admin-case-requests-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            Retry
          </button>
        </div>
      </div>
    );
  } else if (!detail) {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Case Requests
        </button>
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-case-request-empty-copy">Case request not found.</p>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Case Requests
        </button>

        <AdminCaseRequestSummary detail={detail} />
        <AdminCaseRequestTimeline steps={detail.timelineSteps} />

        {detail.rejectionReason ? (
          <section className="pd-card pd-card-pad pd-admin-case-request-alert pd-section-enter">
            <h2 className="pd-admin-case-request-section-title">Rejection Reason</h2>
            <p>{detail.rejectionReason}</p>
          </section>
        ) : null}

        {detail.status === "converted_to_patient" && detail.patientId ? (
          <section className="pd-card pd-card-pad pd-admin-case-request-alert is-success pd-section-enter">
            <h2 className="pd-admin-case-request-section-title">Profile Created</h2>
            <p>Patient profile ID: {detail.patientId}</p>
          </section>
        ) : null}

        <div className="pd-admin-case-request-details-grid">
          <div className="pd-admin-case-request-details-main">
            <AdminCaseChildInfo detail={detail} />
            <AdminCaseInformation detail={detail} />
            <AdminCasePreviousTreatment detail={detail} />
            {detail.assessmentNotes ? (
              <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Assessment notes">
                <h2 className="pd-admin-case-request-section-title">Assessment Notes</h2>
                <p>{detail.assessmentNotes}</p>
              </section>
            ) : null}
          </div>

          <div className="pd-admin-case-request-details-side">
            <AdminCaseParentInfo
              parent={detail.parent}
              onCopyEmail={(value) => handleCopy("Email", value)}
              onCopyPhone={(value) => handleCopy("Phone number", value)}
            />
            <AdminCaseAttachments attachments={detail.attachments} />
            <AdminCaseAssignedSpecialist assignedSpecialist={detail.assignedSpecialist} />
          </div>
        </div>

        {detail.canAssignSpecialist ? (
          <div className="pd-admin-case-request-assign-action pd-section-enter">
            <button type="button" className="pd-btn pd-btn-primary" onClick={handleAssignSpecialist}>
              Assign Specialist
            </button>
          </div>
        ) : null}
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

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
