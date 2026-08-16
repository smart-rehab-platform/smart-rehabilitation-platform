import { useCallback, useEffect, useMemo, useState } from "react";

import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";

import {

  buildParentComplaintsPath,

} from "../../routes/parentDashboardRoutes";

import { ParentDashboardShell } from "./layout/ParentDashboardShell";

import { ParentComplaintForm } from "./components/complaints/ParentComplaintForm";

import {

  ParentComplaintFormHeader,

  ParentComplaintFormIntro,

} from "./components/complaints/ParentComplaintList";

import { useParentComplaintForm } from "./hooks/useParentComplaints";

import { useParentNotifications } from "./hooks/useParentNotifications";

import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";

import { mapParentFromAuth } from "./utils/parentDashboardMappers";

import "./styles/parentDashboardTokens.css";

import "./styles/parentComplaintsSections.css";



export default function ParentComplaintFormPage() {

  const navigate = useNavigate();

  const { t } = useLocale();
  const { user, isInitializing } = useAuth();

  const parentUserId = isInitializing ? null : user?.id ?? null;



  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [toast, setToast] = useState(null);



  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const {

    children,

    specialists,

    form,

    attachmentFile,

    formErrors,

    isLoadingChildren,

    isLoadingSpecialists,

    isUploadingAttachment,

    isSubmitting,

    submitError,

    childrenError,

    updateField,

    selectAttachment,

    clearAttachment,

    submitComplaint,

    refetchChildren,

  } = useParentComplaintForm(parentUserId);



  const {

    notifications,

    unreadCount,

    messageUnreadCount,

    isLoadingNotifications,

    notificationsError,

    markNotificationRead,

  } = useParentNotifications(parentUserId);



  const showToast = useCallback((message) => {

    setToast(message);

  }, []);



  const closeMobileNav = useCallback(() => {

    setMobileNavOpen(false);

  }, []);



  const navigation = useParentDashboardNavigation({

    selectedChildId: null,

    exercises: [],

    upcomingSession: null,

    latestReport: null,

    markNotificationRead,

    showToast,

    closeMobileNav,

  });



  useEffect(() => {

    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 2400);

    return () => window.clearTimeout(timer);

  }, [toast]);



  useEffect(() => {

    const onResize = () => {

      if (window.innerWidth > 900) {

        setMobileNavOpen(false);

      }

    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);

  }, []);



  useEffect(() => {

    if (!mobileNavOpen) return undefined;

    document.body.classList.add("pd-preview-drawer-open");

    return () => document.body.classList.remove("pd-preview-drawer-open");

  }, [mobileNavOpen]);



  const badges = useMemo(() => ({

    notifications:

      !notificationsError && !isLoadingNotifications && unreadCount > 0

        ? unreadCount

        : null,

    messages: messageUnreadCount > 0 ? messageUnreadCount : null,

  }), [

    notificationsError,

    isLoadingNotifications,

    unreadCount,

    messageUnreadCount,

  ]);



  const handleBack = useCallback(() => {

    navigate(buildParentComplaintsPath());

  }, [navigate]);



  const handleCancel = useCallback(() => {

    navigate(buildParentComplaintsPath());

  }, [navigate]);



  const handleMyComplaints = useCallback(() => {

    navigate(buildParentComplaintsPath());

  }, [navigate]);



  const handleSubmit = useCallback(async () => {

    const result = await submitComplaint();

    if (result.ok) {

      showToast(t("parent.pages.complaints.submitSuccess"));

      navigate(buildParentComplaintsPath());

    }

  }, [navigate, showToast, submitComplaint, t]);



  const renderContent = () => {

    if (isLoadingChildren) {

      return (

        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">

          <p className="pd-inline-loading">{t("parent.pages.complaints.loadingChildren")}</p>

        </section>

      );

    }



    if (childrenError) {

      return (

        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">

          <p className="pd-inline-error">{childrenError}</p>

          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchChildren}>

            {t("parent.common.retry")}

          </button>

        </section>

      );

    }



    if (children.length === 0) {

      return (

        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">

          <p>{t("parent.pages.complaints.noChildren")}</p>

        </section>

      );

    }



    return (

      <div className="pd-parent-complaints-stack pd-section-enter">

        <ParentComplaintFormIntro />

        <ParentComplaintForm

          children={children}

          specialists={specialists}

          form={form}

          formErrors={formErrors}

          attachmentFile={attachmentFile}

          isSubmitting={isSubmitting}

          isLoadingSpecialists={isLoadingSpecialists}

          isUploadingAttachment={isUploadingAttachment}

          submitError={submitError}

          onFieldChange={updateField}

          onSelectAttachment={selectAttachment}

          onClearAttachment={clearAttachment}

          onSubmit={handleSubmit}

          onCancel={handleCancel}

        />

      </div>

    );

  };



  return (

    <div className="pd-preview">

      <ParentDashboardShell

        collapsed={sidebarCollapsed}

        mobileOpen={mobileNavOpen}

        badges={badges}

        parent={parent}

        notifications={notifications}

        notificationsOpen={notificationsOpen}

        onNotificationsOpenChange={setNotificationsOpen}

        notificationsLoading={isLoadingNotifications}

        notificationsError={notificationsError}

        onNotificationSelect={navigation.handleNotificationSelect}

        onViewAllNotifications={navigation.handleViewAllNotifications}

        onSignOut={navigation.handleSignOut}

        onViewProfile={navigation.handleViewProfile}

        onMessages={navigation.handleMessages}

        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}

        onOpenMobileNav={() => setMobileNavOpen(true)}

        onCloseMobile={closeMobileNav}

        onNavAction={navigation.handleSidebarNav}

      >

        <div className="pd-task-hub-page pd-parent-complaint-form-page pd-section-enter">

          <div className="pd-parent-complaint-form-layout">

            <div className="pd-parent-complaint-form-back">

              <button

                type="button"

                className="pd-btn pd-btn-soft"

                onClick={handleBack}

              >

                <ArrowLeft size={16} aria-hidden="true" />

                {t("parent.common.backToMyComplaints")}

              </button>

            </div>



            <div className="pd-parent-complaint-form-page-header">

              <header className="pd-task-hub-header">

                <h1 className="pd-task-hub-title">{t("parent.pages.complaints.formTitle")}</h1>

                <p className="pd-task-hub-subtitle">

                  {t("parent.pages.complaints.formSubtitle")}

                </p>

              </header>

              <ParentComplaintFormHeader onMyComplaints={handleMyComplaints} />

            </div>



            <div className="pd-parent-complaint-form-shell">

              {renderContent()}

            </div>

          </div>

        </div>

      </ParentDashboardShell>



      {toast ? (

        <div className="pd-toast" role="status" aria-live="polite">

          {toast}

        </div>

      ) : null}

    </div>

  );

}
