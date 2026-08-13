import {
  COMPLAINT_CATEGORY_FILTER_OPTIONS,
  COMPLAINT_STATUS_FILTER_OPTIONS,
} from "../utils/adminComplaintsMappers";

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
  return (
    <section className="pd-admin-complaints-toolbar pd-section-enter" aria-label="Complaints toolbar">
      <div className="pd-admin-complaints-heading">
        <h1 className="pd-section-title">Complaints Management</h1>
        <p className="pd-section-sub">
          Review specialist complaints submitted by parents and manage review actions.
        </p>
      </div>

      {isRefreshing ? (
        <div className="pd-admin-complaints-refresh-bar" aria-live="polite">
          <span className="pd-admin-complaints-refresh-track">
            <span className="pd-admin-complaints-refresh-indicator" />
          </span>
          <span className="pd-sr-only">Updating complaints</span>
        </div>
      ) : null}

      <div className="pd-admin-complaints-controls">
        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">Status</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedStatus}
            onChange={(event) => onStatusChange?.(event.target.value)}
          >
            <option value="">All statuses</option>
            {COMPLAINT_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">Category</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedCategory}
            onChange={(event) => onCategoryChange?.(event.target.value)}
          >
            <option value="">All categories</option>
            {COMPLAINT_CATEGORY_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">Specialist</span>
          <select
            className="pd-admin-complaints-control"
            value={selectedSpecialistId}
            onChange={(event) => onSpecialistChange?.(event.target.value)}
          >
            <option value="">All specialists</option>
            {specialistOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">From</span>
          <input
            type="date"
            className="pd-admin-complaints-control"
            value={fromDate}
            onChange={(event) => onFromDateChange?.(event.target.value)}
          />
        </label>

        <label className="pd-admin-complaints-field">
          <span className="pd-admin-complaints-field-label">To</span>
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
              Clear filters
            </button>
          </div>
        ) : null}
      </div>

      {specialistsError ? (
        <p className="pd-admin-complaints-inline-warning" role="status">
          Specialist filter unavailable: {specialistsError}
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
