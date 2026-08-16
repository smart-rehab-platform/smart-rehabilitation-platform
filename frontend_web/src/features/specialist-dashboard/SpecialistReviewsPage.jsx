import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import { buildSpecialistReviewExercisePath } from "../../routes/specialistDashboardRoutes";
import { useSpecialistReviews } from "./hooks/useSpecialistReviews";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { UserProfileAvatar } from "../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "./utils/specialistScheduleUtils";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistReviewsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
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

  const { reviews, isLoading, error, reload } = useSpecialistReviews(specialistUserId);

  const renderContent = () => {
    if (isLoading) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{t("specialist.reviews.loading")}</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={reload}>
            {t("common.retry")}
          </button>
        </section>
      );
    }

    if (reviews.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{t("specialist.reviews.empty")}</p>
        </section>
      );
    }

    return (
      <ul className="pd-specialist-reviews-list">
        {reviews.map((review) => (
          <li key={review.id}>
            <button
              type="button"
              className="pd-card pd-card-pad pd-specialist-reviews-row"
              onClick={() => navigate(buildSpecialistReviewExercisePath(review.id))}
            >
              <UserProfileAvatar
                imageUrl={null}
                initials={getInitials(review.patientName, "P")}
                alt=""
                shellClassName="pd-avatar pd-specialist-preview-avatar"
                fallbackClassName="pd-avatar pd-specialist-preview-avatar"
                className="pd-avatar-photo"
              />
              <span className="pd-specialist-reviews-row-copy">
                <strong dir="auto">{review.patientName}</strong>
                <span dir="auto">{review.exerciseTitle}</span>
                <span className="pd-section-sub">{review.submittedAgo}</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" className="pd-specialist-reviews-row-chevron" />
            </button>
          </li>
        ))}
      </ul>
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
        <div className="pd-task-hub-page">
          <div className="pd-task-hub-panel">
            <header className="pd-specialist-page-header">
              <h1 className="pd-section-title">{t("specialist.reviews.title")}</h1>
              <p className="pd-section-sub">{t("specialist.reviews.subtitle")}</p>
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
