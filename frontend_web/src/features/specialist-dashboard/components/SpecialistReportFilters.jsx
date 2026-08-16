import { useLocale } from "../../../context/useLocale";
import { buildReportFilterOptions } from "../utils/specialistReportsLocalization";

export function SpecialistReportFilters({ selectedFilterId, onChange }) {
  const { t } = useLocale();
  const filters = buildReportFilterOptions(t);

  return (
    <div className="pd-specialist-report-filters" role="group" aria-label={t("specialist.reports.filters.ariaLabel")}>
      {filters.map((filter) => {
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
