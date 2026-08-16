import { useCallback, useEffect, useMemo, useState } from "react";

import { ArrowLeft } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

import { useLocale } from "../../context/useLocale.js";

import { buildParentComplaintsPath } from "../../routes/parentDashboardRoutes";

import { ParentDashboardShell } from "./layout/ParentDashboardShell";

import { ParentComplaintAttachmentPreview } from "./components/complaints/ParentComplaintAttachmentPreview";

import { ParentComplaintStatusBadge } from "./components/complaints/ParentComplaintStatusBadge";

import { useParentComplaintDetails } from "./hooks/useParentComplaints";

import { useParentNotifications } from "./hooks/useParentNotifications";

import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";

import { mapParentFromAuth } from "./utils/parentDashboardMappers";

import "./styles/parentDashboardTokens.css";

import "./styles/parentComplaintsSections.css";



export default function ParentComplaintDetailPage() {

  const navigate = useNavigate();

  const { complaintId } = useParams();

  const { t } = useLocale();

  const { user, isInitializing } = useAuth();

  const parentUserId = isInitializing ? null : user?.id ?? null;



  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [toast, setToast] = useState(null);



  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const { complaint, isLoading, error, refetch } = useParentComplaintDetails(complaintId);

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



  const renderContent = () => {

    if (isLoading) {

      return (

        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">

          <p className="pd-inline-loading">{t("parent.pages.complaints.loadingDetail")}</p>

        </section>

      );

    }



    if (error) {

      return (

        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">

          <p className="pd-inline-error">{error}</p>

          <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>

            {t("parent.common.retry")}

          </button>

        </section>

      );

    }



    if (!complaint) {

      return (

        <section className="pd-card pd-card-pad pd-task-hub-state pd-section-enter">

          <p>{t("parent.pages.complaints.notFound")}</p>

          <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>

            {t("parent.common.backToMyComplaints")}

          </button>

        </section>

      );

    }



    return (

      <div className="pd-parent-complaint-detail-stack pd-section-enter">

        <section className="pd-card pd-card-pad pd-parent-complaint-summary-card">

          <div className="pd-parent-complaint-detail-header">

            <h2>{complaint.categoryLabel}</h2>

            <ParentComplaintStatusBadge

              label={complaint.statusLabel}

              tone={complaint.statusTone}

            />

          </div>



          <dl className="pd-parent-complaint-info-grid">

            <div className="pd-parent-complaint-info-row">

              <dt>{t("parent.complaints.child")}</dt>

              <dd>{complaint.patientName}</dd>

            </div>

            <div className="pd-parent-complaint-info-row">

              <dt>{t("parent.complaints.specialist")}</dt>

              <dd>{complaint.specialistName}</dd>

            </div>

            <div className="pd-parent-complaint-info-row">

              <dt>{t("parent.complaints.submitted")}</dt>

              <dd>{complaint.submittedLabel}</dd>

            </div>

            <div className="pd-parent-complaint-info-row">

              <dt>{t("parent.complaints.statusLabel")}</dt>

              <dd>{complaint.statusLabel}</dd>

            </div>

          </dl>

        </section>



        <div

          className={`pd-parent-complaint-detail-body${

            complaint.attachmentResolvedUrl ? " has-aside" : ""

          }`}

        >

          <div className="pd-parent-complaint-detail-main">

            <section className="pd-card pd-card-pad pd-parent-complaint-section">

              <h2 className="pd-parent-complaint-section-title">{t("parent.pages.complaints.description")}</h2>

              <p className="pd-parent-complaint-description" dir="auto">{complaint.description}</p>

            </section>



            {complaint.parentResponse ? (

              <section className="pd-card pd-card-pad pd-parent-complaint-section">

                <h2 className="pd-parent-complaint-section-title">{t("parent.pages.complaints.adminResponse")}</h2>

                <p className="pd-parent-complaint-admin-response" dir="auto">{complaint.parentResponse}</p>

              </section>

            ) : null}

          </div>



          {complaint.attachmentResolvedUrl ? (

            <aside className="pd-parent-complaint-detail-aside">

              <ParentComplaintAttachmentPreview

                attachmentUrl={complaint.attachmentUrl}

                attachmentResolvedUrl={complaint.attachmentResolvedUrl}

                onOpenError={showToast}

              />

            </aside>

          ) : null}

        </div>

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

        <div className="pd-task-hub-page pd-parent-complaint-detail-page pd-section-enter">

          <div className="pd-task-hub-toolbar">

            <button

              type="button"

              className="pd-btn pd-btn-soft"

              onClick={handleBack}

            >

              <ArrowLeft size={16} aria-hidden="true" />

              {t("parent.common.backToMyComplaints")}

            </button>

          </div>



          <header className="pd-task-hub-header">

            <h1 className="pd-task-hub-title">{t("parent.pages.complaints.detailTitle")}</h1>

            <p className="pd-task-hub-subtitle">

              {t("parent.pages.complaints.detailSubtitle")}

            </p>

          </header>



          {renderContent()}

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
