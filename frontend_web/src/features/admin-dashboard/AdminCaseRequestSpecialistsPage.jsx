import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { buildAdminCaseRequestDetailsPath } from "../../routes/adminDashboardRoutes";
import { AdminAssignSpecialistDialog } from "./components/AdminAssignSpecialistDialog";
import { useAdminCaseRequestSpecialists } from "./hooks/useAdminCaseRequestSpecialists";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminMatchingSpecialistsGrid } from "./sections/AdminMatchingSpecialistsGrid";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminUsersSections.css";
import "./styles/adminCaseRequestsSections.css";

export default function AdminCaseRequestSpecialistsPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    specialists,
    selectedSpecialist,
    selectedSpecialistId,
    isLoading,
    isAssigning,
    error,
    assignmentError,
    reload,
    selectSpecialist,
    assignSelectedSpecialist,
    clearAssignmentError,
    labels,
  } = useAdminCaseRequestSpecialists(requestId);

  const { specialistsPage, retry, dialogs } = labels;

  const handleBack = useCallback(() => {
    if (requestId) {
      navigate(buildAdminCaseRequestDetailsPath(requestId));
      return;
    }
    navigate("/dashboard/admin/case-requests");
  }, [navigate, requestId]);

  const handleContinue = useCallback(() => {
    if (!selectedSpecialistId) {
      return;
    }
    clearAssignmentError();
    setConfirmOpen(true);
  }, [clearAssignmentError, selectedSpecialistId]);

  const closeConfirm = useCallback(() => {
    if (isAssigning) {
      return;
    }
    setConfirmOpen(false);
  }, [isAssigning]);

  const handleConfirmAssign = useCallback(async () => {
    const result = await assignSelectedSpecialist();

    if (result.ok) {
      showToast(result.message);
      setConfirmOpen(false);
      if (requestId) {
        navigate(buildAdminCaseRequestDetailsPath(requestId), { replace: true });
      }
      return;
    }

    if (result.stale && requestId) {
      showToast(result.message);
      setConfirmOpen(false);
      navigate(buildAdminCaseRequestDetailsPath(requestId), { replace: true });
    }
  }, [assignSelectedSpecialist, navigate, requestId, showToast]);

  let body;

  if (isLoading) {
    body = (
      <div className="pd-admin-case-request-specialists-page">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {specialistsPage.back}
        </button>
        <div className="pd-admin-case-request-specialists-shell">
          <section className="pd-admin-case-request-specialists-header pd-section-enter">
            <h1 className="pd-section-title">{specialistsPage.title}</h1>
            <p className="pd-section-sub">{specialistsPage.subtitle}</p>
          </section>
          <div className="pd-card pd-card-pad">
            <p className="pd-admin-case-request-empty-copy">{specialistsPage.loading}</p>
          </div>
        </div>
      </div>
    );
  } else if (error) {
    body = (
      <div className="pd-admin-case-request-specialists-page">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {specialistsPage.back}
        </button>
        <div className="pd-admin-case-request-specialists-shell">
          <section className="pd-admin-case-request-specialists-header pd-section-enter">
            <h1 className="pd-section-title">{specialistsPage.title}</h1>
            <p className="pd-section-sub">{specialistsPage.subtitle}</p>
          </section>
          <div className="pd-card pd-card-pad pd-admin-case-requests-error">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
              {retry}
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="pd-admin-case-request-specialists-page">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-case-request-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {specialistsPage.back}
        </button>

        <div className="pd-admin-case-request-specialists-shell">
          <section className="pd-admin-case-request-specialists-header pd-section-enter">
            <h1 className="pd-section-title">{specialistsPage.title}</h1>
            <p className="pd-section-sub">{specialistsPage.subtitle}</p>
          </section>

          <AdminMatchingSpecialistsGrid
            specialists={specialists}
            selectedSpecialistId={selectedSpecialistId}
            labels={labels}
            onSelectSpecialist={selectSpecialist}
          />

          <div className="pd-admin-case-request-specialists-action pd-section-enter">
            <button
              type="button"
              className="pd-btn pd-btn-primary"
              onClick={handleContinue}
              disabled={!selectedSpecialistId || isAssigning}
            >
              {specialistsPage.continue}
            </button>
          </div>
        </div>
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

      <AdminAssignSpecialistDialog
        open={confirmOpen}
        specialistName={selectedSpecialist?.fullName ?? ""}
        isSubmitting={isAssigning}
        error={assignmentError}
        labels={dialogs}
        onClose={closeConfirm}
        onConfirm={handleConfirmAssign}
      />
    </div>
  );
}
