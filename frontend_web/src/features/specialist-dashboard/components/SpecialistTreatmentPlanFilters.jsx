import { TREATMENT_PLAN_FILTERS } from "../utils/specialistTreatmentPlanMappers";

export function SpecialistTreatmentPlanFilters({ selectedFilterId, onChange }) {
  return (
    <div className="pd-specialist-treatment-plan-filters" role="group" aria-label="Treatment plan filters">
      {TREATMENT_PLAN_FILTERS.map((filter) => {
        const isSelected = selectedFilterId === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            className={`pd-specialist-treatment-plan-filter-chip${isSelected ? " is-selected" : ""}`}
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
