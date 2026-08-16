import { useLocale } from "../../../context/useLocale";
import { buildTreatmentPlanFilters } from "../utils/specialistTreatmentPlansLocalization";

export function SpecialistTreatmentPlanFilters({ selectedFilterId, onChange }) {
  const { t } = useLocale();
  const filters = buildTreatmentPlanFilters(t);

  return (
    <div
      className="pd-specialist-treatment-plan-filters"
      role="group"
      aria-label={t("specialist.treatmentPlans.filters.ariaLabel")}
    >
      {filters.map((filter) => {
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
