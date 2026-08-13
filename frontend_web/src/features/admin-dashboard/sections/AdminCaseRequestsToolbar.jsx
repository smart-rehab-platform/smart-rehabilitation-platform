import { CASE_INTAKE_STATUS_FILTER_OPTIONS } from "../utils/adminCaseRequestsMappers";

export function AdminCaseRequestsToolbar({
  searchQuery,
  statusFilter,
  categoryFilter,
  categoryOptions,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
}) {
  return (
    <section className="pd-admin-case-requests-toolbar pd-section-enter" aria-label="Case requests toolbar">
      <div className="pd-admin-case-requests-heading">
        <h1 className="pd-section-title">Case Requests</h1>
        <p className="pd-section-sub">Review preliminary child case requests and track their current status.</p>
      </div>

      <div className="pd-admin-case-requests-controls">
        <label className="pd-admin-case-requests-search-wrap">
          <span className="pd-sr-only">Search by child name</span>
          <input
            type="search"
            className="pd-admin-case-requests-search"
            placeholder="Search by child name"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="pd-admin-case-requests-filter-wrap">
          <span className="pd-sr-only">Filter by status</span>
          <select
            className="pd-admin-case-requests-filter"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
          >
            <option value="">All Statuses</option>
            {CASE_INTAKE_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-case-requests-filter-wrap">
          <span className="pd-sr-only">Filter by category</span>
          <select
            className="pd-admin-case-requests-filter"
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
