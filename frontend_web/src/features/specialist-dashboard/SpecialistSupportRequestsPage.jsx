import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  buildSpecialistSupportRequestDetailPath,
  buildSpecialistSupportRequestNewPath,
} from "../../routes/specialistDashboardRoutes";
import {
  buildSupportRequestCategoryFilterOptions,
  buildSupportRequestStatusFilterOptions,
} from "../shared-dashboard/utils/supportRequestMappers";
import { SpecialistSupportRequestListItem } from "./components/supportRequests/SpecialistSupportRequestListItem";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { useSpecialistSupportRequests } from "./hooks/useSpecialistSupportRequests";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { getSpecialistSupportPageLabels } from "./utils/specialistSupportRequestsLocalization.js";
import "../shared-dashboard/styles/dashboardTokens.css";
import "../shared-dashboard/styles/supportRequestSections.css";
import "./styles/specialistDashboardSections.css";

export default function SpecialistSupportRequestsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistSupportPageLabels(t), [t]);
  const statusFilterOptions = useMemo(() => buildSupportRequestStatusFilterOptions(t), [t]);
  const categoryFilterOptions = useMemo(() => buildSupportRequestCategoryFilterOptions(t), [t]);
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const shell = useSpecialistShell(specialistUserId);
  const {
    requests,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    clearFilters,
    isLoading,
    error,
    refetch,
  } = useSpecialistSupportRequests();

  const handleCreate = useCallback(() => {
    navigate(buildSpecialistSupportRequestNewPath());
  }, [navigate]);

  const handleOpen = useCallback((requestId) => {
    navigate(buildSpecialistSupportRequestDetailPath(requestId));
  }, [navigate]);

  return (
    <div className="pd-preview">
      <SpecialistDashboardShell
        collapsed={shell.sidebarCollapsed}
        mobileOpen={shell.mobileNavOpen}
        navItems={shell.navItems}
        badges={shell.badges}
        user={shell.specialist}
        notifications={shell.notifications}
        notificationsOpen={shell.notificationsOpen}
        onNotificationsOpenChange={shell.setNotificationsOpen}
        notificationsLoading={shell.isLoadingNotifications}
        notificationsError={shell.notificationsError}
        onNotificationSelect={shell.handleNotificationSelect}
        onViewAllNotifications={shell.handleViewAllNotifications}
        onSignOut={shell.handleSignOut}
        onViewProfile={shell.handleViewProfile}
        onMessages={shell.handleMessages}
        onToggleCollapse={() => shell.setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => shell.setMobileNavOpen(true)}
        onCloseMobile={shell.closeMobileNav}
        onNavAction={shell.handleSidebarNav}
        showToast={shell.showToast}
      >
        <div className="pd-support-request-page pd-section-enter">
          <div className="pd-support-request-page-header">
            <div className="pd-support-request-page-copy">
              <h1 className="pd-task-hub-title">{pageLabels.title}</h1>
              <p className="pd-task-hub-subtitle">
                {pageLabels.subtitle}
              </p>
            </div>
            <button type="button" className="pd-btn pd-btn-primary" onClick={handleCreate}>
              <Plus size={16} aria-hidden="true" />
              {pageLabels.newRequest}
            </button>
          </div>

          <section className="pd-card pd-card-pad">
            <div className="pd-support-request-filters">
              <label className="pd-form-field">
                <span className="pd-form-label">{pageLabels.statusLabel}</span>
                <select
                  className="pd-form-input"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                >
                  <option value="">{t("supportRequests.filters.allStatuses")}</option>
                  {statusFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="pd-form-field">
                <span className="pd-form-label">{pageLabels.categoryLabel}</span>
                <select
                  className="pd-form-input"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="">{t("supportRequests.filters.allCategories")}</option>
                  {categoryFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
            {hasActiveFilters ? (
              <button type="button" className="pd-btn pd-btn-soft" onClick={clearFilters}>
                {pageLabels.clearFilters}
              </button>
            ) : null}
          </section>

          {isLoading ? (
            <section className="pd-card pd-card-pad">
              <p className="pd-inline-loading">{pageLabels.loading}</p>
            </section>
          ) : null}

          {!isLoading && error ? (
            <section className="pd-card pd-card-pad">
              <p className="pd-inline-error">{error}</p>
              <button type="button" className="pd-btn pd-btn-soft" onClick={refetch}>
                {t("common.retry")}
              </button>
            </section>
          ) : null}

          {!isLoading && !error && requests.length === 0 ? (
            <section className="pd-card pd-card-pad">
              <p>{hasActiveFilters ? pageLabels.emptyFiltered : pageLabels.empty}</p>
            </section>
          ) : null}

          {!isLoading && !error && requests.length > 0 ? (
            <div className="pd-support-request-list">
              {requests.map((request) => (
                <SpecialistSupportRequestListItem
                  key={request.id}
                  request={request}
                  onSelect={handleOpen}
                />
              ))}
            </div>
          ) : null}
        </div>
      </SpecialistDashboardShell>

      {shell.toast ? (
        <div className="pd-toast" role="status" aria-live="polite">{shell.toast}</div>
      ) : null}
    </div>
  );
}
