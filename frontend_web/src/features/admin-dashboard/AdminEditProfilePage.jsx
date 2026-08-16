import { ArrowLeft } from "lucide-react";

import { useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

import { useLocale } from "../../context/useLocale.js";

import { buildAdminProfilePath } from "../../routes/adminDashboardRoutes";

import { AdminProfileErrorState } from "./components/profile/AdminProfileErrorState";

import { AdminProfileForm } from "./components/profile/AdminProfileForm";

import { useAdminProfile } from "./hooks/useAdminProfile";

import { useAdminProfileForm } from "./hooks/useAdminProfileForm";

import { useAdminShell } from "./hooks/useAdminShell";

import { AdminDashboardShell } from "./layout/AdminDashboardShell";

import { getAdminProfilePageLabels } from "./utils/adminProfileLocalization.js";

import "../shared-dashboard/styles/dashboardTokens.css";

import "./styles/adminDashboardSections.css";



export default function AdminEditProfilePage() {

  const navigate = useNavigate();

  const { t } = useLocale();

  const labels = useMemo(() => getAdminProfilePageLabels(t), [t]);

  const { user, isInitializing, refreshSession } = useAuth();

  const adminUserId = isInitializing ? null : user?.id ?? null;



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

    profile,

    isLoading,

    error,

    refetch,

    replaceProfile,

  } = useAdminProfile(adminUserId);



  const handleRefreshSession = useCallback(async () => refreshSession(), [refreshSession]);



  const {

    formValues,

    fieldErrors,

    saveError,

    isSaving,

    isDirty,

    avatarPreviewUrl,

    avatarError,

    setFieldValue,

    handleAvatarSelect,

    resetForm,

    saveProfile,

  } = useAdminProfileForm({

    profile,

    onProfileSaved: replaceProfile,

    onRefreshSession: handleRefreshSession,

  });



  const handleBack = useCallback(() => {

    navigate(buildAdminProfilePath());

  }, [navigate]);



  const handleCancel = useCallback(() => {

    resetForm();

    handleBack();

  }, [resetForm, handleBack]);



  const handleSave = useCallback(async () => {

    const result = await saveProfile();

    if (result.ok) {

      showToast(labels.updatedSuccess);

      handleBack();

      return;

    }

    if (result.message) {

      showToast(result.message);

    }

  }, [saveProfile, showToast, handleBack, labels.updatedSuccess]);



  const renderContent = () => {

    if (isLoading) {

      return (

        <section className="pd-card pd-card-pad pd-profile-state pd-section-enter">

          <p className="pd-inline-loading">{labels.loading}</p>

        </section>

      );

    }



    if (error) {

      return (

        <AdminProfileErrorState

          message={error}

          retryLabel={labels.retry}

          onRetry={refetch}

        />

      );

    }



    if (!profile) {

      return (

        <AdminProfileErrorState

          message={labels.unavailable}

          retryLabel={labels.retry}

          onRetry={refetch}

        />

      );

    }



    return (

      <AdminProfileForm

        profile={profile}

        labels={labels}

        formValues={formValues}

        fieldErrors={fieldErrors}

        avatarPreviewUrl={avatarPreviewUrl}

        avatarError={avatarError}

        isSaving={isSaving}

        isDirty={isDirty}

        saveError={saveError}

        onFieldChange={setFieldValue}

        onAvatarSelect={handleAvatarSelect}

        onCancel={handleCancel}

        onSubmit={handleSave}

      />

    );

  };



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

        <div className="pd-profile-page pd-section-enter">

          <div className="pd-profile-page-toolbar">

            <button

              type="button"

              className="pd-btn pd-btn-soft pd-back-link"

              onClick={handleBack}

            >

              <ArrowLeft size={16} aria-hidden="true" />

              {labels.backToProfile}

            </button>

          </div>



          <header className="pd-profile-page-header">

            <h1 className="pd-task-hub-title">{labels.editTitle}</h1>

            <p className="pd-task-hub-subtitle">{labels.editSubtitle}</p>

          </header>



          {renderContent()}

        </div>

      </AdminDashboardShell>



      {toast ? (

        <div className="pd-toast" role="status" aria-live="polite">

          {toast}

        </div>

      ) : null}

    </div>

  );

}
