import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import { buildSpecialistCaseRequestDetailPath } from "../../routes/specialistDashboardRoutes";
import { SpecialistCaseRequestCard } from "./components/SpecialistCaseRequestCard";
import { SpecialistCaseRequestFilters } from "./components/SpecialistCaseRequestFilters";
import { useSpecialistCaseRequests } from "./hooks/useSpecialistCaseRequests";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistCaseRequestsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;
  const loadMoreRef = useRef(null);

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
    items,
    categories,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    error,
    loadMoreError,
    searchInput,
    setSearchInput,
    statusFilterId,
    setStatusFilterId,
    categoryFilterId,
    setCategoryFilterId,
    hasActiveFilters,
    hasMore,
    emptyMessage,
    clearFilters,
    reload,
    loadMore,
  } = useSpecialistCaseRequests(specialistUserId);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    }, { rootMargin: "240px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, items.length]);

  const handleCardClick = useCallback((item) => {
    navigate(buildSpecialistCaseRequestDetailPath(item.id));
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
        <div className="pd-task-hub-page pd-specialist-case-requests-page">
          <header className="pd-task-hub-header">
            <div>
              <h1>{t("specialist.caseRequests.title")}</h1>
              <p className="pd-section-sub">
                {t("specialist.caseRequests.subtitle")}
              </p>
            </div>
          </header>

          <SpecialistCaseRequestFilters
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            statusFilterId={statusFilterId}
            onStatusChange={setStatusFilterId}
            categoryFilterId={categoryFilterId}
            onCategoryChange={setCategoryFilterId}
            categories={categories}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {isRefreshing ? (
            <div className="pd-specialist-case-refresh-bar" aria-hidden="true" />
          ) : null}

          {isInitialLoading ? (
            <div className="pd-specialist-case-request-list" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="pd-card pd-card-pad pd-specialist-case-request-skeleton"
                />
              ))}
            </div>
          ) : null}

          {!isInitialLoading && error && items.length === 0 ? (
            <div className="pd-card pd-card-pad pd-specialist-case-state-card">
              <p>{error}</p>
              <button type="button" className="pd-btn pd-btn-primary" onClick={reload}>
                {t("common.retry")}
              </button>
            </div>
          ) : null}

          {!isInitialLoading && error && items.length > 0 ? (
            <div className="pd-card pd-card-pad pd-specialist-case-state-card">
              <p>{error}</p>
              <button type="button" className="pd-btn pd-btn-primary" onClick={reload}>
                {t("common.retry")}
              </button>
            </div>
          ) : null}

          {!isInitialLoading && !error && emptyMessage ? (
            <div className="pd-card pd-card-pad pd-specialist-case-state-card">
              <p>{emptyMessage}</p>
            </div>
          ) : null}
          {!isInitialLoading && items.length > 0 ? (
            <div className="pd-specialist-case-request-list">
              {items.map((item) => (
                <SpecialistCaseRequestCard
                  key={item.id}
                  item={item}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          ) : null}

          {loadMoreError ? (
            <div className="pd-specialist-case-load-more-error">
              <p>{loadMoreError}</p>
              <button type="button" className="pd-btn pd-btn-ghost" onClick={loadMore}>
                {t("common.retry")}
              </button>
            </div>
          ) : null}

          {hasMore ? <div ref={loadMoreRef} className="pd-specialist-case-load-more-sentinel" /> : null}

          {isLoadingMore ? (
            <div className="pd-specialist-case-loading-more">{t("specialist.caseRequests.loadingMore")}</div>
          ) : null}
        </div>

        {toast ? <div className="pd-toast" role="status">{toast}</div> : null}
      </SpecialistDashboardShell>
    </div>
  );
}
