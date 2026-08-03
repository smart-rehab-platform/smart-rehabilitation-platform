import {
  FEEDBACK_SORT_OPTIONS,
  FEEDBACK_STATUS_FILTER_OPTIONS,
} from "../../utils/parentFeedbackUtils";

export function ReviewFilters({
  search,
  onSearchChange,
  childId,
  onChildChange,
  status,
  onStatusChange,
  sortKey,
  onSortChange,
  children = [],
}) {
  return (
    <div className="pd-task-hub-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-feedback-hub-search">
          Search
        </label>
        <input
          id="pd-feedback-hub-search"
          type="search"
          className="pd-form-input"
          placeholder="Search by exercise title"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-feedback-hub-child">
          Child
        </label>
        <select
          id="pd-feedback-hub-child"
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
        <label className="pd-form-label" htmlFor="pd-feedback-hub-status">
          Status
        </label>
        <select
          id="pd-feedback-hub-status"
          className="pd-form-select"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {FEEDBACK_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-feedback-hub-sort">
          Sort by
        </label>
        <select
          id="pd-feedback-hub-sort"
          className="pd-form-select"
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {FEEDBACK_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
