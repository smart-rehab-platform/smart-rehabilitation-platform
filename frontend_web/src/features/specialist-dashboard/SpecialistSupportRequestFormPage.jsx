import { ArrowLeft } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";import {
  buildSpecialistSupportRequestDetailPath,
  buildSpecialistSupportRequestsPath,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistSupportRequestForm } from "./components/supportRequests/SpecialistSupportRequestForm";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { useSpecialistSupportRequestForm } from "./hooks/useSpecialistSupportRequestForm";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { getSpecialistSupportFormLabels } from "./utils/specialistSupportRequestsLocalization.js";import "../shared-dashboard/styles/dashboardTokens.css";
import "../shared-dashboard/styles/supportRequestSections.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistSupportRequestFormPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const formLabels = useMemo(() => getSpecialistSupportFormLabels(t), [t]);  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;
  const shell = useSpecialistShell(specialistUserId);

  const {
    form,
    fieldErrors,
    categoryOptions,
    attachmentFile,
    attachmentError,
    isUploadingAttachment,
    isSubmitting,
    submitError,
    updateField,
    selectAttachment,
    clearAttachment,
    submitRequest,
  } = useSpecialistSupportRequestForm();

  const handleBack = useCallback(() => {
    navigate(buildSpecialistSupportRequestsPath());
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate(buildSpecialistSupportRequestsPath());
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    const result = await submitRequest();
    if (result.ok && result.requestId) {
      shell.showToast(formLabels.submitSuccess);
      navigate(buildSpecialistSupportRequestDetailPath(result.requestId));
      return;
    }
    if (result.message) {
      shell.showToast(result.message);
    }
  }, [submitRequest, shell, navigate, formLabels.submitSuccess]);
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
              {formLabels.backToList}
            </button>
          </div>

          <header className="pd-profile-page-header">
            <h1 className="pd-task-hub-title">{formLabels.newTitle}</h1>
            <p className="pd-task-hub-subtitle">
              {t("specialist.support.form.subtitle")}
            </p>
          </header>
          <SpecialistSupportRequestForm
            form={form}
            fieldErrors={fieldErrors}
            categoryOptions={categoryOptions}
            attachmentFile={attachmentFile}
            attachmentError={attachmentError}
            isSubmitting={isSubmitting}
            isUploadingAttachment={isUploadingAttachment}
            submitError={submitError}
            onFieldChange={updateField}
            onSelectAttachment={selectAttachment}
            onClearAttachment={clearAttachment}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </div>
      </SpecialistDashboardShell>

      {shell.toast ? (
        <div className="pd-toast" role="status" aria-live="polite">{shell.toast}</div>
      ) : null}
    </div>
  );
}
