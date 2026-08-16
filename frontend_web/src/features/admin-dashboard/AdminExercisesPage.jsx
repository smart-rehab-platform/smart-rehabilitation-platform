import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  buildAdminExerciseAddPath,
  buildAdminExerciseDetailsPath,
  buildAdminExerciseEditPath,
} from "../../routes/adminDashboardRoutes";
import { EXERCISE_ALL_CATEGORY_LABEL, canEditExercise } from "./utils/adminExercisesMappers";
import { useAdminExercises } from "./hooks/useAdminExercises";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import { AdminExercisesGrid } from "./sections/AdminExercisesGrid";
import { AdminExercisesToolbar } from "./sections/AdminExercisesToolbar";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminExercisesSections.css";

export default function AdminExercisesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    labels,
    exercises,
    filteredExercises,
    categoryFilterOptions,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    isLoading,
    error,
    refresh,
  } = useAdminExercises();

  const editActor = useMemo(() => ({
    userId: user?.id ?? null,
    role: user?.role ?? adminUser?.role ?? null,
  }), [adminUser?.role, user?.id, user?.role]);

  const canEditExerciseForUser = useCallback(
    (exercise) => canEditExercise(exercise, editActor),
    [editActor],
  );

  const emptyKind = useMemo(() => {
    if (isLoading || error) {
      return null;
    }

    if (exercises.length === 0) {
      return "no-exercises";
    }

    if (filteredExercises.length === 0 && hasActiveFilters) {
      return "no-matches";
    }

    return null;
  }, [error, exercises.length, filteredExercises.length, hasActiveFilters, isLoading]);

  const handleAddExercise = useCallback(() => {
    navigate(buildAdminExerciseAddPath());
  }, [navigate]);

  const handleOpenExercise = useCallback((exerciseId) => {
    navigate(buildAdminExerciseDetailsPath(exerciseId));
  }, [navigate]);

  const handleEditExercise = useCallback((exerciseId) => {
    navigate(buildAdminExerciseEditPath(exerciseId));
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(EXERCISE_ALL_CATEGORY_LABEL);
  }, [setSearchQuery, setSelectedCategory]);

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
        <AdminExercisesToolbar
          searchQuery={searchQuery}
          categoryFilterOptions={categoryFilterOptions}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onAddExercise={handleAddExercise}
        />

        {error ? (
          <div className="pd-admin-exercises-error pd-section-enter">
            <p className="pd-inline-error">{error}</p>
            <button type="button" className="pd-btn pd-btn-soft" onClick={refresh}>
              {labels.retry}
            </button>
          </div>
        ) : (
          <AdminExercisesGrid
            labels={labels}
            exercises={filteredExercises}
            isLoading={isLoading}
            emptyKind={emptyKind}
            canEditExercise={canEditExerciseForUser}
            onOpenExercise={handleOpenExercise}
            onEditExercise={handleEditExercise}
            onAddExercise={handleAddExercise}
            onClearFilters={handleClearFilters}
          />
        )}
      </AdminDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
