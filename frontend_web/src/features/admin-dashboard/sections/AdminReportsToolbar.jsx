import { useMemo } from "react";
import { Search } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminReportsLabels } from "../utils/adminReportsLocalization.js";

export function AdminReportsToolbar({
  query,
  selectedFilter,
  filterOptions = [],
  onQueryChange,
  onFilterChange,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminReportsLabels(t), [t]);

  return (
    <section className="pd-admin-reports-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-reports-heading">
        <h1 className="pd-section-title">{labels.title}</h1>
        <p className="pd-section-sub">{labels.subtitle}</p>
      </div>

      <label className="pd-admin-reports-search-wrap">
        <span className="pd-sr-only">{labels.searchAriaLabel}</span>
        <Search size={16} className="pd-admin-reports-search-icon" aria-hidden="true" />
        <input
          type="search"
          className="pd-admin-reports-search"
          placeholder={labels.searchPlaceholder}
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
        />
      </label>

      {filterOptions.length > 0 ? (
        <div className="pd-admin-reports-filter-scroll" role="group" aria-label={labels.filterAriaLabel}>
          <div className="pd-admin-reports-filter-row">
            {filterOptions.map((option) => {
              const isSelected = option.id === selectedFilter;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`pd-admin-reports-filter-chip${isSelected ? " is-selected" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => onFilterChange?.(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
