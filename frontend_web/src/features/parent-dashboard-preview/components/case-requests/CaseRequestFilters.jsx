import {
  CASE_REQUEST_SORT_OPTIONS,
  CASE_REQUEST_STATUS_FILTER_OPTIONS,
} from "../../utils/parentCaseRequestsUtils";

export function CaseRequestFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortKey,
  onSortChange,
}) {
  return (
    <div className="pd-task-hub-filters pd-case-request-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-case-requests-search">
          Search
        </label>
        <input
          id="pd-case-requests-search"
          type="search"
          className="pd-form-input"
          placeholder="Search request..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-case-requests-status">
          Status
        </label>
        <select
          id="pd-case-requests-status"
          className="pd-form-select"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {CASE_REQUEST_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-case-requests-sort">
          Sort
        </label>
        <select
          id="pd-case-requests-sort"
          className="pd-form-select"
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {CASE_REQUEST_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
