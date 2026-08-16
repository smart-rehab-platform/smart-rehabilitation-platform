import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminPatientAssignmentsUnlinkDialog } from "./components/AdminPatientAssignmentsUnlinkDialog";
import { useAdminPatientAssignments } from "./hooks/useAdminPatientAssignments";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminPatientAssignmentsAssignSpecialist } from "./sections/AdminPatientAssignmentsAssignSpecialist";
import { AdminPatientAssignmentsLinkParent } from "./sections/AdminPatientAssignmentsLinkParent";
import { AdminPatientAssignmentsParentsList } from "./sections/AdminPatientAssignmentsParentsList";
import { AdminPatientAssignmentsPatientSelector } from "./sections/AdminPatientAssignmentsPatientSelector";
import { AdminPatientAssignmentsSpecialistsList } from "./sections/AdminPatientAssignmentsSpecialistsList";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminUsersSections.css";
import "./styles/adminPatientAssignmentsSections.css";

export default function AdminPatientAssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const preferredPatientId = searchParams.get("patientId");

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
    patients,
    specialists,
    parents,
    assignedSpecialists,
    linkedParents,
    selectedPatientId,
    selectedSpecialistId,
    selectedParentId,
    selectedRelationship,
    isPrimarySpecialist,
    isPrimaryContact,
    isLoading,
    isLoadingRelationships,
    isSubmittingSpecialist,
    isSubmittingParent,
    isUnlinking,
    initError,
    relationshipsError,
    specialistFormError,
    parentFormError,
    canAssignSpecialist,
    canLinkParent,
    reload,
    selectPatient,
    setSelectedSpecialistId,
    setSelectedParentId,
    setSelectedRelationship,
    setIsPrimarySpecialist,
    setIsPrimaryContact,
    assignSpecialist,
    linkParent,
    unlinkSpecialist,
    unlinkParent,
    retryRelationships,
    labels,
  } = useAdminPatientAssignments(preferredPatientId);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    setSearchParams((prev) => {
      const current = prev.get("patientId") || null;
      const nextId = selectedPatientId || null;

      if (current === nextId) {
        return prev;
      }

      const next = new URLSearchParams(prev);
      if (nextId) {
        next.set("patientId", nextId);
      } else {
        next.delete("patientId");
      }
      return next;
    }, { replace: true });
  }, [isLoading, selectedPatientId, setSearchParams]);

  const [unlinkDialog, setUnlinkDialog] = useState({
    open: false,
    kind: null,
    target: null,
    error: null,
  });

  const hasSelectedPatient = Boolean(selectedPatientId);

  const unlinkDialogCopy = useMemo(() => {
    if (!unlinkDialog.open || !unlinkDialog.target) {
      return { title: "", message: "" };
    }

    if (unlinkDialog.kind === "specialist") {
      return {
        title: labels.unlinkSpecialistTitle,
        message: labels.unlinkSpecialistConfirm(unlinkDialog.target.specialistName),
      };
    }

    return {
      title: labels.unlinkParentTitle,
      message: labels.unlinkParentConfirm(unlinkDialog.target.parentName),
    };
  }, [labels, unlinkDialog]);

  const openUnlinkSpecialistDialog = useCallback((link) => {
    setUnlinkDialog({
      open: true,
      kind: "specialist",
      target: link,
      error: null,
    });
  }, []);

  const openUnlinkParentDialog = useCallback((link) => {
    setUnlinkDialog({
      open: true,
      kind: "parent",
      target: link,
      error: null,
    });
  }, []);

  const closeUnlinkDialog = useCallback(() => {
    if (isUnlinking) {
      return;
    }

    setUnlinkDialog({
      open: false,
      kind: null,
      target: null,
      error: null,
    });
  }, [isUnlinking]);

  const handleAssignSpecialist = useCallback(async () => {
    const result = await assignSpecialist();
    if (result.ok && result.message) {
      showToast(result.message);
    }
  }, [assignSpecialist, showToast]);

  const handleLinkParent = useCallback(async () => {
    const result = await linkParent();
    if (result.ok && result.message) {
      showToast(result.message);
    }
  }, [linkParent, showToast]);

  const handleConfirmUnlink = useCallback(async () => {
    if (!unlinkDialog.target) {
      return;
    }

    const result = unlinkDialog.kind === "specialist"
      ? await unlinkSpecialist(unlinkDialog.target.specialistId)
      : await unlinkParent(unlinkDialog.target.parentId);

    if (result.ok) {
      showToast(result.message);
      setUnlinkDialog({
        open: false,
        kind: null,
        target: null,
        error: null,
      });
      return;
    }

    setUnlinkDialog((current) => ({
      ...current,
      error: result.message ?? labels.unlinkFailed,
    }));
  }, [labels.unlinkFailed, unlinkDialog, unlinkParent, unlinkSpecialist, showToast]);

  let body;

  if (isLoading) {
    body = (
      <div className="pd-admin-assignments-page">
        <section className="pd-admin-assignments-header pd-section-enter" aria-label={labels.headerAriaLabel}>
          <h1 className="pd-section-title">{labels.title}</h1>
          <p className="pd-section-sub">{labels.subtitle}</p>
        </section>
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-assignments-empty-copy">{labels.loading}</p>
        </div>
      </div>
    );
  } else if (initError) {
    body = (
      <div className="pd-admin-assignments-page">
        <section className="pd-admin-assignments-header pd-section-enter" aria-label={labels.headerAriaLabel}>
          <h1 className="pd-section-title">{labels.title}</h1>
          <p className="pd-section-sub">{labels.subtitle}</p>
        </section>
        <div className="pd-card pd-card-pad pd-admin-assignments-inline-error">
          <p className="pd-inline-error">{initError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {labels.retry}
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="pd-admin-assignments-page">
        <section className="pd-admin-assignments-header pd-section-enter" aria-label={labels.headerAriaLabel}>
          <h1 className="pd-section-title">{labels.title}</h1>
          <p className="pd-section-sub">{labels.subtitle}</p>
        </section>

        <AdminPatientAssignmentsPatientSelector
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={selectPatient}
          labels={labels}
        />

        <div className="pd-admin-assignments-forms-grid">
          <AdminPatientAssignmentsAssignSpecialist
            specialists={specialists}
            selectedSpecialistId={selectedSpecialistId}
            isPrimarySpecialist={isPrimarySpecialist}
            isSubmitting={isSubmittingSpecialist}
            canSubmit={canAssignSpecialist}
            error={specialistFormError}
            onSelectSpecialist={setSelectedSpecialistId}
            onPrimaryChange={setIsPrimarySpecialist}
            onSubmit={handleAssignSpecialist}
            labels={labels}
          />
          <AdminPatientAssignmentsLinkParent
            parents={parents}
            selectedParentId={selectedParentId}
            selectedRelationship={selectedRelationship}
            isPrimaryContact={isPrimaryContact}
            isSubmitting={isSubmittingParent}
            canSubmit={canLinkParent}
            error={parentFormError}
            onSelectParent={setSelectedParentId}
            onSelectRelationship={setSelectedRelationship}
            onPrimaryChange={setIsPrimaryContact}
            onSubmit={handleLinkParent}
            labels={labels}
          />
        </div>

        <p className="pd-admin-assignments-info-note">
          {labels.changeHint}
        </p>

        <div className="pd-admin-assignments-lists-grid">
          <AdminPatientAssignmentsSpecialistsList
            assignedSpecialists={assignedSpecialists}
            isLoading={isLoadingRelationships}
            hasSelectedPatient={hasSelectedPatient}
            relationshipsError={relationshipsError}
            isUnlinking={isUnlinking}
            onRetry={retryRelationships}
            onUnlink={openUnlinkSpecialistDialog}
            labels={labels}
          />
          <AdminPatientAssignmentsParentsList
            linkedParents={linkedParents}
            isLoading={isLoadingRelationships}
            hasSelectedPatient={hasSelectedPatient}
            relationshipsError={relationshipsError}
            isUnlinking={isUnlinking}
            onRetry={retryRelationships}
            onUnlink={openUnlinkParentDialog}
            labels={labels}
          />
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

      <AdminPatientAssignmentsUnlinkDialog
        open={unlinkDialog.open}
        title={unlinkDialogCopy.title}
        message={unlinkDialogCopy.message}
        isSubmitting={isUnlinking}
        error={unlinkDialog.error}
        onClose={closeUnlinkDialog}
        onConfirm={handleConfirmUnlink}
        labels={labels}
      />
    </div>
  );
}
