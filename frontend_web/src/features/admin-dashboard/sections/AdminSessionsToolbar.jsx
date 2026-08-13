import { Search } from "lucide-react";
import { SESSION_STATUS_FILTER_OPTIONS } from "../utils/adminSessionsMappers";

export function AdminSessionsToolbar({
  searchQuery,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <section className="pd-admin-sessions-toolbar pd-section-enter" aria-label="Sessions toolbar">
      <div className="pd-admin-sessions-heading">
        <h1 className="pd-section-title">Sessions</h1>
        <p className="pd-section-sub">Manage and track scheduled rehabilitation sessions.</p>
      </div>

      <div className="pd-admin-sessions-controls">
        <label className="pd-admin-sessions-search-wrap">
          <span className="pd-sr-only">Search patient or specialist</span>
          <Search size={16} className="pd-admin-sessions-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="pd-admin-sessions-search"
            placeholder="Search patient or specialist"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="pd-admin-sessions-filter-wrap">
          <span className="pd-sr-only">Filter by status</span>
          <select
            className="pd-admin-sessions-filter"
            value={selectedStatus}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            {SESSION_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
