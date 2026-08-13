import { Plus } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  buildSpecialistCreateExercisePath,
  buildSpecialistExerciseDetailPath,
} from "../../routes/specialistDashboardRoutes";
import { useSpecialistExercises } from "./hooks/useSpecialistExercises";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { SpecialistExerciseLibraryGrid } from "./sections/SpecialistExerciseLibraryGrid";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistExercisesPage() {
  const navigate = useNavigate();
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
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
    showToast,
  } = useSpecialistShell(specialistUserId);

  const {
    exercises,
    visibleExercises,
    categoryFilters,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    emptyMessage,
    reload,
  } = useSpecialistExercises(Boolean(specialistUserId));

  const handleExerciseClick = useCallback((exercise) => {
    if (!exercise?.id) {
      return;
    }
    navigate(buildSpecialistExerciseDetailPath(exercise.id));
  }, [navigate]);

  const handleAddExercise = useCallback(() => {
    navigate(buildSpecialistCreateExercisePath());
  }, [navigate]);

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
        <div className="pd-specialist-exercises-page">
          <header className="pd-specialist-exercise-page-header pd-specialist-exercise-page-header--library">
            <div>
              <h1 className="pd-section-title">Exercise Library</h1>
              <p className="pd-section-sub">Browse therapy exercises by category and search.</p>
            </div>
            <button
              type="button"
              className="pd-btn pd-btn-primary pd-specialist-exercise-add-btn"
              onClick={handleAddExercise}
            >
              <Plus size={18} aria-hidden="true" />
              Add Exercise
            </button>
          </header>

          <SpecialistExerciseLibraryGrid
            exercises={exercises}
            visibleExercises={visibleExercises}
            categoryFilters={categoryFilters}
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            emptyMessage={emptyMessage}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onRetry={reload}
            onExerciseClick={handleExerciseClick}
          />
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
