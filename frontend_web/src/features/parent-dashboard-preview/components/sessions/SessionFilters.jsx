import { SESSION_STATUS_FILTER_OPTIONS } from "../../utils/parentSessionsUtils";

export function SessionFilters({
  search,
  onSearchChange,
  childId,
  onChildChange,
  status,
  onStatusChange,
  children = [],
  showSearch = true,
}) {
  return (
    <div className="pd-task-hub-filters">
      {showSearch ? (
        <div className="pd-task-hub-filter pd-task-hub-filter-search">
          <label className="pd-form-label" htmlFor="pd-sessions-hub-search">
            Search
          </label>
          <input
            id="pd-sessions-hub-search"
            type="search"
            className="pd-form-input"
            placeholder="Search by child or specialist"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      ) : null}

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-sessions-hub-child">
          Child
        </label>
        <select
          id="pd-sessions-hub-child"
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
        <label className="pd-form-label" htmlFor="pd-sessions-hub-status">
          Status
        </label>
        <select
          id="pd-sessions-hub-status"
          className="pd-form-select"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {SESSION_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
