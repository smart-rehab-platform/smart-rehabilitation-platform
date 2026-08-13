import { SESSION_LIST_FILTERS } from "../utils/specialistSessionMappers";

export function SpecialistSessionFilters({
  filterId,
  onFilterChange,
}) {
  return (
    <div className="pd-specialist-session-filter-row" role="tablist" aria-label="Session filters">
      {SESSION_LIST_FILTERS.map((filter) => {
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
