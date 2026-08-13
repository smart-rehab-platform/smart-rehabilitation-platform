import { SESSION_REQUEST_FILTERS } from "../utils/specialistSessionMappers";

export function SpecialistSessionRequestFilters({
  filterId,
  onFilterChange,
}) {
  return (
    <div className="pd-specialist-session-filter-row" role="tablist" aria-label="Session request filters">
      {SESSION_REQUEST_FILTERS.map((filter) => {
        const isActive = filterId === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`pd-specialist-session-filter-chip${isActive ? " is-active" : ""}`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
