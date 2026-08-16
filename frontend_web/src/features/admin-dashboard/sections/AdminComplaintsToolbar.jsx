import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  buildAdminComplaintCategoryFilterOptions,
  buildAdminComplaintStatusFilterOptions,
  getAdminComplaintsLabels,
} from "../utils/adminComplaintsLocalization.js";

export function AdminComplaintsToolbar({
  selectedStatus,
  selectedCategory,
  selectedSpecialistId,
  specialistOptions = [],
  specialistsError = null,
  fromDate,
  toDate,
  dateRangeError = null,
  hasActiveFilters = false,
  isRefreshing = false,
  onStatusChange,
  onCategoryChange,
  onSpecialistChange,
  onFromDateChange,
  onToDateChange,
  onClearFilters,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);
  const statusFilterOptions = useMemo(() => buildAdminComplaintStatusFilterOptions(t), [t]);
  const categoryFilterOptions = useMemo(() => buildAdminComplaintCategoryFilterOptions(t), [t]);

  return (
    <section className="pd-admin-complaints-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-complaints-heading">
        <h1 className="pd-section-title">{labels.title}</h1>
        <p className="pd-section-sub">{labels.subtitle}</p>
      </div>

      {isRefreshing ? (
        <div className="pd-admin-complaints-refresh-bar" aria-live="polite">
          <span className="pd-admin-complaints-refresh-track">
            <span className="pd-admin-complaints-refresh-indicator" />
          </span>
          <span className="pd-sr-only">{labels.updating}</span>
        </div>
      ) : null}

      <div className="pd-admin-complaints-controls">
        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.statusLabel}</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedStatus}
            onChange={(event) => onStatusChange?.(event.target.value)}
          >
            <option value="">{labels.allStatuses}</option>
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.categoryLabel}</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedCategory}
            onChange={(event) => onCategoryChange?.(event.target.value)}
          >
            <option value="">{labels.allCategories}</option>
            {categoryFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.specialistLabel}</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedSpecialistId}
            onChange={(event) => onSpecialistChange?.(event.target.value)}
          >
            <option value="">{labels.allSpecialists}</option>
            {specialistOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.fromLabel}</span>
          <input
            type="date"
            className="pd-admin-complaints-control"
            value={fromDate}
            onChange={(event) => onFromDateChange?.(event.target.value)}
          />
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">{labels.toLabel}</span>
          <input
            type="date"
            className="pd-admin-complaints-control"
            value={toDate}
            onChange={(event) => onToDateChange?.(event.target.value)}
          />
        </label>

        {hasActiveFilters ? (
          <div className="pd-admin-complaints-clear-wrap">
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-admin-complaints-clear"
              onClick={onClearFilters}
            >
              {labels.clearFilters}
            </button>
          </div>
        ) : null}
      </div>

      {specialistsError ? (
        <p className="pd-admin-complaints-inline-warning" role="status">
          {labels.specialistFilterUnavailable(specialistsError)}
        </p>
      ) : null}

      {dateRangeError ? (
        <p className="pd-inline-error pd-admin-complaints-date-error" role="alert">
          {dateRangeError}
        </p>
      ) : null}
    </section>
  );
}
