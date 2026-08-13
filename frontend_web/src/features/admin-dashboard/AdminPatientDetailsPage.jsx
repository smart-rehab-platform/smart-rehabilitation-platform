import { useCallback, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_WEB_ROUTES } from "../../routes/adminDashboardRoutes";
import { useAdminPatientDetails } from "./hooks/useAdminPatientDetails";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminPatientActions } from "./sections/AdminPatientActions";
import { AdminPatientAssignedExercises } from "./sections/AdminPatientAssignedExercises";
import { AdminPatientGoals } from "./sections/AdminPatientGoals";
import { AdminPatientNotes } from "./sections/AdminPatientNotes";
import {
  AdminPatientOverview,
  AdminPatientOverviewSkeleton,
} from "./sections/AdminPatientOverview";
import {
  AdminPatientQuickStats,
  AdminPatientQuickStatsSkeleton,
} from "./sections/AdminPatientQuickStats";
import { AdminPatientRecentSubmissions } from "./sections/AdminPatientRecentSubmissions";
import { AdminPatientTreatmentPlan } from "./sections/AdminPatientTreatmentPlan";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminPatientDetailsSections.css";

function AdminPatientDetailsSkeleton() {
  return (
    <div className="pd-admin-patient-details">
      <AdminPatientOverviewSkeleton />
      <AdminPatientQuickStatsSkeleton />
      <div className="pd-admin-patient-details-grid">
        <div className="pd-admin-patient-details-main">
          {[0, 1, 2].map((index) => (
            <section key={index} className="pd-admin-patient-section pd-admin-patient-skeleton-card" aria-hidden="true">
              <span className="pd-admin-patient-skeleton-line is-section-title" />
              <div className="pd-card pd-card-pad">
                <span className="pd-admin-patient-skeleton-line is-wide" />
                <span className="pd-admin-patient-skeleton-line" />
              </div>
            </section>
          ))}
        </div>
        <div className="pd-admin-patient-details-side">
          {[0, 1, 2].map((index) => (
            <section key={index} className="pd-admin-patient-section pd-admin-patient-skeleton-card" aria-hidden="true">
              <span className="pd-admin-patient-skeleton-line is-section-title" />
              <div className="pd-card pd-card-pad">
                <span className="pd-admin-patient-skeleton-line is-wide" />
                <span className="pd-admin-patient-skeleton-line" />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPatientDetailsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const goalsRef = useRef(null);
  const exercisesRef = useRef(null);
  const submissionsRef = useRef(null);

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

  const { details, isLoading, error, refetch } = useAdminPatientDetails(patientId);

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.patients);
  }, [navigate]);

  const scrollToSection = useCallback((target) => {
    const map = {
      goals: goalsRef,
      exercises: exercisesRef,
      submissions: submissionsRef,
    };
    const node = map[target]?.current;
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  let body;

  if (isLoading) {
    body = <AdminPatientDetailsSkeleton />;
  } else if (error) {
    body = (
      <section className="pd-card pd-card-pad pd-admin-patient-error pd-section-enter">
        <p className="pd-inline-error">{error}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
          Retry
        </button>
      </section>
    );
  } else if (!details) {
    body = (
      <section className="pd-card pd-card-pad pd-section-enter">
        <p className="pd-admin-patient-empty-copy">Patient not found.</p>
      </section>
    );
  } else {
    body = (
      <div className="pd-admin-patient-details">
        <button type="button" className="pd-btn pd-btn-soft pd-admin-patient-back" onClick={handleBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Patients
        </button>

        <AdminPatientOverview
          patient={details.patient}
          conditionLabel={details.conditionLabel}
          overallProgressPercent={details.overallProgressPercent}
        />

        <AdminPatientQuickStats stats={details.stats} onStatClick={scrollToSection} />

        <div className="pd-admin-patient-details-grid">
          <div className="pd-admin-patient-details-main">
            <AdminPatientTreatmentPlan treatmentPlan={details.treatmentPlan} />
            <div ref={goalsRef}>
              <AdminPatientGoals goals={details.goals} />
            </div>
            <div ref={exercisesRef}>
              <AdminPatientAssignedExercises exercises={details.assignedExercises} />
            </div>
          </div>

          <div className="pd-admin-patient-details-side">
            <div ref={submissionsRef}>
              <AdminPatientRecentSubmissions submissions={details.recentSubmissions} />
            </div>
            <AdminPatientNotes notes={details.notes} />
            <AdminPatientActions patientId={patientId} />
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
    </div>
  );
}
