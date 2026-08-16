import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale";
import { buildSessionListFilterOptions } from "../utils/specialistSessionsLocalization";

export function SpecialistSessionFilters({
  filterId,
  onFilterChange,
}) {
  const { t } = useLocale();
  const filters = useMemo(() => buildSessionListFilterOptions(t), [t]);

  return (
    <div
      className="pd-specialist-session-filter-row"
      role="tablist"
      aria-label={t("specialist.sessions.filters.ariaLabel")}
    >
      {filters.map((filter) => {
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
