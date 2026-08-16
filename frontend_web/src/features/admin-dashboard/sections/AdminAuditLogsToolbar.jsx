export function AdminAuditLogsToolbar({
  labels,
  userOptions = [],
  actionOptions = [],
  entityOptions = [],
  selectedUserId,
  selectedAction,
  selectedEntity,
  fromDate,
  toDate,
  dateRangeError,
  usersError,
  hasActiveFilters,
  isRefreshing = false,
  onUserChange,
  onActionChange,
  onEntityChange,
  onFromDateChange,
  onToDateChange,
  onClearFilters,
}) {
  return (
    <section className="pd-admin-audit-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-audit-toolbar-top">
        <div className="pd-admin-audit-heading">
          <h1 className="pd-section-title">{labels.title}</h1>
          <p className="pd-section-sub">{labels.subtitle}</p>
        </div>

        <div className="pd-admin-audit-toolbar-actions">
          {isRefreshing ? (
            <span className="pd-admin-audit-refreshing" role="status" aria-live="polite">
              <span className="pd-admin-audit-refresh-spinner" aria-hidden="true" />
              {labels.updating}
            </span>
          ) : null}

          {hasActiveFilters ? (
            <button type="button" className="pd-btn pd-btn-soft" onClick={onClearFilters}>
              {labels.clearFilters}
            </button>
          ) : null}
        </div>
      </div>

      <div className="pd-card pd-card-pad pd-admin-audit-filters">
        <div className="pd-admin-audit-filters-grid">
          <label className="pd-admin-audit-filter-field">
            <span className="pd-admin-audit-filter-label">{labels.filters.user}</span>
            <select
              className="pd-admin-audit-filter"
              value={selectedUserId}
              onChange={(event) => onUserChange(event.target.value)}
            >
              <option value="">{labels.filters.allUsers}</option>
              {userOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {usersError ? (
              <span className="pd-admin-audit-filter-hint" role="status">
                {labels.filters.usersUnavailable}
              </span>
            ) : null}
          </label>

          <label className="pd-admin-audit-filter-field">
            <span className="pd-admin-audit-filter-label">{labels.filters.action}</span>
            <select
              className="pd-admin-audit-filter"
              value={selectedAction}
              onChange={(event) => onActionChange(event.target.value)}
            >
              <option value="">{labels.filters.allActions}</option>
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="pd-admin-audit-filter-field">
            <span className="pd-admin-audit-filter-label">{labels.filters.entity}</span>
            <select
              className="pd-admin-audit-filter"
              value={selectedEntity}
              onChange={(event) => onEntityChange(event.target.value)}
            >
              <option value="">{labels.filters.allEntities}</option>
              {entityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="pd-admin-audit-filter-field">
            <span className="pd-admin-audit-filter-label">{labels.filters.fromDate}</span>
            <input
              type="date"
              className="pd-admin-audit-filter"
              value={fromDate}
              onChange={(event) => onFromDateChange(event.target.value)}
            />
          </label>

          <label className="pd-admin-audit-filter-field">
            <span className="pd-admin-audit-filter-label">{labels.filters.toDate}</span>
            <input
              type="date"
              className="pd-admin-audit-filter"
              value={toDate}
              onChange={(event) => onToDateChange(event.target.value)}
            />
          </label>
        </div>

        {dateRangeError ? (
          <p className="pd-admin-audit-date-error" role="alert">
            {dateRangeError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
