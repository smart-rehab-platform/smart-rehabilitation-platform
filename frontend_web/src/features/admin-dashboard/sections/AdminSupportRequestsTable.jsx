import { SupportRequestStatusBadge } from "../../shared-dashboard/components/supportRequests/SupportRequestStatusBadge";
import { useLocale } from "../../../context/useLocale.js";
import { AdminTablePrimaryAction } from "../components/AdminTablePrimaryAction";
import {
  buildSupportRequestCategoryFilterOptions,
  buildSupportRequestStatusFilterOptions,
} from "../../shared-dashboard/utils/supportRequestMappers";

export function AdminSupportRequestsToolbar({
  labels,
  selectedStatus,
  selectedCategory,
  selectedSpecialistId,
  specialistOptions,
  specialistsError,
  isRefreshing,
  onStatusChange,
  onCategoryChange,
  onSpecialistChange,
  onClearFilters,
  hasActiveFilters,
  onRefresh,
}) {
  const { t } = useLocale();
  const statusFilterOptions = buildSupportRequestStatusFilterOptions(t);
  const categoryFilterOptions = buildSupportRequestCategoryFilterOptions(t);

  return (
    <section
      className="pd-admin-support-requests-toolbar pd-section-enter"
      aria-label={labels.toolbarAriaLabel}
    >
      <div className="pd-admin-complaints-toolbar-heading">
        <div>
          <h1 className="pd-task-hub-title">{labels.title}</h1>
          <p className="pd-task-hub-subtitle">{labels.subtitle}</p>
        </div>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRefresh}>
          {isRefreshing ? labels.refreshing : labels.refresh}
        </button>
      </div>

      <div className="pd-admin-support-requests-controls">
        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.statusLabel}</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedStatus}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="">{t("supportRequests.filters.allStatuses")}</option>
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.categoryLabel}</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">{t("supportRequests.filters.allCategories")}</option>
            {categoryFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.specialistLabel}</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedSpecialistId}
            onChange={(event) => onSpecialistChange(event.target.value)}
          >
            <option value="">{t("supportRequests.filters.allSpecialists")}</option>
            {specialistOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.filtersLabel}</span>
          <button
            type="button"
            className="pd-btn pd-btn-soft pd-admin-complaints-clear"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            {labels.clearFilters}
          </button>
        </div>
      </div>

      {specialistsError ? (
        <p className="pd-inline-error">{specialistsError}</p>
      ) : null}
    </section>
  );
}

export function AdminSupportRequestsTable({
  labels,
  requests,
  isLoading,
  emptyKind,
  onViewRequest,
}) {
  if (isLoading) {
    return (
      <section className="pd-card pd-card-pad">
        <p className="pd-inline-loading">{labels.loading}</p>
      </section>
    );
  }

  if (emptyKind === "no-requests") {
    return (
      <section className="pd-card pd-card-pad pd-admin-complaints-empty">
        <p>{labels.empty}</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-complaints-empty">
        <p>{labels.emptyFiltered}</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-support-requests-table-wrap">
      <table className="pd-admin-support-requests-table" aria-label={labels.tableAriaLabel}>
        <thead>
          <tr>
            <th>{labels.columns.specialist}</th>
            <th>{labels.columns.subject}</th>
            <th>{labels.columns.category}</th>
            <th>{labels.columns.status}</th>
            <th>{labels.columns.lastActivity}</th>
            <th>{labels.columns.created}</th>
            <th>{labels.columns.action}</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td data-label={labels.columns.specialist}>{request.specialistName}</td>
              <td data-label={labels.columns.subject}>{request.subject}</td>
              <td data-label={labels.columns.category}>{request.categoryLabel}</td>
              <td data-label={labels.columns.status}>
                <SupportRequestStatusBadge
                  status={request.status}
                  label={request.statusLabel}
                  tone={request.statusTone}
                />
              </td>
              <td data-label={labels.columns.lastActivity}>{request.lastMessageAtLabel}</td>
              <td data-label={labels.columns.created}>{request.createdAtLabel}</td>
              <td data-label={labels.columns.action}>
                <AdminTablePrimaryAction
                  className="pd-admin-complaints-view-btn"
                  onClick={() => onViewRequest(request.id)}
                >
                  {labels.view}
                </AdminTablePrimaryAction>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
