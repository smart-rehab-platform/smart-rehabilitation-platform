import { useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

import { useLocale } from "../../context/useLocale.js";

import { buildAdminEditProfilePath } from "../../routes/adminDashboardRoutes";

import { AdminProfileErrorState } from "./components/profile/AdminProfileErrorState";

import { AdminProfileHeader } from "./components/profile/AdminProfileHeader";

import { AdminAccountInfo, AdminPersonalInfo } from "./components/profile/AdminProfileInfoCards";

import { useAdminProfile } from "./hooks/useAdminProfile";

import { useAdminShell } from "./hooks/useAdminShell";

import { AdminDashboardShell } from "./layout/AdminDashboardShell";

import { getAdminProfilePageLabels } from "./utils/adminProfileLocalization.js";

import "../shared-dashboard/styles/dashboardTokens.css";

import "./styles/adminDashboardSections.css";



export default function AdminProfilePage() {

  const navigate = useNavigate();

  const { t } = useLocale();

  const labels = useMemo(() => getAdminProfilePageLabels(t), [t]);

  const { user, isInitializing } = useAuth();

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

  } = useAdminProfile(adminUserId);



  const handleEdit = useCallback(() => {

    navigate(buildAdminEditProfilePath());

  }, [navigate]);



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

      <div className="pd-profile-layout pd-section-enter">

        <AdminProfileHeader profile={profile} labels={labels} onEdit={handleEdit} />

        <div className="pd-profile-info-grid">

          <AdminPersonalInfo profile={profile} labels={labels} />

          <AdminAccountInfo profile={profile} labels={labels} />

        </div>

      </div>

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

          <header className="pd-profile-page-header">

            <h1 className="pd-task-hub-title">{labels.title}</h1>

            <p className="pd-task-hub-subtitle">{labels.subtitle}</p>

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
