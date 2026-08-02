import { REPORT_SORT_OPTIONS } from "../../utils/parentReportsUtils";

export function ReportFilters({
  search,
  onSearchChange,
  childId,
  onChildChange,
  reportType,
  onReportTypeChange,
  sortKey,
  onSortChange,
  children = [],
  reportTypeOptions = [],
}) {
  return (
    <div className="pd-task-hub-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-reports-hub-search">
          Search
        </label>
        <input
          id="pd-reports-hub-search"
          type="search"
          className="pd-form-input"
          placeholder="Search by title, child, specialist, or summary"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-reports-hub-child">
          Child
        </label>
        <select
          id="pd-reports-hub-child"
          className="pd-form-select"
          value={childId}
          onChange={(event) => onChildChange(event.target.value)}
        >
          <option value="all">All children</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-reports-hub-type">
          Report type
        </label>
        <select
          id="pd-reports-hub-type"
          className="pd-form-select"
          value={reportType}
          onChange={(event) => onReportTypeChange(event.target.value)}
        >
          {reportTypeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-reports-hub-sort">
          Sort by
        </label>
        <select
          id="pd-reports-hub-sort"
          className="pd-form-select"
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {REPORT_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
