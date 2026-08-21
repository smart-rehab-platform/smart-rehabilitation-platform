import { useCallback } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
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

  const { detail, isLoading, error, reload, labels } = useAdminCaseRequestDetails(requestId);
  const pageLabels = detail?.labels ?? labels;

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.caseRequests);
  }, [navigate]);

  const handleAssignSpecialist = useCallback(() => {
    if (!requestId) {
      return;
    }
    navigate(buildAdminCaseRequestSpecialistsPath(requestId));
  }, [navigate, requestId]);

  const handleCopyEmail = useCallback(async (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmed);
      showToast(pageLabels.copyEmail);
    } catch {
      showToast(pageLabels.copyFailed);
    }
  }, [pageLabels.copyEmail, pageLabels.copyFailed, showToast]);

  const handleCopyPhone = useCallback(async (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmed);
      showToast(pageLabels.copyPhone);
    } catch {
      showToast(pageLabels.copyFailed);
    }
  }, [pageLabels.copyFailed, pageLabels.copyPhone, showToast]);

  let body;

  if (isLoading) {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {labels.back}
        </button>
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-case-request-empty-copy">{labels.loadingDetails}</p>
        </div>
      </div>
    );
  } else if (error) {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {labels.back}
        </button>
        <div className="pd-card pd-card-pad pd-admin-case-requests-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {labels.retry}
          </button>
        </div>
      </div>
    );
  } else if (!detail) {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {labels.back}
        </button>
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-case-request-empty-copy">{labels.notFound}</p>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="pd-admin-case-request-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {pageLabels.back}
        </button>

        <AdminCaseRequestSummary detail={detail} labels={pageLabels} />
        <AdminCaseRequestTimeline steps={detail.timelineSteps} labels={pageLabels} />

        {detail.rejectionReason ? (
          <div className="pd-admin-case-request-notice is-warning pd-section-enter" role="note">
            <AlertTriangle size={16} className="pd-admin-case-request-notice-icon" aria-hidden="true" />
            <div className="pd-admin-case-request-notice-copy">
              <strong>{pageLabels.rejectionReason}</strong>
              <span dir="auto">{detail.rejectionReason}</span>
            </div>
          </div>
        ) : null}

        {detail.status === "converted_to_patient" && detail.patientId ? (
          <div className="pd-admin-case-request-notice is-success pd-section-enter" role="status">
            <CheckCircle2 size={16} className="pd-admin-case-request-notice-icon" aria-hidden="true" />
            <div className="pd-admin-case-request-notice-copy">
              <strong>{pageLabels.profileCreated}</strong>
              <span>{pageLabels.patientProfileId(detail.patientId)}</span>
            </div>
          </div>
        ) : null}

        <section className="pd-admin-case-request-page-section pd-section-enter" aria-label={pageLabels.caseOverviewSection}>
          <h2 className="pd-admin-case-request-page-section-title">{pageLabels.caseOverviewSection}</h2>
          <div className="pd-admin-case-request-info-columns">
            <div className="pd-admin-case-request-info-column">
              <AdminCaseChildInfo detail={detail} labels={pageLabels} />
              <AdminCaseInformation detail={detail} labels={pageLabels} />
            </div>
            <div className="pd-admin-case-request-info-column">
              <AdminCaseParentInfo
                parent={detail.parent}
                labels={pageLabels}
                onCopyEmail={handleCopyEmail}
                onCopyPhone={handleCopyPhone}
              />
              <AdminCasePreviousTreatment detail={detail} labels={pageLabels} />
            </div>
          </div>
        </section>

        <section className="pd-admin-case-request-page-section pd-section-enter" aria-label={pageLabels.careTeam}>
          <h2 className="pd-admin-case-request-page-section-title">{pageLabels.careTeam}</h2>
          <div className="pd-card pd-card-pad pd-admin-case-care-team-card">
            <h3 className="pd-admin-case-info-card-title">{pageLabels.assignedSpecialist}</h3>
            <AdminCaseAssignedSpecialist assignedSpecialist={detail.assignedSpecialist} labels={pageLabels} />
          </div>
        </section>

        {detail.assessmentNotes ? (
          <section className="pd-admin-case-request-page-section pd-section-enter" aria-label={pageLabels.assessmentNotes}>
            <h2 className="pd-admin-case-request-page-section-title">{pageLabels.assessmentNotes}</h2>
            <div className="pd-card pd-card-pad pd-admin-case-notes-card">
              <p className="pd-admin-case-notes-body">
                <bdi dir="auto">{detail.assessmentNotes}</bdi>
              </p>
            </div>
          </section>
        ) : null}

        <AdminCaseAttachments attachments={detail.attachments} labels={pageLabels} />

        {detail.canAssignSpecialist ? (
          <div className="pd-admin-case-request-assign-action pd-section-enter">
            <button type="button" className="pd-btn pd-btn-primary" onClick={handleAssignSpecialist}>
              {pageLabels.assignSpecialist}
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
