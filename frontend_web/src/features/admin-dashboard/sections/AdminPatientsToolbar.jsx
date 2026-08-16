import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminPatientsLabels } from "../utils/adminPatientsLocalization.js";

export function AdminPatientsToolbar({
  searchQuery,
  conditionFilter,
  conditionOptions,
  onSearchChange,
  onConditionFilterChange,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientsLabels(t), [t]);

  return (
    <section className="pd-admin-patients-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-patients-heading">
        <h1 className="pd-section-title">{labels.title}</h1>
        <p className="pd-section-sub">{labels.subtitle}</p>
      </div>

      <div className="pd-admin-patients-controls">
        <label className="pd-admin-patients-search-wrap">
          <span className="pd-sr-only">{labels.searchAriaLabel}</span>
          <input
            type="search"
            className="pd-admin-patients-search"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="pd-admin-patients-filter-wrap">
          <span className="pd-sr-only">{labels.filterAriaLabel}</span>
          <select
            className="pd-admin-patients-filter"
            value={conditionFilter}
            onChange={(event) => onConditionFilterChange(event.target.value)}
          >
            <option value="">{labels.allConditions}</option>
            {conditionOptions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
