import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildAdminPatientDetailsPath } from "../../routes/adminDashboardRoutes";
import { useAdminAiCenter } from "./hooks/useAdminAiCenter";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminAiSummary } from "./sections/AdminAiSummary";
import { AdminLatestAiRecommendations } from "./sections/AdminLatestAiRecommendations";
import { AdminLatestAiReports } from "./sections/AdminLatestAiReports";
import { AdminLatestSpeechAnalyses } from "./sections/AdminLatestSpeechAnalyses";
import { AdminPatientsNeedingAttention } from "./sections/AdminPatientsNeedingAttention";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminAiCenterSections.css";

function scrollToSectionId(sectionId) {
  const node = document.getElementById(sectionId);
  if (!node) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

export default function AdminAiCenterPage() {
  const navigate = useNavigate();
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

  const { data, labels, isLoading, error, refresh } = useAdminAiCenter();

  const handleSelectPatient = useCallback((patientId) => {
    const path = buildAdminPatientDetailsPath(patientId);
    navigate(path);
  }, [navigate]);

  const handleScrollToSection = useCallback((sectionId) => {
    scrollToSectionId(sectionId);
  }, []);

  const showContent = !error;

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
        <section className="pd-admin-ai-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
          <div className="pd-admin-ai-heading">
            <h1 className="pd-section-title">{labels.title}</h1>
            <p className="pd-section-sub">{labels.subtitle}</p>
          </div>
        </section>

        {error ? (
          <div className="pd-admin-ai-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              {labels.retry}
            </button>
          </div>
        ) : null}

        {showContent ? (
          <>
            <AdminAiSummary
              data={data}
              labels={labels}
              isLoading={isLoading}
              onScrollToSection={handleScrollToSection}
            />

            <div className="pd-admin-ai-content pd-section-enter">
              <AdminPatientsNeedingAttention
                patients={data?.patientsNeedingAttention ?? []}
                labels={labels}
                isLoading={isLoading}
                onSelectPatient={handleSelectPatient}
              />

              <div className="pd-admin-ai-insights-grid">
                <AdminLatestSpeechAnalyses
                  records={data?.latestSpeechAnalyses ?? []}
                  labels={labels}
                  isLoading={isLoading}
                  onSelectPatient={handleSelectPatient}
                />
                <AdminLatestAiRecommendations
                  records={data?.latestRecommendations ?? []}
                  labels={labels}
                  isLoading={isLoading}
                  onSelectPatient={handleSelectPatient}
                />
              </div>

              <AdminLatestAiReports
                records={data?.latestReports ?? []}
                labels={labels}
                isLoading={isLoading}
              />
            </div>
          </>
        ) : null}
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
