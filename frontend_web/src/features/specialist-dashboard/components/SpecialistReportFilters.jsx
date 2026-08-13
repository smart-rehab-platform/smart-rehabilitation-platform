import { SPECIALIST_REPORT_FILTERS } from "../utils/specialistReportMappers";

export function SpecialistReportFilters({ selectedFilterId, onChange }) {
  return (
    <div className="pd-specialist-report-filters" role="group" aria-label="Report filters">
      {SPECIALIST_REPORT_FILTERS.map((filter) => {
        const isSelected = selectedFilterId === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            className={`pd-specialist-report-filter-chip${isSelected ? " is-selected" : ""}`}
            onClick={() => onChange(filter.id)}
            aria-pressed={isSelected}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
