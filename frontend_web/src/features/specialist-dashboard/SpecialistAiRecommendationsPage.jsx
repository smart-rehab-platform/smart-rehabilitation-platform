import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  buildSpecialistPatientDetailPath,
  SPECIALIST_WEB_ROUTES,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistAiGenerateCard } from "./components/SpecialistAiGenerateCard";
import { SpecialistAiPatientHeader } from "./components/SpecialistAiPatientHeader";
import { useSpecialistAiRecommendations } from "./hooks/useSpecialistAiRecommendations";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistAiRecommendationsList } from "./sections/SpecialistAiRecommendationsList";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistAiRecommendationsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const {
    specialist,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    notifications,
    isLoadingNotifications,
    notificationsError,
    unreadCount,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
  } = useSpecialistShell(specialistUserId);

  const {
    bundle,
    recommendations,
    isLoading,
    isGenerating,
    generatingTypeId,
    updatingRecommendationId,
    error,
    reload,
    generateExerciseSuggestion,
    generatePlanAdjustment,
    accept,
    reject,
  } = useSpecialistAiRecommendations(specialistUserId, patientId);

  const handleBack = useCallback(() => {
    if (patientId) {
      navigate(buildSpecialistPatientDetailPath(patientId));
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.patients);
  }, [navigate, patientId]);

  const handleGenerateExercise = useCallback(async () => {
    const result = await generateExerciseSuggestion();
    if (result.ok) {
      showToast(result.message);
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [generateExerciseSuggestion, showToast]);

  const handleGeneratePlanAdjustment = useCallback(async () => {
    const result = await generatePlanAdjustment();
    if (result.ok) {
      showToast(result.message);
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [generatePlanAdjustment, showToast]);

  const handleAccept = useCallback(async (recommendationId) => {
    const result = await accept(recommendationId);
    if (result.ok) {
      showToast(result.message);
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [accept, showToast]);

  const handleReject = useCallback(async (recommendationId) => {
    const result = await reject(recommendationId);
    if (result.ok) {
      showToast(result.message);
      return;
    }
    if (result.message) {
      showToast(result.message);
    }
  }, [reject, showToast]);

  const renderContent = () => {
    if (isLoading && !bundle) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading AI recommendations...</p>
        </section>
      );
    }

    if (error && !bundle) {
      const isUnauthorized = error.includes("not assigned") || error.includes("not found");
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className={isUnauthorized ? "pd-section-sub" : "pd-inline-error"}>{error}</p>
          {!isUnauthorized ? (
            <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
              Retry
            </button>
          ) : null}
        </section>
      );
    }

    if (!bundle) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">Loading AI recommendations...</p>
        </section>
      );
    }

    return (
      <div className="pd-specialist-ai-stack">
        <SpecialistAiPatientHeader patientName={bundle.patientName} />
        <SpecialistAiGenerateCard
          isGenerating={isGenerating}
          generatingTypeId={generatingTypeId}
          onGenerateExercise={handleGenerateExercise}
          onGeneratePlanAdjustment={handleGeneratePlanAdjustment}
        />
        <section className="pd-specialist-ai-recommendations-section">
          <h2 className="pd-specialist-ai-section-title">Recommendations</h2>
          {error ? (
            <div className="pd-card pd-card-pad pd-inline-error-card">
              <p className="pd-inline-error">{error}</p>
              <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
                Retry
              </button>
            </div>
          ) : null}
          <SpecialistAiRecommendationsList
            recommendations={recommendations}
            updatingRecommendationId={updatingRecommendationId}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </section>
      </div>
    );
  };

  return (
    <div className="pd-preview">
      <SpecialistDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={specialist}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        notificationBadgeCount={unreadCount}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onMessages={handleMessages}
        onViewAllNotifications={handleViewAllNotifications}
        onNotificationSelect={handleNotificationSelect}
        showToast={showToast}
      >
        <div className="pd-task-hub-page pd-specialist-ai-shell">
          <div className="pd-task-hub-panel pd-specialist-ai-page">
            <header className="pd-specialist-treatment-plan-page-header">
              <button
                type="button"
                className="pd-specialist-back-btn"
                onClick={handleBack}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Back to Patient
              </button>
              <h1 className="pd-section-title">AI Recommendations</h1>
            </header>
            {renderContent()}
          </div>
        </div>
      </SpecialistDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
